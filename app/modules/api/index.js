/**
 * API path: /api
 */
const express = require("express");
const { COLLECTIONS } = require("../../configs/constants");
const { default: slugify } = require("slugify");
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

api.get("/create-img", async function (req, res) {
	try {
		const admin_userdata = req.session.admin_userdata;
		if (typeof admin_userdata === "undefined" || admin_userdata === null) {
			return res.json({ status: "Forbidden" });
		}
		const weddingModel = require("../../modules/weddings/models");
		const invitees = await weddingModel.findAll(COLLECTIONS.INVITEE, { link: { $in: ["", null] } });
		for (let index = 0; index < invitees.length; index++) {
			setTimeout(async () => {
				const invitee = invitees[index];
				const img = await helpers.photo.generateCard(invitee?.title, invitee?.name, invitee?.slug_name);
				const link = `https://thiephong.online?to=${invitee?.slug_name}`;
				const qrgen = await helpers.photo.generateQR(link, invitee?.slug_name);
				weddingModel.updateOne(COLLECTIONS.INVITEE, { _id: invitee?._id }, { thumb: img, link: link, qr: qrgen?.name });
			}, index * 3000);
		}

		return res.json({ status: 1, invitees: invitees.length });
	} catch (error) {
		console.log(error, "sssss");

		return res.json({ status: 0 });
	}
});

api.get("/update-slug-name", async function (req, res) {
	try {
		const admin_userdata = req.session.admin_userdata;
		if (typeof admin_userdata === "undefined" || admin_userdata === null) {
			return res.json({ status: "Forbidden" });
		}
		const weddingModel = require("../../modules/weddings/models");
		const invitees = await weddingModel.findAll(COLLECTIONS.INVITEE, { status: 1 });
		for (let index = 0; index < invitees.length; index++) {
			setTimeout(async () => {
				const invitee = invitees[index];
				const slug = invitee?.title + " " + invitee?.name;
				const slug_name = slugify(slug, {
					replacement: "-",
					remove: undefined,
					lower: true,
					strict: false,
					locale: "vi",
					trim: true,
				});
				weddingModel.updateOne(COLLECTIONS.INVITEE, { _id: invitee?._id }, { slug_name: slug_name });
			}, index * 100);
		}

		return res.json({ status: 1, invitees: invitees.length });
	} catch (error) {
		console.log(error, "sssss");

		return res.json({ status: 0 });
	}
});

api.post("/update-invite", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.body);
		let id = requestData.id;
		const weddingModel = require("../../modules/weddings/models");
		weddingModel.updateOne(COLLECTIONS.INVITEE, { _id: id }, { is_copy: true });

		return res.json({ status: 1, invitees: invitees.length });
	} catch (error) {
		console.log(error, "sssss");

		return res.json({ status: 0 });
	}
});

module.exports = api;
