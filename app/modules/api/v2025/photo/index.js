const express = require("express");
const photo = express.Router();
const {
	COLLECTIONS,
	STATUS,
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const weddingModal = require("../../../weddings/models");
const _ = require("lodash");
const { default: slugify } = require("slugify");
photo.get("/", async function (req, res) {
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
		const conditions = { status: 1 };
		if (requestData?.from) {
			conditions["from"] = from;
		}
		// const slug_name = slugify(requestData?.tags, {
		// 	replacement: "-", // replace spaces with replacement character, defaults to `-`
		// 	remove: undefined, // remove characters that match regex, defaults to `undefined`
		// 	lower: false, // convert to lower case, defaults to `false`
		// 	strict: false, // strip special characters except replacement, defaults to `false`
		// 	locale: "vi", // language code of the locale to use
		// 	trim: true,
		// });

		const slug_name = requestData?.tags;
		if (requestData?.tags) {
			// conditions["tags"] = { $in: [slug_name] };
			conditions["tags"] = { $regex: new RegExp(slug_name, "i") };
		}
		const items = await weddingModal.find(COLLECTIONS.PHOTO, conditions, "", sort, limit, skip);
		const total = await weddingModal.count(COLLECTIONS.PHOTO, conditions);
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

photo.get("/detail", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		let id = requestData.id;
		if (!id) {
			throw new ValidationError(ERRORS.INVALID_DATA, requestData);
		}

		const item = await weddingModal.findOne(COLLECTIONS.PHOTO, { status: 1, _id: id });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "photo-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = photo;
