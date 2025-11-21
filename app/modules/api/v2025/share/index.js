const express = require("express");
const share = express.Router();
const _ = require("lodash");
const {
	REGISTER_FORM_FIELDS,
	COLLECTIONS,
	share_LOG,
	ERRORS,
	MESSAGES,
	REDIS: { EXCERCISES, EXCERCISE_DETAIL, EXCERCISE_GROUP },
} = require("../../../../configs/constants");
const { checkEmpty, checkPhone } = require("../../../../helpers/campaign_validate");
const miloModal = require("../../../milo/models");
const { ValidationError } = require("../../../../utils/error");
const zaloApi = require("../../../../libs/zalo");

share.post("/", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.body);
		const user = req.user;
		const type_user = helpers.base.getTypeUser(user?.createdAt);
		const date_info = utils.milo_mu.set_date_play();
		if (!requestData?.link || !requestData?.data) throw new ValidationError(ERRORS.INVALID_DATA, requestData);
		// const countShare = await miloModal.count(COLLECTIONS.SHARE, { uid: user?._id, date: date_info?.date });
		// if (countShare >= 1) throw new ValidationError(ERRORS.SHARE_LIMIT, { countShare });

		const data_share = {
			user: user?._id,
			uid: user?._id,
			user_id: user?.user_id,
			link: requestData?.link,
			from: requestData?.from,
			status: 1,
			date: date_info?.date,
			week: date_info?.week,
			month: date_info?.month_year,
			date_info: date_info,
			data: requestData?.data,
			type: requestData?.type,
			type_user,
		};
		const { status, msg } = await miloModal.create(COLLECTIONS.SHARE, data_share);
		if (!status) throw new ValidationError(ERRORS.CREATE_DATA_FAIL, msg);
		let m_data = requestData?.data;
		let has_turn = false;
		// if (m_data?.type === "completed" && m_data?.cert_id) {
		// 	const cert = await miloModal.findOne(COLLECTIONS.CERTIFICATE, { _id: m_data?.cert_id, is_upload: true, type: "challenge" });
		// 	if (cert && cert?.month == date_info?.month_year) {
		// 		const countTurn = await miloModal.count(COLLECTIONS.TURN, { uid: user?._id, type: "share", month: date_info?.month_year, cert_id: m_data?.cert_id });
		// 		if (countTurn < 1) {
		// 			const data_turn = {
		// 				user: user?._id,
		// 				uid: user?._id,
		// 				user_id: user?.user_id,
		// 				phone: user?.phone,
		// 				name: user?.display_name,
		// 				avatar: user?.avatar,
		// 				type: "share",
		// 				status: 0,
		// 				date: date_info?.date,
		// 				week: date_info?.week,
		// 				month: date_info?.month_year,
		// 				challenge_id: cert?.challenge_id,
		// 				cert_id: cert?._id.toString(),
		// 				challenge: 0,
		// 				from: "share-picture",
		// 			};
		// 			const { status, msg } = await miloModal.create(COLLECTIONS.TURN, data_turn);
		// 			if (status) {
		// 				has_turn = true;
		// 			}
		// 		}
		// 	}
		// }

		const result = {
			error: 0,
			message: "Success",
			data: { has_turn, requestData },
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

share.get("/check-share", async function (req, res) {
	try {
		const user = req.user;
		const date_info = utils.milo_mu.set_date_play();

		const countShare = await miloModal.count(COLLECTIONS.SHARE, { uid: user?._id, date: date_info?.date });

		const result = {
			error: 0,
			message: "Success",
			data: {
				is_share: countShare > 0 ? true : false,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			// error: MESSAGES?.[error?.message]?.CODE || -1,
			// message: MESSAGES?.[error?.message]?.MSG || error.message,
			// data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = share;
