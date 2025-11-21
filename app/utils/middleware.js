const moment = require("moment");
const { ValidationError } = require("../utils/error");
// const miloModel = require("../modules/milo/models");
const { ERRORS, MESSAGES, COLLECTIONS } = require("../configs/constants");

const checkTimeline = async (req, res, next) => {
	// return next();
	try {
		const startAt = await helpers.setting.get_value_setting("date_live");
		const endAt = await helpers.setting.get_value_setting("date_end");
		const curentAt = moment().format("YYYY-MM-DD HH:mm:ss");

		if (startAt > curentAt) {
			throw new ValidationError(ERRORS.CAMPAIGN_NO_START, { startAt, curentAt });
		}
		if (curentAt > endAt) {
			throw new ValidationError(ERRORS.CAMPAIGN_END, { endAt, curentAt });
		}
		const user = req?.user;
		if (user && user?.phone) {
			const is_test = await helpers.setting.get_value_setting("is_test");
			if (is_test == "yes") {
				const phones_test = await helpers.setting.get_value_setting("phones_test");

				const list_phone = phones_test ? phones_test.split(",") : [];
				// console.log(`list_phone==>`, list_phone);
				const phone_test = user?.phone;
				// console.log(`phone_test==>`, phone_test);
				let is_valid = false;
				if (list_phone.some((p) => p == phone_test)) {
					is_valid = true;
				}
				if (is_valid == false) {
					throw new ValidationError(ERRORS.MISSING_DATA, {});
				}
			}
		}

		return next();
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};

const checkLoginToken = async (req, res, next) => {
	try {
		const loginToken = req?.headers?.login_token;

		if (!loginToken) throw new ValidationError(ERRORS.MISSING_DATA, { loginToken });
		const decodeData = await libs.jwt.verifyToken(loginToken);
		if (!decodeData) throw new ValidationError(ERRORS.INVALID_TOKEN, { decodeData });
		const user = await miloModel.custom.getUserByAppId(decodeData);
		if (!user) throw new ValidationError(ERRORS.NOT_FOUND, { user });

		req.user = user;
		return next();
	} catch (error) {
		console.log(error, "error");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};

const checkFollow = async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) throw new ValidationError(ERRORS.NOT_FOUND, { user });
		if (!user?.user_is_follower || !user.user_id) throw new ValidationError(ERRORS.FOLLOWER_USER, { user });
		return next();
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			// data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};

// const checkBlock = async (req, res, next) => {
// 	try {
// 		const user = req.user;
// 		const blockLevel = req.user.block_level;
// 		if (blockLevel) {
// 			if (blockLevel === 4) return res.status(400).send(ERRORS.BLOCK_USER);
// 			const redisKey = "user_block_" + user.zid_app;
// 			const isContinueBlock = await libs.redis.get(redisKey);
// 			console.log("isContinueBlock", isContinueBlock);
// 			if (isContinueBlock) return res.status(400).send(ERRORS.BLOCK_USER);
// 		}

// 		return next();
// 	} catch (error) {
// 		const result = {
// 			error: MESSAGES?.[error?.message]?.CODE,
// 			message: MESSAGES?.[error?.message]?.MSG,
// 			// data: error?.data,
// 		};
// 		return utils.common.response(req, res, result, 400);
// 	}
// };

const checkAuthen = async (req, res, next) => {
	try {
		const user = req.user;
		if (user?.authentication !== 2) throw new ValidationError(ERRORS.FOLLOWER_USER, { user });
		return next();
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			// data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};

const checkUserFillForm = async (req, res, next) => {
	try {
		const _ = require("lodash");
		const user = req.user;
		// console.log(`==>`, user);
		if (!user?.phone || !user?.birthdate || !user?.birthdate_child || user?.is_fill_form == false) throw new ValidationError(ERRORS.MISSING_DATA, { user });
		return next();
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			// data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};
const checkQuizCMP = async (req, res, next) => {
	try {
		const _ = require("lodash");
		const user = req.user;
		if (user?.is_consert_quiz == false || user?.is_fill_form == false) throw new ValidationError(ERRORS.MISSING_DATA, { user });
		return next();
	} catch (error) {
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			// data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
};

module.exports = {
	checkTimeline,
	checkLoginToken,
	checkFollow,
	// checkBlock,
	checkAuthen,
	checkUserFillForm,
	checkQuizCMP,
};
