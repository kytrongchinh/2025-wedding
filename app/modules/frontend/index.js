const express = require("express");
const frontend = express();
frontend.set("views", _basepath + "app/views/frontend/");

frontend.get("/", async function (req, res) {
	try {
		// res.send("Hello World");
		res.render("index");
	} catch (error) {
		console.log(error);
	}
});

module.exports = frontend;
