const express = require("express");
const album = express.Router();
const {
	COLLECTIONS,
	STATUS,
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const weddingModal = require("../../../weddings/models");
const _ = require("lodash");
album.get("/", async function (req, res) {
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
		if (requestData?.tags) {
			conditions["tags"] = { $in: [requestData?.tags] };
		}
		const items = await weddingModal.find(COLLECTIONS.ALBUM, conditions, "", sort, limit, skip);
		const total = await miloModal.count(COLLECTIONS.ALBUM, conditions);
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

album.get("/detail", async function (req, res) {
	try {
		const requestData = helpers.admin.filterXSS(req.query);
		let id = requestData.id;
		if (!id) {
			throw new ValidationError(ERRORS.INVALID_DATA, requestData);
		}

		const item = await weddingModal.findOne(COLLECTIONS.ALBUM, { status: 1, _id: id });

		const result = {
			error: 0,
			message: "Success",
			data: {
				item,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "album-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

async function getAllImages(folderId) {
	const { google } = require("googleapis");
	const fileService = "./d-social-login1-1118-d661611f82c9.json";

	const auth = new google.auth.GoogleAuth({
		keyFile: fileService, // Đường dẫn đến file JSON bạn vừa tải
		scopes: ["https://www.googleapis.com/auth/drive.readonly"],
	});
	const drive = google.drive({ version: "v3", auth });

	const allFiles = [];
	let nextPageToken = null;

	do {
		const res = await drive.files.list({
			q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
			fields: "nextPageToken, files(id, name, thumbnailLink, mimeType)",
			pageSize: 1000,
			pageToken: nextPageToken || undefined,
		});

		allFiles.push(...res.data.files);
		nextPageToken = res.data.nextPageToken;
	} while (nextPageToken);

	return allFiles;
}

album.get("/showid", async function (req, res) {
	try {
		const folderId = "1WqW7GCgdA4PrxF6mNCsC-sfL60llYDL-"; // Folder ID trên Drive

		const files = await getAllImages(folderId);

		if (files.length === 0) {
			console.log("No images found.");
			return;
		}

		const imageLinks = files.map((file) => ({
			name: file.name,
			link: `https://drive.google.com/uc?export=view&id=${file.id}`,
			thumbnail: file?.thumbnailLink,
		}));

		console.log(imageLinks);

		const result = {
			error: 0,
			message: "Success",
			data: {},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		console.log(error, "album-detail");
		const result = {
			error: MESSAGES?.[error?.message]?.CODE || -1,
			message: MESSAGES?.[error?.message]?.MSG || error.message,
			data: error?.data || null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = album;
