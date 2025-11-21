const express = require("express");
const login = express.Router();
const { ValidationError } = require("../../../../utils/error");
const { ERRORS, MESSAGES, COLLECTIONS } = require("../../../../configs/constants");
const zaloApi = require("../../../../libs/zalo");
const miloModel = require("../../../../modules/milo/models");

const AcdAdtimate = require("../../../../libs/acdadtima");
const { ACD } = require("../../../../configs/constants");
const loginMdw = (req, res, next) => {
	try {
		const miniAppAccessToken = req.body.miniAppAccessToken;
		if (!miniAppAccessToken) throw new ValidationError(ERRORS.MISSING_DATA, { miniAppAccessToken });
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

login.post("/", loginMdw, async function (req, res) {
	try {
		let post_data = { ...req.body };
		Object.keys(post_data).forEach((key) => {
			post_data[key] = helpers.admin.filterXSS(post_data[key]);
		});
		const userInfo = await zaloApi.getProfileUserByAccessToken(post_data?.miniAppAccessToken);
		if (!userInfo?.id) throw new ValidationError(ERRORS.NOT_AUTHORIZED, { userInfo });
		const date_info = utils.milo_mu.set_date_play();
		// find user
		const user = await miloModel.custom.getUserByAppId(userInfo?.id);
		if (user) {
			if (userInfo?.picture?.data?.url != user?.avatar || userInfo?.name != user?.display_name) {
				const data_update = { avatar: userInfo?.picture?.data?.url, display_name: userInfo?.name || "" };
				const { msg, status } = await miloModel.custom.updateUser({ _id: user?._id }, data_update);
				if (!status) throw new ValidationError(ERRORS.CREATE_USER, { msg });
				utils.logs.logReceive(req, user, "login-update-info", { status }, data_update);
			} else {
				utils.logs.logReceive(req, user, "login-re", { status: true });
			}
			const expiresIn = "1h";
			const token = libs.jwt.signToken(userInfo?.id, expiresIn);
			const expiredTime = libs.jwt.expiredTime(token);
			const result = {
				error: 0,
				message: "Success",
				data: { accessToken: token, expiredTime: expiredTime },
			};
			if (user?.phone) {
				AcdAdtimate.eventSubmitActivityLog(ACD.campaign_login, user, user, helpers.base.lastLogin(req));
			}

			return utils.common.response(req, res, result);
		}

		const new_user = {
			user_id: "",
			user_id_by_app: userInfo?.id,
			display_name: userInfo?.name,

			fullname: userInfo?.name,
			phone: "",
			level: 0,
			is_sensitive: userInfo?.is_sensitive,
			user_is_follower: false,
			avatar: userInfo?.picture?.data?.url,
			status: 1,
			from: "new",
			date: date_info?.date,
			month: date_info?.month_year,
		};

		const profile = await zaloApi.getProfileUser(userInfo?.id);
		console.log(`profile==>`, profile);
		if (!profile?.error) {
			new_user.user_id = profile?.data?.user_id;
			new_user.user_is_follower = true;
			new_user.avatars = profile?.data?.avatars;
			new_user.tags_and_notes_info = profile?.data?.tags_and_notes_info;
			// new_user.user_gender = profile?.data?.user_gender;
		}
		const { msg = null, status = false } = await miloModel.create(COLLECTIONS.USER, { ...new_user });
		if (!status) throw new ValidationError(ERRORS.CREATE_USER, { msg });
		utils.logs.logReceive(req, msg, "login-first", { status });
		const expiresIn = "2h";
		const token = libs.jwt.signToken(userInfo?.id, expiresIn);
		const expiredTime = libs.jwt.expiredTime(token);
		const result = {
			error: 0,
			message: "Success",
			data: { accessToken: token, expiredTime: expiredTime },
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error);
		const result = {
			error: MESSAGES?.[error?.message]?.CODE,
			message: MESSAGES?.[error?.message]?.MSG,
			// data: error?.data,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = login;
