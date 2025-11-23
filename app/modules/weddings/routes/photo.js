"use strict";

const express = require("express");

const moduleModel = require("../models");
const mod_config = {
	module: "weddings",
	resource: "photo",
	collection: "wd_photos",
	route: "weddings/photo",
	view: "photo",
	alias: "photo",
};

const photo = express.Router();
photo.get("/", async function (req, res) {
	const dataView = helpers.admin.get_data_view_admin(req, mod_config);
	try {
		let fields = await moduleModel.get_fields(mod_config, "__v", dataView.role);
		let field_keys = Object.keys(fields);
		let page = req.query.page ? req.query.page : 1;
		let conditions = helpers.admin.filterQuery(req.query, fields);
		let where = req.query.where;
		if (where) {
			let condition_add = helpers.api.get_condition_add(where);
			conditions = {
				...conditions,
				...condition_add,
			};
		}
		let query_string = helpers.admin.build_query(req.query);
		let limit = appConfig.grid_limit;
		let skip = limit * (page - 1);
		//let sort = { createdAt: -1 };
		let sort = helpers.admin.sortQuery(req.query);
		let select = field_keys.join(" ");
		let query_link = _baseUrl + mod_config.route + "?" + query_string;
		let totals = await moduleModel.count(mod_config.collection, conditions);
		let paginator = helpers.admin.pagination(query_link, page, totals, limit);

		//assign data
		dataView.lists = [];
		if (totals > 0) {
			dataView.lists = await moduleModel.find(mod_config.collection, conditions, select, sort, limit, skip);
		}

		//check permission using display button
		dataView.perms = req.session.admin_userdata.perms;
		dataView.fields = fields;
		dataView.field_keys = field_keys;
		dataView.output_paging = paginator.render();
		dataView.total_record = totals;
		dataView.query_get = req.query;
		dataView.query_string = query_string;
		dataView.curent_url = req.originalUrl;
		return res.render("./" + mod_config.module + "/" + mod_config.view + "/list", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return res.redirect(_adminUrl);
	}
});

//Get add
photo.get("/add", async function (req, res) {
	try {
		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		let ignore_fields = "__v update_by createdAt updatedAt";
		dataView.fields = await moduleModel.get_fields(mod_config, ignore_fields);
		res.render("./" + mod_config.module + "/" + mod_config.view + "/add", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//Post add
photo.post("/add", async function (req, res) {
	try {
		let postData = { ...req.body };
		//create
		let dataAdd = moduleModel.filterData(mod_config.collection, postData);
		dataAdd.update_by = helpers.admin.get_update_by(req);

		let create = await moduleModel.create(mod_config.collection, dataAdd, true);
		if (create.status) {
			req.flash("msg_success", "Add success");
			return helpers.base.redirect(res, mod_config.route);
		} else {
			req.flash("msg_error", create.msg);
			return helpers.base.redirect(res, mod_config.route + "/add");
		}
	} catch (e) {
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route + "/add");
	}
});

//Get edit
photo.get("/edit/:id", async function (req, res) {
	try {
		//validate
		const validator = new helpers.validate();
		let valid_error = validator.isObjectId(req.params.id, "ID must be ObjectId").hasErrors();
		if (valid_error.length > 0) {
			req.flash("msg_error", valid_error[0]);
			return helpers.base.redirect(res, mod_config.route);
		}

		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		const record = await moduleModel.findOne(mod_config.collection, { _id: req.params.id });
		const tags = await helpers.admin.loadTags();
		dataView.tags = tags;

		console.log(dataView, "dataView ");
		if (record) {
			const ignore_fields = "__v update_by createdAt updatedAt";
			dataView.fields = await moduleModel.get_fields(mod_config, ignore_fields);
			dataView.data_edit = dataView.post_data.length > 0 ? dataView.post_data : record;
			return res.render(`./${mod_config.module}/${mod_config.view}/edit`, dataView);
		} else {
			req.flash("msg_error", "Data null");
			return helpers.base.redirect(res, mod_config.route);
		}
	} catch (e) {
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//post edit
photo.post("/edit/:id", async function (req, res) {
	try {
		let postData = { ...req.body };
		req.flash("post_data", postData);
		//validate
		const validator = new helpers.validate();
		let valid_error = validator.isObjectId(postData._id, "Invalid ID").hasErrors();
		if (valid_error.length > 0) {
			req.flash("msg_error", valid_error[0]);
			return helpers.base.redirect(res, mod_config.route);
		}


		if (postData._id != req.params.id) {
			req.flash("valid_errors", "Invalid ID");
			return helpers.base.redirect(res, mod_config.route);
		}

		const dataUpdate = moduleModel.filterData(mod_config.collection, postData, "__v _id");
		dataUpdate.update_by = helpers.admin.get_update_by(req);
		const resultUpdate = await moduleModel.updateOne(mod_config.collection, { _id: postData._id }, dataUpdate);
		if (resultUpdate.status === true) {
			req.flash("msg_success", "Edit success.");
			return helpers.base.redirect(res, mod_config.route);
		} else {
			req.flash("msg_error", update.msg);
			return helpers.base.redirect(res, `${mod_config.route}/edit/${postData._id}`);
		}
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//GET import
photo.get("/import", function (req, res) {
	try {
		let dataView = helpers.admin.get_data_view_admin(req, mod_config);
		res.render("./layout/partial/import", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

/** POST import
 *
 */
photo.post("/import", async function (req, res) {
	try {
		function convertDataImport(data, type) {
			switch (type) {
				case "String":
					if (data == undefined) {
						data = "";
					}
					break;
				case "Date":
					break;
				case "Number":
					data = parseInt(data);
					if (isNaN(data)) {
						data = 0;
					}
					break;
				case "ObjectID":
					break;
				case "Boolean":
					data = String(data);
					var str = data.toLowerCase();
					if (str === "true" || str == "on" || str == "active" || str === "1") {
						data = true;
					} else if (str === "false" || str == "off" || str == "inactive" || str === "0") {
						data = false;
					} else {
						data = null;
					}
					break;
				case "Array":
					if (data == undefined || data == "") {
						data = [];
					} else {
						data = data.split(",");
					}
					break;
				case "Mixed":
					if (data == undefined) {
						data = "";
					} else {
						data = helpers.base.json_data(data);
					}
					break;
			}

			return data;
		}

		let postData = { ...req.body };
		let data = JSON.parse(postData.data);

		//validate data fields
		let fields = await moduleModel.get_fields(mod_config, "__v");

		let valid = helpers.admin.valid_import_data(fields, data);
		if (valid === true) {
			// convert data
			const updatedData = data.reduce((acc, item) => {
				// Clone the current item to avoid modifying the original data
				const updatedItem = { ...item };
				Object.keys(fields).forEach((key) => {
					let value = convertDataImport(updatedItem[key], fields[key]);
					updatedItem[key] = value;
				});
				// Add the updated item to the accumulator
				acc.push(updatedItem);

				return acc;
			}, []);

			let insertData = await moduleModel.insertMany(mod_config.collection, updatedData);
			if (insertData.status === true) {
				return res.json({ status: "Success" });
			} else {
				return res.json({ status: insertData.msg });
			}
		} else {
			clog(valid);
			return res.json({ status: "Invalid data" });
		}
	} catch (e) {
		console.log(e);
		res.json({ status: e.message });
	}
});

//GET export
photo.get("/export", async function (req, res) {
	try {
		let dataView = helpers.admin.get_data_view_admin(req, mod_config);
		let fields = await moduleModel.get_fields(mod_config, "__v", dataView.role);
		let field_keys = Object.keys(fields);
		dataView.field_keys = field_keys;
		dataView.fields = fields;
		res.render("./layout/partial/export", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//Export
photo.post("/export", async function (req, res) {
	try {
		const dataPost = { ...req.body };

		let offset = helpers.base.parseInteger(dataPost.offset);
		if (offset == 0) offset = 1;
		const limit = appConfig.export_limit || 50;
		const skip = parseInt((offset - 1) * limit);

		const filterData = JSON.parse(dataPost.data);
		const columns = Object.keys(filterData);
		const fields = await moduleModel.get_fields(mod_config, "__v");
		if (ctypeof(columns) !== "array" || columns.length == 0 || !helpers.base.arrayContainsArray(columns, Object.keys(fields))) {
			return res.json({ error: 1, msg: "Invalid column" });
		}

		const conditions = helpers.admin.buildQuery(filterData, fields);
		const data = await moduleModel.find(mod_config.collection, conditions, columns.join(" "), {}, limit, skip);
		let convertData = [];
		if (data && data.length > 0) {
			for (let i = 0; i < data.length; i++) {
				let item = [];
				for (let j = 0; j < columns.length; j++) {
					let field_type = fields[columns[j]];
					item.push(helpers.admin.convertDataExport(data[i][columns[j]], field_type));
				}
				convertData.push(item);
			}
		}
		return res.json({ error: 0, data: convertData, msg: "Success" });
	} catch (e) {
		clog(e);
		return res.json({ error: 1, msg: e.message });
	}
});

//delete
photo.post("/delete", async function (req, res) {
	let post_data = { ...req.body };
	if (post_data != null && !post_data.listViewId) {
		req.flash("msg_error", "Delete error.");
		return helpers.base.redirect(res, mod_config.route);
	}

	try {
		let condition = { _id: { $in: post_data.listViewId } };
		let oldData = await moduleModel.findAll(mod_config.collection, condition);
		let del = await moduleModel.deleteMany(mod_config.collection, condition);
		if (del.status) {
			if (oldData) helpers.log.logDelete(req, { collection: mod_config.collection, data: oldData });
			req.flash("msg_success", "Delete success.");
		} else {
			req.flash("msg_error", "Delete fail.");
		}
		return helpers.base.redirect(res, mod_config.route);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//Get detail
photo.get("/detail/:_id", async function (req, res) {
	try {
		//validate
		const validator = new helpers.validate();
		let valid_error = validator.isObjectId(req.params._id, "ID must be ObjectID").hasErrors();
		if (valid_error.length > 0) {
			req.flash("msg_error", valid_error);
			return helpers.base.redirect(res, mod_config.route);
		}

		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		const record = await moduleModel.findOne(mod_config.collection, { _id: req.params._id });
		if (record) {
			dataView.fields = await moduleModel.get_fields(mod_config, "__v");
			dataView.data_detail = dataView.post_data.length > 0 ? dataView.post_data : record;
			res.render("./layout/partial/view", dataView);
		} else {
			req.flash("msg_error", "Data null");
			return helpers.base.redirect(res, mod_config.route);
		}
	} catch (e) {
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

// report view

photo.get("/report", async function (req, res) {
	try {
		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		let ignore_fields = "__v update_by createdAt updatedAt";
		dataView.fields = await moduleModel.get_fields(mod_config, ignore_fields);
		dataView.statuscode = {
			Unknown: { ID: 100, Label: "info" },
			Pending: { ID: 0, Label: "primary" },
			Success: { ID: 1, Label: "success" },
		};
		dataView.query_get = req.query;
		res.render("./" + mod_config.module + "/" + mod_config.view + "/report", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

// report
photo.post("/report", async function (req, res) {
	try {
		const moment = require("moment");
		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		const fields = await moduleModel.get_fields(mod_config, "__v", dataView.role);
		let conditions = helpers.admin.filterQuery(req.query, fields);

		var isFromDate = helpers.date.isFormat(req.body?.startDate, "YYYY-MM-DD");
		var isToDate = helpers.date.isFormat(req.body?.endDate, "YYYY-MM-DD");
		if (isFromDate && isToDate) {
			var from_date = moment(req.body?.startDate).toDate();
			var to_date = moment(req.body?.endDate).add(1, "days").toDate();
			conditions.createdAt = { $gte: from_date, $lt: to_date };
		} else if (isFromDate) {
			var from_date = moment(req.body?.startDate).toDate();
			conditions.createdAt = { $gte: from_date };
		} else if (isToDate) {
			var to_date = moment(req.body?.endDate).add(1, "days").toDate();
			conditions.createdAt = { $lt: to_date };
		}

		const data = await moduleModel.aggregateCustom(mod_config.collection, [
			{ $match: { ...conditions } },
			{ $addFields: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
			{ $group: { _id: { status: "$status", action: "$action", date: "$date" }, total: { $sum: 1 } } },
			{
				$group: {
					_id: { status: "$_id.status", date: "$_id.date" },
					total: { $sum: "$total" },
					data: { $addToSet: { _id: "$_id.action", total: "$total" } },
				},
			},
		]);

		return res.json({
			status: 200,
			msg: "Success",
			data,
		});
	} catch (e) {
		return res.status(500).json({
			status: 500,
			msg: e.message,
		});
	}
});

photo.get("/drive", async function (req, res) {
	try {
		const dataView = helpers.admin.get_data_view_admin(req, mod_config);
		let ignore_fields = "__v update_by createdAt updatedAt";
		dataView.fields = await moduleModel.get_fields(mod_config, ignore_fields);
		res.render("./" + mod_config.module + "/" + mod_config.view + "/drive", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

async function getAllImages(folderId) {
	try {
		const { google } = require("googleapis");
		// const fileService = "./d-social-login1-1118-52bde76f9e90.json";

		const auth = new google.auth.GoogleAuth({
			// keyFile: fileService, // Đường dẫn đến file JSON bạn vừa tải
			credentials: {
				client_email: appConfig.GOOGLE_CLIENT.EMAIL,
				private_key: appConfig.GOOGLE_CLIENT.PRIVATE_KEY.replace(/\\n/g, "\n"),
			},
			scopes: ["https://www.googleapis.com/auth/drive.readonly"],
		});
		const drive = google.drive({ version: "v3", auth });

		const allFiles = [];
		let nextPageToken = null;

		do {
			const res = await drive.files.list({
				q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
				fields: "nextPageToken, files(id, name, thumbnailLink, mimeType, size)",
				pageSize: 1000,
				pageToken: nextPageToken || undefined,
			});

			allFiles.push(...res.data.files);
			nextPageToken = res.data.nextPageToken;
		} while (nextPageToken);

		return allFiles;
	} catch (error) {
		console.log(error, "loio");
	}
}
//Post add
photo.post("/drive", async function (req, res) {
	try {
		let postData = { ...req.body };
		//create
		// const folderId = "1WqW7GCgdA4PrxF6mNCsC-sfL60llYDL-";
		const folderId = postData?.folderId;
		console.log(folderId, "folderId");
		const files = await getAllImages(folderId);

		if (files.length === 0) {
			console.log("No images found.");
			return;
		}

		const imageLinks = files.map((file, index) => ({
			name: file?.name.substring(0, file?.name.lastIndexOf(".")),
			image: `https://drive.google.com/uc?export=view&id=${file.id}`,
			thumb: file?.thumbnailLink,
			link: `https://drive.google.com/uc?export=view&id=${file.id}`,
			id_image: file.id,
			size: file?.size,
			mimeType: file?.mimeType,
			from: "",
			status: 1,
			tags: [],
			is_hot: 0,
			weight: index,
		}));

		let create = await moduleModel.insertMany(mod_config.collection, imageLinks);
		if (create.status) {
			req.flash("msg_success", "Add success");
			return helpers.base.redirect(res, mod_config.route);
		} else {
			req.flash("msg_error", create.msg);
			return helpers.base.redirect(res, mod_config.route + "/");
		}
	} catch (e) {
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route + "/");
	}
});
module.exports = photo;
