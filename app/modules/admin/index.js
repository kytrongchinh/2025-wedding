"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");

const { generateUniqueSecret, verifyOTPToken, generateOTPToken, generateQRCode } = require("../../helpers/au2fa");

const adminModel = require("../admin/models");

const admin = express();
admin.set("views", _basepath + "app/views");

admin.use(cors(appConfig.cors));
admin.use(helmet(appConfig.helmet));

//============================= LOAD RESOURCES ===================================//
adminModel.findAll("adminResources", { module: "admin" }, "name", {}, function (result) {
	if (result.length > 0) {
		result.forEach(function (resource) {
			admin.use(
				`/${resource.name}`,
				rateLimit(appConfig.rateLimiter),
				//helpers.base.sanitizersQuery,
				helpers.admin.authAdmin,
				require(`./routes/${resource.name}`)
			);
		});
	}
});
//================================ END RESOURCES =================================//

admin.get("/", function (req, res) {
	return helpers.base.redirect(res, `${appConfig.adminRouter}/dashboard`);
});

admin.get("/logout", function (req, res) {
	req.session.admin_userdata = null;
	return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
});

admin.get("/no_permission", function (req, res) {
	if (req.session.admin_userdata) {
		let dataView = helpers.admin.get_data_view_admin(req);
		return res.render("./admin/no_permission", dataView);
	} else {
		return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
	}
});

//login page
admin.get("/login", function (req, res) {
	if (req.session.admin_userdata) {
		return helpers.base.redirect(res, `${appConfig.adminRouter}/dashboard`);
	}

	let dataView = helpers.admin.get_data_view_admin(req);
	res.render("./admin/login", dataView);
});

/**
 * Post login
 */
admin.post("/login", async function (req, res) {
	let dataResponse = { error: 1, msg: "Account or password incorrect", data: {} };
	try {
		const postData = { ...req.body };
		//check captcha
		const captcha = ["dev", "develop", "staging"].includes(appConfig.env) !== true ? await helpers.admin.check_recaptcha(postData["grecaptcha"]) : { success: true };
		if (!captcha || captcha.success !== true) {
			dataResponse.msg = `Please confirm you are not robot`;
			return res.status(200).json(dataResponse);
		}

		const username = postData.username;
		const password = postData.password;
		const validator = new helpers.validate();
		validator.isFormatUsername(username, "Username incorrect");
		validator.isFormatPassword(password, "Password incorrect");
		const errors = validator.hasErrors();
		if (errors?.length > 0) {
			return res.status(200).json(dataResponse);
		}

		//get user
		let where = { username: username };
		let user = await adminModel.findOne("adminUsers", where);
		if (!user) {
			return res.status(200).json(dataResponse);
		}

		//check block and reset
		if (user.login_incorrect >= appConfig.login.incorrect) {
			let time_block = user.login_time;
			let current_time = new Date().getTime();
			let remand_time = current_time - time_block;
			if (remand_time >= appConfig.login.block_time) {
				//reset time block
				await adminModel.updateOne("adminUsers", where, { login_incorrect: 0, login_time: 0 });
			} else {
				//blocking
				dataResponse.msg = `Account is blocking`;
				return res.status(200).json(dataResponse);
			}
		}

		//check password
		let checkPassword = await helpers.hash.check_password(password, user.password);
		if (checkPassword !== true) {
			await adminModel.updateOne("adminUsers", where, { $inc: { login_incorrect: 1 }, login_time: new Date().getTime() });
			return res.status(200).json(dataResponse);
		}

		if (user.status !== true) {
			dataResponse.msg = `Account was disabled`;
			return res.status(200).json(dataResponse);
		}

		let secretVerify2fa = helpers.base.random(20, 5);
		req.session.verify2fa = secretVerify2fa;
		dataResponse.data.secretVerify2fa = secretVerify2fa;
		dataResponse.error = 0;

		//check is2FAEnabled for show QRCode
		if (user.is2FAEnabled !== true) {
			const serviceName = appConfig.campaignName || "campaign";
			let secret2FA = "";
			if (user.secret2FA) {
				secret2FA = user.secret2FA;
			} else {
				secret2FA = generateUniqueSecret();
				await adminModel.updateOne("adminUsers", where, { secret2FA: secret2FA });
			}

			const otpAuth = generateOTPToken(user.username, serviceName, secret2FA);
			// otpauth://totp/localhost.com:username?secret=GYCCWGRLDY3RAFBU&period=30&digits=6&algorithm=SHA1&issuer=username
			// Tạo ảnh QR Code để gửi về client
			const QRCodeImage = await generateQRCode(otpAuth);
			dataResponse.msg = `Account has not enabled 2-factor authentication`;
			dataResponse.data.is2FAEnabled = user.is2FAEnabled;
			dataResponse.data.QRCodeImage = QRCodeImage;
			return res.status(200).json(dataResponse);
		}

		//require verify 2fa
		dataResponse.msg = `Please input verify code`;
		return res.status(200).json(dataResponse);
	} catch (e) {
		clog(e.message);
		dataResponse.msg = `An error occurred, please try again later`;
		return res.status(200).json(dataResponse);
	}
});

