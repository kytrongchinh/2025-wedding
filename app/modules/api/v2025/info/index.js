const express = require("express");
const info = express.Router();
const {
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const _ = require("lodash");
info.get("/", async function (req, res) {
	try {
		const checkTime = await helpers.campaign.checkTime();
		let date_live = await helpers.setting.get_value_setting("date_live");
		if (!date_live) {
			date_live = "2023-11-01 00:00:00";
		}

		let date_end = await helpers.setting.get_value_setting("date_end");
		if (!date_end) {
			date_end = "2024-02-03 23:59:59";
		}
		const name = "NGÀY CHUNG ĐÔI";
		const data = {
			checkTime,
			startDate: date_live,
			endDate: date_end,
			name: name,
			tag: " MILO_TET_",
		};
		const result = {
			error: 0,
			message: "Success",
			data: data,
		};

		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: -1,
			message: "Error: " + error.message,
			data: null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = info;
