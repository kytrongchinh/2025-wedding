/**
 * API path: /api
 */
const express = require("express");
const api = express();
api.use("/v2025", require("./v2025/index"));
api.use("/zalo_service", require("./zalo_service"));
api.post("/apply_setting", async function (req, res) {
	const admin_userdata = req.session.admin_userdata;
	if (typeof admin_userdata === "undefined" || admin_userdata === null) {
		return res.json({ status: "Forbidden" });
	}

	req.session.menu_layout = req.body.zsl_menu;
	req.session.language = req.body.zsl_language;
	const i18n = require("../../configs/i18n.config");
	i18n.setLocale(req.session.language);
	// console.log(i18n.getLocale(), "sssssssssss");
	res.setLocale(req.session.language);
	// req.session.admin_menu = await helpers.admin.menus(req.session.admin_userdata.role)
	return res.json({ status: 1 });
});

module.exports = api;
