const URL_API_STAGING = "https://acd-stg.adtimabox.vn/api/v1/";
const KEY_API_STAGING = "8c14fcb121b9d4cbbc432b50537483d817df05cd07f944e107a83a7c891da3c1";
const URL_API_PRODUCTION = "https://acd.adtimabox.vn/api/v1/";
const KEY_API_PRODUCTION = "3f3919b13daf57b34768028e46d0b9358c75a895bbb28702eebaf8798cf87724";
const _ = require("lodash");
const moment = require("moment");
const appConfig = require("../configs");

// const saintGobainModel = require("../modules/saintgobain/models");
class AcdAdtima {
	/** Init token
	 *
	 * @param oaId
	 */
	constructor() {
		this.apiUrl = appConfig.env !== "production" ? URL_API_STAGING : URL_API_PRODUCTION;
		this.apiKey = appConfig.env !== "production" ? KEY_API_STAGING : KEY_API_PRODUCTION;
		this.oaId = "4055269882832372821";
		this.sdLoyaltyId = "test-sd-loyalty-id";
		this.acdId = "test-acd-id";
		this.scope = "adtimabox";
	}

	convertPhoneNumber(phoneNumber) {
		if (phoneNumber.startsWith("0")) {
			return "84" + phoneNumber.slice(1);
		}
		return phoneNumber; // Return as is if it doesn't start with 0
	}

	async eventSubmitProfile(data) {
		try {
			// return true;
			if (_.isObject(data)) {
				const element = data;
				// console.log(data);

				// let data_push = _.reduce(
				// 	obj,
				// 	(result, value, key) => {
				// 		result[key] = value;
				// 		return result;
				// 	},
				// 	{}
				// );

				const data_push = {
					id: element?._id.toString() || "",
					status: element?.status,
					name: element?.fullname,
					zaloName: element?.display_name,
					phone: this.convertPhoneNumber(element?.phone),
					phoneIntl: this.convertPhoneNumber(element?.phone),
					sdLoyaltyId: "test-sd-loyalty-id",
					created: moment(element?.createdAt).format("X"),
					modified: moment(element?.updatedAt).format("X"),
					createdAt: element?.createdAt,
					updatedAt: element?.updatedAt,
					channels: [
						{
							zalo_id_by_app: element?.user_id_by_app,
							zalo_id_by_oa: element?.user_id,
							zalo_name: element?.display_name,
							zalo_avatar: element?.avatar,
							oa_id: this.oaId,
							is_follow: element?.user_is_follower,
							type: "zalo",
						},
					],
					tags: ["other"],
					// address: {
					// 	provinceName: "Thành phố Hà Nội",
					// 	provinceCode: "01",
					// 	districtName: "Quận Ba Đình",
					// 	districtCode: "001",
					// 	wardName: "Phường Phúc Xá",
					// 	wardCode: "00001",
					// 	street: "11 Đoàn Văn Bơ",
					// 	note: "1/11 Đoàn Văn Bơ, Quận 4, TP.HCM",
					// },
				};

				const id_log = await utils.logs.logACD("create", "eventSubmitProfile", data_push);
				const turn_acd_adtima = await helpers.setting.get_value_setting("turn_acd_adtima");
				if (turn_acd_adtima === "off") {
					console.log("---------------------------------------eventSubmitProfile");
					return true;
				}
				let params = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${this.apiKey}`,
					},
					url: `${this.apiUrl}profiles`,
					method: "POST",
					data: data_push,
				};
				const data_log = params;
				// console.log(params, "params");

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "event-submit-profile", "event-submit-profile");

				let result = await helpers.base.http_request(params);
				console.log(result, "result ");
				data_log.result = result;
				helpers.log.writeData(data_log, "event-submit-profile-response", "event-submit-profile-response");
				if (result) {
					utils.logs.logACDUpdate(id_log, result);
				} else {
					console.log("eventSubmitProfile", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return false;
		}
	}
	async eventSubmitActivityLog(action, info, data, browser) {
		try {
			if (_.isObject(data)) {
				let ipv4 = browser?.ip;
				if (browser?.ip.split(",")?.[0]) {
					ipv4 = browser?.ip.split(",")?.[0] || "";
				}
				const element = info;
				const my_data = this.loadDataAction(action, data);
				const data_push = {
					id: element?._id.toString() || "",
					phone: this.convertPhoneNumber(element?.phone),
					sdLoyaltyId: this.sdLoyaltyId || "",
					acdId: this.acdId || "",
					scope: this.scope || "",
					// action: action,
					// data: data,
					ipv4: ipv4 || "",
					userAgent: browser?.userAgent || "",
					type: "normal",
					message: action || "test-message",
					createdAt: data?.createdAt || moment().toISOString(),
					updatedAt: data?.updatedAt || moment().toISOString(),
					note: action || "test-note",
				};
				// console.log(`data_push==>`, data_push);
				// console.log(`my_data==>`, my_data);
				const my_data_push = { ...data_push, ...my_data };
				// console.log(`my_data_push==>`, my_data_push);

				const id_log = await utils.logs.logACD("create", `ActivityLog|${action}`, my_data_push);

				const turn_acd_adtima = await helpers.setting.get_value_setting("turn_acd_adtima");
				if (turn_acd_adtima === "off") {
					console.log("---------------------------------------eventSubmitProfile");
					return true;
				}
				let params = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${this.apiKey}`,
					},
					url: `${this.apiUrl}activities`,
					method: "POST",
					data: my_data_push,
				};
				const data_log = params;

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "event-submit-profile", "event-submit-profile");

