const express = require("express");
const gift = express.Router();
const _ = require("lodash");
const {
	REGISTER_FORM_FIELDS,
	COLLECTIONS,
	share_LOG,
	ERRORS,
	MESSAGES,
	DELIVERY,
	REDIS: { EXCERCISES, EXCERCISE_DETAIL, EXCERCISE_GROUP },
} = require("../../../../configs/constants");
const { checkEmpty, checkPhone } = require("../../../../helpers/campaign_validate");
const miloModal = require("../../../milo/models");
const { ValidationError } = require("../../../../utils/error");
const zaloApi = require("../../../../libs/zalo");
const gift_worker = require("../../worker/index");

const { checkFollow, checkTimeline, checkUserFillForm } = require("../../../../utils/middleware");

gift.post("/open", checkFollow, checkTimeline, async function (req, res) {
	try {
		throw new ValidationError(ERRORS.OPEN_GIFT, {});
		const requestData = helpers.admin.filterXSS(req.body);
		const user = req.user;
		// check user have turn
		const openGift = await miloModal.updateOne(COLLECTIONS.TURN, { status: 0, uid: user?._id, type: "open" }, { status: 1, date_use: helpers.date.now() });
		if (openGift.status == false) throw new ValidationError(ERRORS.OPEN_GIFT, {});
		// open gift card
		const gift = await gift_worker.open_gift({ uid: user?._id, turn: openGift?.msg });
		if (gift?.have_gift == 1) {
			if (gift?.my_gift?.slug_name == "card-10k" && gift?.my_gift?.card_id) {
				gift_worker.topup({ card_id: gift?.my_gift?.card_id });
			}
			// gift_worker.send_zns({ user, gift });
		}
		const result = {
			error: 0,
			message: "Success",
			data: gift,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.post("/draw", checkFollow, checkTimeline, checkUserFillForm, async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.body);
		const user = req.user;
		// check user have turn
		const openGift = await miloModal.updateOne(
			COLLECTIONS.TURN,
			{ status: 0, uid: user?._id },
			{ status: 1, date_used: helpers.date.now() },
			{ sort: { createdAt: -1 }, new: true, upsert: false }
		);
		// console.log(openGift);
		if (openGift.status == false) throw new ValidationError(ERRORS.OPEN_GIFT, {});
		let is_old_user = user?.from == "old" ? true : false;
		const date_info = utils.milo_mu.set_date_play();
		const month = date_info?.month_year;
		const day30Ago = helpers.date.getDayAgo(30);
		// const m_have_turn = await miloModal.findOne(COLLECTIONS.TURN, { uid: user?._id, month: { $nin: [month] } });
		// if (m_have_turn) {
		// 	is_old_user = true;
		// }
		const dateUserJoined = helpers.date.format(user?.createdAt, "YYYY-MM-DD");
		if (dateUserJoined >= day30Ago) {
			is_old_user = false;
		} else {
			is_old_user = true;
		}
		// is_old_user = true;

		// console.log(is_old_user, "is_old_user");
		// open gift card
		const gift = await gift_worker.draw_gift({ uid: user?._id, turn: openGift?.msg, is_old_user });
		// console.log(gift, "gift");
		if (gift?.have_gift == 1) {
			if (appConfig?.env != "develop") {
				if (gift?.my_gift?.slug_name == "card-10k" && gift?.my_gift?.card_id) {
					gift_worker.topup({ card_id: gift?.my_gift?.card_id });
				}
			}
			// if (gift?.my_gift?.slug_name !== "card-10k") {
			// 	gift_worker.send_zns({ user, gift });
			// }
		}
		const m_turn = openGift?.msg;
		const turn_id = m_turn?._id;
		let is_survey = false;
		let is_upload = false;
		let medal = "";
		const cert_id = m_turn.cert_id;
		const challenge = m_turn.challenge;
		const type = m_turn.type;
		const create_turn = helpers.date.format(m_turn?.createdAt, "YYYY-MM-DD");
		// let conditions = { uid: user?._id, month: date_info?.month_year };
		let conditions = { uid: user?._id, date: { $gte: day30Ago } };
		if (type == "challenge") {
			if (challenge == 1 || challenge == 4) {
				// conditions = { ...conditions, from: type, challenge: challenge };

				const survey = await miloModal.findOne(COLLECTIONS.SURVEY, conditions);
				if (!survey && create_turn >= day30Ago) {
					is_survey = true;
				}
			}
			if (challenge == 7) {
				const cert = await miloModal.findOne(COLLECTIONS.CERTIFICATE, { uid: user?._id, _id: cert_id });
				if (cert?.is_upload == false) {
					is_upload = true;
					medal = cert?.medal;
				}
			}
		}
		if (type == "quiz") {
			// conditions = { ...conditions, from: type };
			const survey = await miloModal.findOne(COLLECTIONS.SURVEY, conditions);
			if (!survey && create_turn >= day30Ago) {
				is_survey = true;
			} else {
				// is_upload = true;
				const cert = await miloModal.findOne(COLLECTIONS.CERTIFICATE, { uid: user?._id, _id: cert_id });
				if (cert?.is_upload == false) {
					is_upload = true;
					medal = cert?.medal;
				}
			}
		}
		if (type == "survey" && m_turn.from == "quiz") {
			// conditions = { ...conditions, from: type };
			// const survey = await miloModal.findOne(COLLECTIONS.SURVEY, conditions);
			// if (!survey) {
			// 	is_survey = true;
			// }
			// is_upload = true;
			const cert = await miloModal.findOne(COLLECTIONS.CERTIFICATE, { uid: user?._id, _id: cert_id });
			if (cert?.is_upload == false) {
				is_upload = true;
				medal = cert?.medal;
			}
		}
		// check survey

		const my_survey = {
			turn_id,
			cert_id,
			is_survey,
		};
		const my_image = {
			is_upload,
			cert_id,
			medal,
		};
		const m_challenge = {
			challenge_id: m_turn?.challenge_id,
			challenge,
			type,
			from: m_turn?.from,
		};
		const result = {
			error: 0,
			message: "Success",
			data: { gift, my_survey, my_image, m_challenge },
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "draw");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.get("/my-gift", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const user = req.user;
		let page = 1;
		if (requestData?.page) page = parseInt(requestData?.page);
		page = page < 1 ? 1 : page;
		const limit = parseInt(requestData?.limit) || 6;
		const skip = limit * (page - 1);
		const sort = {
			createdAt: -1,
		};
		const items = await miloModal.find(
			COLLECTIONS.USER_GIFT,
			{ status: 1, uid: user?._id },
			"uid user_id phone name avatar turn_id gift_id gift_name gift_slug_name gift_image date group voucher_info createdAt gift_type delivery_info",
			sort,
			limit,
			skip
		);
		const total = await miloModal.count(COLLECTIONS.USER_GIFT, { status: 1, uid: user?._id });
		const result = {
			error: 0,
			message: "Success",
			data: {
				items,
				total,
				page,
				limit,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "my-gift");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.get("/my-cert", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const user = req.user;
		let page = 1;
		if (requestData.page) page = parseInt(requestData.page);
		page = page < 1 ? 1 : page;
		const limit = 7;
		const skip = limit * (page - 1);
		const sort = {
			createdAt: -1,
		};
		const items = await miloModal.find(COLLECTIONS.CERTIFICATE, { status: 1, uid: user?._id }, "", sort, limit, skip);
		const total = await miloModal.count(COLLECTIONS.CERTIFICATE, { status: 1, uid: user?._id });
		const result = {
			error: 0,
			message: "Success",
			data: {
				items,
				total,
				page,
				limit,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.get("/my-turn", checkTimeline, checkUserFillForm, async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const user = req.user;
		const date_info = utils.milo_mu.set_date_play();
		// const draw = await miloModal.count(COLLECTIONS.TURN, { status: 0, uid: user?._id, month: date_info?.month_year });
		const draw = await miloModal.count(COLLECTIONS.TURN, { status: 0, uid: user?._id });
		const result = {
			error: 0,
			message: "Success",
			data: {
				draw,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.post("/delivery", checkFollow, async function (req, res) {
	try {
		let dataBody = req.body;

		Object.keys(dataBody).forEach((key) => {
			// Check if the field value is a string (you can also add more checks for other types)
			if (typeof dataBody[key] === "string") {
				dataBody[key] = dataBody[key].replace(/[']/g, "");
			}
		});
		// console.log(`==>dataBody`, dataBody);

		const requestData = helpers.admin.filterXSS(dataBody);
		// console.log(`==>requestData`, requestData);
		const user = req.user;
		let listColumns = [...DELIVERY];

		listColumns = listColumns.map((column) => {
			let columnValue = requestData[column.id];
			if (columnValue) columnValue = helpers.admin.filterXSS(typeof columnValue === "string" ? columnValue.trim() : columnValue);
			return { ...column, value: columnValue };
		});

		const listDataValid = [checkEmpty(listColumns)];

		const notValidError = listDataValid.find((error) => error);

		if (notValidError) throw new ValidationError(ERRORS.INVALID_DATA, notValidError);

		const winner_id = requestData?.winner_id;
		const winner = await miloModal.findOne(COLLECTIONS.USER_GIFT, { status: 1, uid: user._id, _id: winner_id, gift_type: "item" });
		// console.log(winner, "winner");
		// if (!winner) throw new ValidationError(ERRORS.NOT_FOUND, winner);

		if (winner?.delivery_address) throw new ValidationError(ERRORS.NOT_FOUND, { msg: "Updated" });
		const requesRegisterData = {
			delivery_address: `${requestData?.address}, ${requestData?.ward}, ${requestData?.district}, ${requestData?.province}`,
			delivery_info: {
				address: requestData?.address,
				ward: requestData?.ward,
				district: requestData?.district,
				province: requestData?.province,
			},
		};

		const { status, msg } = await miloModal.updateOne(COLLECTIONS.USER_GIFT, { _id: winner?._id }, requesRegisterData);
		miloModal.updateOne(COLLECTIONS.USER, { _id: user?._id }, { delivery_address: requesRegisterData?.delivery_address, delivery_info: requesRegisterData?.delivery_info });
		if (status == false) throw new ValidationError(ERRORS.UPDATE_DATA_FAIL, msg);

		const result = {
			error: 0,
			message: "Success",
			data: requestData,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "delivery");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

gift.get("/gift-detail", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const user = req.user;
		let winner_id = requestData.winner_id;
		if (!winner_id) {
			const result = {
				error: 0,
				message: "Success",
				data: {
					item: null,
				},
			};
			return utils.common.response(req, res, result);
		}

		const item = await miloModal.findOne(COLLECTIONS.USER_GIFT, { status: 1, uid: user?._id, _id: winner_id });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "gift-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = gift;
