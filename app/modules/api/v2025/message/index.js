const express = require("express");
const message = express.Router();
const {
	COLLECTIONS,
	STATUS,
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const weddingModal = require("../../../weddings/models");
const _ = require("lodash");
message.get("/", async function (req, res) {
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
		const items = await weddingModal.find(COLLECTIONS.MESSAGE, { status: 1 }, "", sort, limit, skip);
		const total = await weddingModal.count(COLLECTIONS.MESSAGE, { status: 1 });
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

message.get("/detail", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		let id = requestData.id;
		if (!id) {
			const result = {
				error: 0,
				message: "Success",
				data: {
					item: null,
				},
			};
			return utils.common.response(req, res, result);
		}

		const item = await weddingModal.findOne(COLLECTIONS.MESSAGE, { status: 1, _id: id });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "message-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

message.post("/create", async function (req, res) {
	try {
		let dataBody = req.body;

		Object.keys(dataBody).forEach((key) => {
			// Check if the field value is a string (you can also add more checks for other types)
			if (typeof dataBody[key] === "string") {
				dataBody[key] = dataBody[key].replace(/[']/g, "");
			}
		});

		const requestData = helpers.admin.filterXSS(dataBody);
		const data_in = {
			content: requestData?.content,
			name: requestData?.name || "Ẩn danh",
			from: requestData?.from,
			invitee: requestData?.invitee,
			status: 1,
		};

		const item = await weddingModal.create(COLLECTIONS.MESSAGE, data_in);

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

module.exports = message;