				let result = await helpers.base.http_request(params);
				data_log.result = result;
				helpers.log.writeData(data_log, "event-submit-profile-response", "event-submit-profile-response");
				if (result) {
					utils.logs.logACDUpdate(id_log, result);
				} else {
					console.log("eventSubmitProfile", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return false;
		}
	}

	loadDataAction(action, data) {
		try {
			let data_define = {};
			switch (action) {
				// Action oa_opt_in --------------------------------
				case "oa_opt_in":
					data_define = {
						action: "follow",
						data: {
							brand: "milo",
							action: "oa_opt_in",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "general",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action campaign_opt_in --------------------------------
				case "campaign_opt_in":
					data_define = {
						action: "join_campaign",
						data: {
							brand: "milo",
							action: "campaign_opt_in",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action campaign_register --------------------------------
				case "campaign_register":
					data_define = {
						action: "register",
						data: {
							brand: "milo",
							action: "campaign_register",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action campaign_login --------------------------------
				case "campaign_login":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "campaign_login",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action physical_exercises_complete --------------------------------
				case "physical_exercises_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "physical_exercises_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action physical_exercises_reward --------------------------------
				case "physical_exercises_reward":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "physical_exercises_reward",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action physical_exercises_reward_system --------------------------------
				case "physical_exercises_reward_sytem":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "physical_exercises_reward",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action physical_exercises_advance --------------------------------
				case "physical_exercises_advance":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "physical_exercises_advance",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action edu_quiz_complete --------------------------------
				case "edu_quiz_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "edu_quiz_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action edu_quiz_reward --------------------------------
				case "edu_quiz_reward":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "edu_quiz_reward",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action edu_quiz_rewarded_medal --------------------------------
				case "edu_quiz_rewarded_medal":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "edu_quiz_rewarded_medal",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action edu_quiz_advance --------------------------------
				case "edu_quiz_advance":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "edu_quiz_advance",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action survey_complete --------------------------------
				case "survey_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "survey_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action survey_reward --------------------------------
				case "survey_reward":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "survey_reward",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action referral_single_complete --------------------------------
				case "referral_single_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "referral_single_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action referral_multi_complete --------------------------------
				case "referral_multi_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "referral_multi_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "",
							engagement_group: "",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action referral_reward --------------------------------
				case "referral_reward":
					data_define = {
						action: "win_campaign",
						data: {
							brand: "milo",
							action: "referral_reward",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action leaderboard_opt_in --------------------------------
				case "leaderboard_opt_in":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "leaderboard_opt_in",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "user",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action leaderboard_complete --------------------------------
				case "leaderboard_complete":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "leaderboard_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action leaderboard_complete_2 --------------------------------
				case "leaderboard_complete_2":
					data_define = {
						action: "activity_in_campaign_leaderboard_complete",
						data: {
							brand: "milo",
							action: "leaderboard_complete",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action leaderboard_advance --------------------------------
				case "leaderboard_advance":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "leaderboard_advance",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				// Action wrap_up_receive --------------------------------
				case "wrap_up_receive":
					data_define = {
						action: "activity_in_campaign",
						data: {
							brand: "milo",
							action: "wrap_up_receive",
							action_time: data?.updatedAt || moment().toISOString(),
							trigger: "system",
							engagement_group: "campaign",
							campaign_name: "Endurance 2.0",
						},
					};
					break;

				default:
					data_define = {};
					break;
			}
			return data_define;
		} catch (error) {
			return {};
		}
	}
}

module.exports = new AcdAdtima();
