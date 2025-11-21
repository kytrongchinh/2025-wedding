const express = require("express");
const user = express.Router();
const { REGISTER_FORM_FIELDS, COLLECTIONS, ERRORS, MESSAGES, USER_DELIVERY, UPDATE_USER_FORM_FIELDS } = require("../../../../configs/constants");
const { checkEmpty, checkPhone } = require("../../../../helpers/campaign_validate");
const miloModal = require("../../../../modules/milo/models");
const { ValidationError } = require("../../../../utils/error");
const zaloApi = require("../../../../libs/zalo");

const { checkFollow, checkTimeline, checkUserFillForm } = require("../../../../utils/middleware");
const AcdAdtimate = require("../../../../libs/acdadtima");
const { ACD } = require("../../../../configs/constants");
user.get("/", async function (req, res) {
	try {
		const user = req.user;

		const result = {
			error: 0,
			message: "Success",
			data: user,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: -1,
			message: "Error: " + error.message,
			data: null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/update", checkTimeline, async function (req, res) {
	try {
		const user = req.user;
		// console.log(user, "user");
		if (user?.phone && user?.user_id && user?.birthdate && user?.birthdate_child && user?.is_fill_form) {
			throw new ValidationError(ERRORS.INVALID_DATA, {});
		}
		const requestData = helpers.admin.filterXSS(req.body);
		let listColumns = [...REGISTER_FORM_FIELDS];

		listColumns = listColumns.map((column) => {
			let columnValue = requestData[column.id];
			if (columnValue) columnValue = helpers.admin.filterXSS(typeof columnValue === "string" ? columnValue.trim() : columnValue);
			return { ...column, value: columnValue };
		});

		const listDataValid = [checkEmpty(listColumns), checkPhone(listColumns)];

		const notValidError = listDataValid.find((error) => error);

		if (notValidError) throw new ValidationError(ERRORS.INVALID_DATA, notValidError);

		const isExistUserPhone = await miloModal.findOne(COLLECTIONS.USER, { phone: requestData?.phone, user_id_by_app: { $nin: [user?.user_id_by_app] } });
		// const isExistUserPhone = await miloModal.findOne(COLLECTIONS.USER, { phone: requestData?.phone });
		if (isExistUserPhone) throw new ValidationError(ERRORS.PHONE_USED, { phone: requestData?.phone });

		const requesRegisterData = {};

		listColumns.forEach((col) => {
			requesRegisterData[col.id] = col.value;
		});
		if (requestData?.cmp_info) {
			requesRegisterData["cmp_info"] = requestData?.cmp_info;
		}
		if (requestData?.consent_info) {
			requesRegisterData["consent_info"] = requestData?.consent_info;
		}
		if (requestData?.mparams) {
			requesRegisterData["mparams"] = requestData?.mparams;
		}
		requesRegisterData.is_fill_form = true;
		if (user?.display_name == "") {
			requesRegisterData.display_name = requestData?.fullname;
		}
		// update user profile
		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);
		libs.cshub.eventCreatUser(msg);
		AcdAdtimate.eventSubmitProfile(msg);
		AcdAdtimate.eventSubmitActivityLog(ACD.campaign_register, msg, msg, helpers.base.lastLogin(req));
		const result = {
			error: 0,
			message: "Success",
			data: msg,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		// console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/follow", async function (req, res) {
	try {
		const user = req.user;
		const requestData = helpers.admin.filterXSS(req.body);
		const user_id = requestData?.user_id;
		if (user?.user_id) {
			const result = {
				error: 0,
				message: "Success",
				data: user_id,
			};
			return utils.common.response(req, res, result);
		}
		const profile = await zaloApi.getProfileUser(user?.user_id_by_app);
		if (profile?.error != 0 || profile?.data?.user_id != user_id) throw new ValidationError(ERRORS.FOLLOWER_USER, profile);

		const data_profile = profile.data;
		const requesRegisterData = {
			user_is_follower: true,
			avatars: data_profile?.avatars,
			tags_and_notes_info: data_profile?.tags_and_notes_info,
			user_id: user_id,
			user_gender: data_profile?.user_gender,
		};
		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);

		const result = {
			error: 0,
			message: "Success",
			data: user_id,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		// console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/follow-new", async function (req, res) {
	try {
		const user = req.user;
		// if (user?.user_id) {
		// 	const result = {
		// 		error: 0,
		// 		message: "Success",
		// 		data: user,
		// 	};
		// 	return utils.common.response(req, res, result);
		// }

		const profile = await zaloApi.getProfileUser(user?.user_id_by_app);

		const data_profile = profile.data;
		const requesRegisterData = {
			user_is_follower: true,
			avatars: data_profile?.avatars,
			tags_and_notes_info: data_profile?.tags_and_notes_info,
			user_id: data_profile?.user_id,
			user_gender: data_profile?.user_gender,
		};
		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);

		const my_user = { ...user, user_is_follower: true, user_id: msg.user_id };
		if (user?.phone) {
			AcdAdtimate.eventSubmitActivityLog(ACD.campaign_opt_in, user, user, helpers.base.lastLogin(req));
		}
		const result = {
			error: 0,
			message: "Success",
			data: my_user,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		// console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/delivery", checkFollow, async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.body);
		const user = req.user;
		let listColumns = [...USER_DELIVERY];

		listColumns = listColumns.map((column) => {
			let columnValue = requestData[column.id];
			if (columnValue) columnValue = helpers.admin.filterXSS(typeof columnValue === "string" ? columnValue.trim() : columnValue);
			return { ...column, value: columnValue };
		});

		const listDataValid = [checkEmpty(listColumns), checkPhone(listColumns, "delivery_phone")];

		const notValidError = listDataValid.find((error) => error);

		if (notValidError) throw new ValidationError(ERRORS.INVALID_DATA, notValidError);

		const requesRegisterData = {};

		listColumns.forEach((col) => {
			if (col.id != "winner_id") {
				requesRegisterData[col.id] = col.value;
			}
		});
		requesRegisterData.delivery_info = { ...requesRegisterData };

		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);

		const my_user = { ...user, delivery_info: requesRegisterData.delivery_info };
		const result = {
			error: 0,
			message: "Success",
			data: my_user,
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

user.post("/get-phone-mini", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.body);
		const endpoint = "https://graph.zalo.me/v2.0/me/info";
		const userAccessToken = requestData?.access_token;
		const token = requestData?.code;
		const secretKey = appConfig?.zalo_app?.secret_key;
		const params = {
			url: endpoint,
			headers: {
				access_token: userAccessToken,
				code: token,
				secret_key: "Su2SRp2TXGxojjYQ25M4",
			},
			method: "GET",
		};
		// console.log(params, "params");
		const response = await helpers.base.http_request(params);
		// console.log(response, "response");
		const result = {
			error: 0,
			message: "Success",
			data: response,
		};

		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "error");
		const result = {
			// error: MESSAGES?.[error?.message]?.CODE || -1,
			// message: MESSAGES?.[error?.message]?.MSG || error.message,
			// data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/update-quiz", checkTimeline, checkUserFillForm, async function (req, res) {
	try {
		const user = req.user;

		const requestData = helpers.admin.filterXSS(req.body);

		const requesRegisterData = {};

		if (requestData?.quiz_cmp_info && requestData?.quiz_consent_info) {
			requesRegisterData["quiz_cmp_info"] = requestData?.quiz_cmp_info;
			requesRegisterData["quiz_consent_info"] = requestData?.quiz_consent_info;
			requesRegisterData["is_consert_quiz"] = true;
		} else {
			throw new ValidationError(ERRORS.INVALID_DATA, requesRegisterData);
		}

		// update user profile
		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);
		// libs.cshub.eventCreatUser(msg);
		const result = {
			error: 0,
			message: "Success",
			data: msg,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		// console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

user.post("/update-user-data", checkTimeline, checkUserFillForm, async function (req, res) {
	try {
		const user = req.user;

		const requestData = helpers.admin.filterXSS(req.body);
		let listColumns = [...UPDATE_USER_FORM_FIELDS];

		listColumns = listColumns.map((column) => {
			let columnValue = requestData[column.id];
			if (columnValue) columnValue = helpers.admin.filterXSS(typeof columnValue === "string" ? columnValue.trim() : columnValue);
			return { ...column, value: columnValue };
		});

		const listDataValid = [checkEmpty(listColumns)];

		const notValidError = listDataValid.find((error) => error);

		if (notValidError) throw new ValidationError(ERRORS.INVALID_DATA, notValidError);

		const requesRegisterData = {};

		listColumns.forEach((col) => {
			requesRegisterData[col.id] = col.value;
		});

		// update user profile
		const { status, msg } = await miloModal.custom.updateUser({ _id: user?._id }, requesRegisterData);
		if (!status) throw new ValidationError(ERRORS.UPDATE_USER_FAIL, msg);
		// libs.cshub.eventCreatUser(msg);

		const result = {
			error: 0,
			message: "Success",
			data: msg,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		// console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = user;
