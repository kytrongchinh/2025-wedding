const express = require("express");
const invitee = express.Router();
const {
	COLLECTIONS,
	STATUS,
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const weddingModal = require("../../../weddings/models");
const _ = require("lodash");
invitee.get("/", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		const user = req.user;
		let page = 1;
		if (requestData?.page) page = parseInt(requestData?.page);
		page = page < 1 ? 1 : page;
		const limit = parseInt(requestData?.limit) || 6;
		const skip = limit * (page - 1);
		const sort = {
			createdAt: -1,
		};
		const items = await weddingModal.find(COLLECTIONS.INVITEE, { status: 1 }, "", sort, limit, skip);
		const total = await miloModal.count(COLLECTIONS.INVITEE, { status: 1 });
		const result = {
			error: 0,
			message: "Success",
			data: {
				items,
				total,
				page,
				limit,
			},
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

invitee.get("/detail", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		let slug_name = requestData.slug_name;
		if (!slug_name) {
			const result = {
				error: 0,
				message: "Success",
				data: {
					item: null,
				},
			};
			return utils.common.response(req, res, result);
		}

		const item = await weddingModal.findOne(COLLECTIONS.INVITEE, { status: 1, slug_name: slug_name });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "invitee-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

invitee.post("/accept", async function (req, res) {
	try {
		let dataBody = req.body;

		Object.keys(dataBody).forEach((key) => {
			// Check if the field value is a string (you can also add more checks for other types)
			if (typeof dataBody[key] === "string") {
				dataBody[key] = dataBody[key].replace(/[']/g, "");
			}
		});

		const requestData = helpers.admin.filterXSS(dataBody);
		let slug_name = requestData.slug_name;
		if (!slug_name) {
			throw new ValidationError(ERRORS.INVALID_DATA, requestData);
		}

		const item = await weddingModal.updateOne(COLLECTIONS.INVITEE, { status: 1, slug_name: slug_name }, { accept: true });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "accept");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = invitee;
