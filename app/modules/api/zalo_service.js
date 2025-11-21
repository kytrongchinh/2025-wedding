const querystring = require("querystring");
const express = require("express");
const helmet = require("helmet");
const { COLLECTIONS } = require("../../configs/constants");

const zalo_service = express.Router();

zalo_service.use(helmet(appConfig.helmet));

zalo_service.get("/", async function (req, res) {
	return res.send("Zalo Service");
});

/** Received POST from zalo
 *
 */
zalo_service.post("/receive_notify", async function (req, res, next) {
	try {
		const miloModel = require("../milo/models");
		const zaloApi = require("../../libs/zalo");
		const moment = require("moment");
		const data = { ...req.body };
		//clog('receive_notify',data);
		//return res.send('received');
		// console.log("received", data);
		const zevent_mac = req.headers["x-zevent-signature"];
		const mac = typeof zevent_mac == "string" ? zevent_mac.replace(/^mac=/, "") : "";

		// check mac and white list
		if (compare_mac(data, mac) === false) {
			return res.end("invalid params");
		}

		const event = data.event_name;
		const info = get_ids_by_event(data);
		const zms_data = {
			event: data.event_name,
			app_id: data.app_id,
			oaid: info.oaid,
			fromuid: info.fromuid,
			msgid: data.message ? data.message.msg_id : "",
			message: data.message ? data.message.text : "",
			timestamp: data.timestamp,
		};

		const data_hook = {
			app_id: data.app_id,
			event_name: data.event_name,
			timestamp: data.timestamp,
			data: data,
			status: 1,
			date: moment().format("YYYY-MM-DD"),
		};

		//add_whitelist
		if (event === "user_send_text" && zms_data.message.indexOf("#whitelist") != -1) {
			//add_whitelist(zms_data);
			return res.send("received");
		}

		//check whitelist
		const is_whitelist = await check_white_list(zms_data.fromuid);
		if (is_whitelist === false) {
			return res.end("invalid params");
		}

		if (event === "user_send_text") {
		} else if (event === "follow") {
			miloModel.create(COLLECTIONS.FOLLOWER, data_hook);
			//update profile
			// console.log(zms_data, "zms_data");
			let user = await miloModel.findOne(COLLECTIONS.USER, { user_id: zms_data.fromuid });
			if (!user) {
				let profile = await zaloApi.getProfileUser(zms_data.fromuid);
				clog(profile,'profile');
				if (profile.error == 0) {
					const data_profile = profile.data;
					const requesRegisterData = {
						user_is_follower: true,
						avatars: data_profile?.avatars,
						tags_and_notes_info: data_profile?.tags_and_notes_info,
						user_id: data_profile?.user_id,
						user_gender: data_profile?.user_gender,
					};
					const { status, msg } = await miloModel.custom.updateUser({ user_id_by_app: data_profile?.user_id_by_app }, requesRegisterData);
				}
			} else {
				const { status, msg } = await miloModel.custom.updateUser({ _id: user?._id }, { user_is_follower: true });
			}
		} else if (event === "unfollow") {
			miloModel.create(COLLECTIONS.FOLLOWER, data_hook);
			//update profile
			const { status, msg } = await miloModel.custom.updateUser({ user_id: zms_data.fromuid }, { user_is_follower: false });
		} else if (event === "user_send_location") {
			//var lat = data.message.attachments[0].payload.coordinates.latitude;
			//var lon = data.message.attachments[0].payload.coordinates.longitude;
		}
		return res.send("received");
	} catch (error) {
		clog(error.message);
		helpers.log.writeError(error.message, "error", "zalo_service");
		return res.send("received");
	}
});

//get oaid, fromuid
const get_ids_by_event = function (data) {
	let r = { oaid: "", fromuid: "" };
	try {
		if (data.event_name.indexOf("user_send_") === 0) {
			r.oaid = data.recipient.id;
			r.fromuid = data.sender.id;
		} else if (data.event_name === "follow" || data.event_name === "unfollow") {
			r.oaid = data.oa_id;
			r.fromuid = data.follower.id;
		} else {
			r.oaid = data.sender.id;
			r.fromuid = data.recipient.id;
		}
	} catch (e) {
		//console.log(e);
	}
	return r;
};

const compare_mac = function (data, mac) {
	if (appConfig.env === "develop") return true;

	if (typeof data === "object" && Object.keys(data).length > 0) {
		let str = data.app_id + JSON.stringify(data) + querystring.escape(data.timestamp) + appConfig.zalo_app.secret_key_oa;
		var string_hash = helpers.hash.sha256(str);
		if (mac != string_hash) {
			var info = get_ids_by_event(data);
			helpers.log.writeError(data, "mac_false", "zalo_service");
			return false;
		}
		return true;
	}
	return false;
};

const check_white_list = async function (fromuid) {
	if (appConfig.env === "dev") return true;

	var check_time = await helpers.campaign.checkTime(fromuid);
	if (check_time == 1) {
		return true;
	}

	var checkWhiteList = await helpers.campaign.checkWhiteList(fromuid);
	if (checkWhiteList) return true;
	helpers.log.writeError(fromuid, "not_in_whitelist", "zalo_service");
	return false;
};

const add_whitelist = function (zms_data) {
	//add white list
	if (zms_data.event == "user_send_text") {
		if (zms_data.message.indexOf("#whitelist") != -1) {
			let data = zms_data.message.split(" ");
			let secret = data[1];
			let phone = data[2];
			if (secret == "CA2GT8BC") {
				helpers.campaign.add_whitelist_test_fromuid(zms_data).then(function (result) {
					if (result == true) {
						//helpers.campaign.add_whitelist_phone_test(phone)
						var zaloApi = new libs.zalo();
						//zaloApi.sendTextMessage(zms_data.fromuid,`Link test: ${_baseUrl}testing?phone=${phone}` );
						zaloApi.sendTextMessage(zms_data.fromuid, `Add whitelist success`);
					}
				});
			}
		}
	}
};

module.exports = zalo_service;