//Verify2FA
admin.post("/verify-2fa", async function (req, res) {
	let dataResponse = { error: 1, msg: "Invalid OTP Token", data: {} };
	try {
		const verify2fa = req.session.verify2fa;
		if (verify2fa) {
			const postData = { ...req.body };
			if (postData.secretVerify2fa !== verify2fa) {
				await adminModel.updateOne("adminUsers", where, { $inc: { login_incorrect: 1 }, login_time: new Date().getTime() });
				return res.status(200).json(dataResponse);
			}

			//get user
			let where = { username: postData.username };
			let user = await adminModel.findOne("adminUsers", where);
			if (!user) {
				await adminModel.updateOne("adminUsers", where, { $inc: { login_incorrect: 1 }, login_time: new Date().getTime() });
				return res.status(200).json(dataResponse);
			}
			let checkPassword = await helpers.hash.check_password(postData.password, user.password);
			if (checkPassword !== true) {
				await adminModel.updateOne("adminUsers", where, { $inc: { login_incorrect: 1 }, login_time: new Date().getTime() });
				return res.status(200).json(dataResponse);
			}

			//check block
			if (user.login_incorrect >= appConfig.login.incorrect) {
				let time_block = user.login_time;
				let current_time = new Date().getTime();
				let remand_time = current_time - time_block;
				if (remand_time >= appConfig.login.block_time) {
					//reset time block
					await adminModel.updateOne("adminUsers", where, { login_incorrect: 0, login_time: 0 });
				} else {
					//blocking
					dataResponse.msg = `Account is blocking`;
					return res.status(200).json(dataResponse);
				}
			}

			if (["dev", "develop", "staging"].includes(appConfig.env) === false) {
				//verify otp token
				const isValid = verifyOTPToken(postData.otpToken, user.secret2FA);
				if (!isValid) {
					//count invalid
					await adminModel.updateOne("adminUsers", where, { $inc: { login_incorrect: 1 }, login_time: new Date().getTime() });
					return res.status(200).json(dataResponse);
				}
			}

			//successful
			let permissions = [];
			if (user.role !== "root") {
				permissions = await adminModel.findAll("adminPermissions", { role: user.role }, "-_id role module resource permissions");
			}

			//login info
			let loginInfo = {
				login_incorrect: 0,
				login_time: new Date().getTime(),
				is2FAEnabled: true,
			};

			await adminModel.updateOne("adminUsers", where, loginInfo);

			//set data login to session
			req.session.admin_userdata = {
				user_id: user._id,
				username: user.username,
				fullname: user.fullname,
				role: user.role,
				phone: user.phone,
				avatar: user.avatar,
				list_perms: permissions,
			};
			//set data menu to session
			req.session.admin_menu = await helpers.admin.menus(user.role);

			helpers.log.tracking(req);
			dataResponse.error = 0;
			dataResponse.msg = `Login success`;
			return res.status(200).json(dataResponse);
		}
		return res.status(200).json(dataResponse);
	} catch (e) {
		clog(e.message);
		dataResponse.msg = `An error occurred, please try again later`;
		return res.status(200).json(dataResponse);
	}
});

module.exports = admin;
