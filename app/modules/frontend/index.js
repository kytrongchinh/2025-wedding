const express = require("express");
const frontend = express();
frontend.set("views", _basepath + "app/views/frontend/");
const weddingModel = require("../weddings/models");
const { COLLECTIONS } = require("../../configs/constants");
frontend.get("/", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const queryParams = req.query;

		// Tạo URL mới
		const newBaseUrl = "https://zalo.me/s/868938787760554822";
		const newUrl = new URL(newBaseUrl);

		// Nếu có param "to" → đổi thành "name"
		if (queryParams.to) {
			newUrl.searchParams.set("name", queryParams.to);
		}

		// Nếu bạn muốn copy các param khác nữa:
		Object.keys(queryParams).forEach((key) => {
			if (key !== "to") {
				newUrl.searchParams.set(key, queryParams[key]);
			}
		});

		const invitee = await weddingModel.findOne(COLLECTIONS.INVITEE, { status: 1, slug_name: requestData?.to });
		if (invitee) {
			res.locals.ogTitle = `Thiệp mời gửi đến ${invitee?.title} ${invitee?.name}`;
			res.locals.ogDesc = "Nhà vui trăng sáng - Có đôi nên nghĩa - Hỷ kết duyên lành";
			res.locals.ogImg = `${_staticUrl}${invitee?.thumb}?v=${_versionCache}`;
			res.locals.ogUrl = newUrl.toString();
		}
		const in_mobile = helpers.base.inMobile(req);
		const data = {
			in_mobile,
			link: newUrl.toString(),
			invitee: invitee,
		};
		if (in_mobile) {
			// return res.redirect(newUrl.toString());
		}
		res.render("index", data);
	} catch (error) {
		console.log(error);
	}
});

module.exports = frontend;
