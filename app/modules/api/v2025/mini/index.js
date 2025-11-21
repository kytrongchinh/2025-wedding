const express = require("express");
const mini = express.Router();
const { REGISTER_FORM_FIELDS, COLLECTIONS, ERRORS, MESSAGES } = require("../../../../configs/constants");
const { checkEmpty, checkPhone } = require("../../../../helpers/campaign_validate");
const miloModal = require("../../../milo/models");
const { ValidationError } = require("../../../../utils/error");
const zaloApi = require("../../../../libs/zalo");
const { checkTimeline } = require("../../../../utils/middleware");
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

mini.get("/medal-detail", checkTimeline, async function (req, res) {
	try {
		const queryData = helpers.admin.filterXSS(req.query);
		const id = queryData?.id;

		const item = await miloModal.findOne(COLLECTIONS.CERTIFICATE, { status: 1, _id: id });
		const result = {
			error: 0,
			message: "Success",
			data: item,
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: -1,
			message: error.message,
			data: null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = mini;
