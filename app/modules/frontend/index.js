const express = require("express");
const frontend = express();
frontend.set("views", _basepath + "app/views/frontend/");

frontend.get("/", async function (req, res) {
	try {
		// res.send("Hello World");
		// return res.redirect("https://zalo.me/s/868938787760554822/");
		const queryParams = req.query;

		// Tạo URL mới
		const newBaseUrl = "https://zalo.me/s/868938787760554822"; // URL bạn muốn redirect
		const newUrl = new URL(newBaseUrl);

		// Thêm tất cả query params vào URL mới
		Object.keys(queryParams).forEach((key) => {
			newUrl.searchParams.set(key, queryParams[key]);
		});
		console.log("Redirecting to:", newUrl.toString());
		return res.redirect(newUrl.toString());
		res.render("index");
	} catch (error) {
		console.log(error);
	}
});

module.exports = frontend;
