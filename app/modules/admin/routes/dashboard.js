"use strict";

const express = require("express");
const moment = require("moment");
const adminModel = require("../models");
const _ = require("lodash");
const dashboard = express.Router();

dashboard.get("/", async function (req, res) {
	try {
		let dataView = helpers.admin.get_data_view_admin(req);
		// count total user

		// console.log(dataView, "dataView");
		return res.render("./admin/dashboard/dashboard", dataView);
	} catch (error) {
		console.log(error, "error");
	}
});

//get update profile
dashboard.get("/update-profile", async function (req, res) {
	let admin_userdata = req.session.admin_userdata;
	if (!admin_userdata || helpers.base.typeof(admin_userdata) !== "object") {
		return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
	}
	let record = await adminModel.findOne("adminUsers", { username: admin_userdata.username });
	let dataView = helpers.admin.get_data_view_admin(req);
	dataView.data_edit = dataView.post_data.length > 0 ? dataView.post_data[0] : record;
	return res.render("./admin/dashboard/update_profile", dataView);
});

//post update profile
dashboard.post("/update-profile", async function (req, res) {
	try {
		let admin_userdata = req.session.admin_userdata;
		if (!admin_userdata || helpers.base.typeof(admin_userdata) !== "object") {
			return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
		}

		let postData = { ...req.body };
		let validator = new helpers.validate();
		validator.notEmpty(postData.fullname, "Họ tên không được bỏ trống");
		let valid_error = validator.hasErrors();
		if (valid_error?.length > 0) {
			req.flash("valid_errors", valid_error);
			return helpers.base.redirect(res, "admin/dashboard/update-profile");
		}
		let fullname = helpers.base.sanitization(postData.fullname);
		let updateData = {
			fullname: fullname,
			update_by: helpers.admin.get_update_by(req),
		};

		if (postData.update_password == 1) {
			validator.notEmpty(postData.old_password, "Nhập mật khẩu cũ");
			validator.isFormatPassword(postData.new_password, "Mật khẩu phải từ 6-30 ký tự, tối thiểu 1 chữ hoa, 1 chữ thường, 1 chữ số");
			validator.equals(postData.new_password, postData.retype_password, "Mật khẩu xác nhận lại không chính xác");
			valid_error = validator.hasErrors();
			if (valid_error?.length > 0) {
				req.flash("valid_errors", valid_error);
				return helpers.base.redirect(res, `${appConfig.adminRouter}/dashboard/update-profile`);
			}

			let user = await adminModel.findOne("adminUsers", { username: admin_userdata.username });
			if (user) {
				let checkPassword = await helpers.hash.check_password(postData.old_password, user.password);
				if (checkPassword !== true) {
					req.flash("valid_errors", "Mật khẩu cũ không chính xác.");
					return helpers.base.redirect(res, `${appConfig.adminRouter}/dashboard/update-profile`);
				}
				updateData.password = await helpers.hash.hash_password(postData.new_password);
			} else {
				req.flash("msg_error", "User not found.");
				return helpers.base.redirect(res, "");
			}
		}

		let conditions = {
			username: admin_userdata.username,
		};

		let update = await adminModel.updateOne("adminUsers", conditions, updateData);
		if (update.status) {
			req.flash("msg_success", "Update profile success");
			req.flash("post_data", null);
			req.session.admin_userdata = null;
			return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
		} else {
			req.flash("valid_errors", update.msg);
		}
		return helpers.base.redirect(res, `${appConfig.adminRouter}/dashboard/update-profile`);
	} catch (e) {
		console.log(e.message);
		return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
	}
});

module.exports = dashboard;
