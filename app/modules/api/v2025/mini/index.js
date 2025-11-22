const express = require("express");
const mini = express.Router();
mini.get("/", async function (req, res) {
	try {
		const result = {
			error: 0,
			message: "Success",
			data: {},
		};

		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = mini;
