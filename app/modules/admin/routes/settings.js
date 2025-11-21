"use strict";

var express = require("express");

var adminModel = require("../models");
var mod_config = {
	module: "admin",
	resource: "settings",
	collection: "adminSettings",
	route: `${appConfig.adminRouter}/settings`,
	view: "settings",
	alias: "Settings",
};

var settings = express.Router();
settings.get("/", async function (req, res) {
	try {
		var page = parseInt(req.query.page);
		if (isNaN(page) || page <= 0) page = 1;

		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
		var fields = await adminModel.get_fields(mod_config, "__v update_by", dataView.role);
		var conditions = helpers.admin.filterQuery(req.query, fields);
		if (req.session.admin_userdata.role != "root") {
			conditions.is_system = false;
		}

		var query_string = helpers.admin.build_query(req.query);
		var limit = appConfig.grid_limit;
		var skip = limit * (page - 1);
		var sort = { createdAt: -1 };
		var select = Object.keys(fields).join(" ");
		var query_link = _baseUrl + mod_config.route + "?" + query_string;
		var totals = await adminModel.count(mod_config.collection, conditions);
		var paginator = helpers.admin.pagination(query_link, page, totals, limit);

		//get data
		dataView.lists = totals > 0 ? await adminModel.find(mod_config.collection, conditions, select, sort, limit, skip) : [];

		//assign permission using display button
		dataView.perms = req.session.admin_userdata.perms;
		dataView.fields = fields;
		dataView.output_paging = paginator.render();
		dataView.total_record = totals;
		dataView.query_get = req.query;
		dataView.query_string = query_string;
		return res.render("./" + mod_config.module + "/" + mod_config.view + "/list", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", "Has Error");
		return res.redirect(_adminUrl);
	}
});

//Get add
settings.get("/add", async function (req, res) {
	try {
		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
		dataView.fields = await adminModel.get_fields(mod_config, "__v update_by");
		res.render("./" + mod_config.module + "/" + mod_config.view + "/add", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//Post add
settings.post("/add", async function (req, res) {
	try {
		var post_data = req.body;
		req.flash("post_data", post_data);

		//validation
		var validator = new helpers.validate();
		validator.checkBody("key", "notEmpty", req).checkBody("value", "notEmpty", req);
		if (post_data.status) validator.checkBody("status", "isBoolean", req);
		if (post_data.is_system) validator.checkBody("is_system", "isBoolean", req);

		var valid_error = validator.hasErrors();
		if (valid_error.length > 0) {
			req.flash("valid_errors", valid_error);
			return helpers.base.redirect(res, mod_config.route + "/add");
		}

		//check exists
		var record = await adminModel.findOne(mod_config.collection, { key: post_data.key.trim() });
		if (record) {
			req.flash("msg_error", "key already exist");
			return helpers.base.redirect(res, mod_config.route + "/add");
		}

		//filter data
		var dataAdd = await adminModel.filterData(mod_config.collection, post_data, "__v");
		dataAdd.update_by = helpers.admin.get_update_by(req);

		//create
		var create = await adminModel.create(mod_config.collection, dataAdd);
		if (create.status === true) {
			helpers.setting.set_value_setting(dataAdd.key, dataAdd.value);
			req.flash("msg_success", "Add success");
			return helpers.base.redirect(res, mod_config.route);
		} else {
			req.flash("msg_error", create.msg);
			return helpers.base.redirect(res, mod_config.route + "/add");
		}
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route + "/add");
	}
});

//Get edit
settings.get("/edit/:id", async function (req, res) {
	try {
		//validate
		var validator = new helpers.validate();
		var valid_error = validator.isObjectId(req.params.id, "Invalid ID").hasErrors();
		if (valid_error.length > 0) {
			req.flash("msg_error", valid_error[0]);
			return helpers.base.redirect(res, mod_config.route);
		}

		var record = await adminModel.findOne(mod_config.collection, { _id: req.params.id });
		if (record) {
			var dataView = helpers.admin.get_data_view_admin(req, mod_config);
			dataView.fields = await adminModel.get_fields(mod_config, "__v update_by");
			dataView.data_edit = dataView.post_data.length > 0 ? dataView.post_data : record;
			return res.render("./" + mod_config.module + "/" + mod_config.view + "/edit", dataView);
		} else {
			req.flash("msg_error", "Data does not exist");
			return helpers.base.redirect(res, mod_config.route);
		}
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//post edit
settings.post("/edit/:id", async function (req, res) {
	try {
		var post_data = req.body;
		req.flash("post_data", post_data);

		//validation
		var validator = new helpers.validate();
		validator.checkBody("key", "notEmpty", req).checkBody("value", "notEmpty", req);
		if (post_data.is_system) validator.checkBody("is_system", "isBoolean", req);
		if (post_data.status) validator.checkBody("status", "isBoolean", req);

		var valid_error = validator.hasErrors();
		if (valid_error.length > 0) {
			req.flash("valid_errors", valid_error);
			return helpers.base.redirect(res, mod_config.route + "/edit/" + req.params.id);
		}

		if (!post_data._id || post_data._id != req.params.id) {
			req.flash("msg_error", "Invalid ID");
			return helpers.base.redirect(res, mod_config.route);
		}

		//check exists
		var where = {
			key: { $eq: post_data.key.trim() },
			_id: { $not: { $eq: post_data._id } },
		};
		var record = await adminModel.findOne(mod_config.collection, where);
		if (record) {
			req.flash("msg_error", "Key already exists");
			return helpers.base.redirect(res, mod_config.route + "/edit/" + req.params.id);
		}

		//assign data
		var dataUpdate = await adminModel.filterData(mod_config.collection, post_data, "__v _id");
		dataUpdate.update_by = helpers.admin.get_update_by(req);

		var update = await adminModel.updateOne(mod_config.collection, { _id: req.params.id }, dataUpdate);
		if (update.status) {
			helpers.setting.set_value_setting(dataUpdate.key, dataUpdate.value);
			req.flash("msg_success", "Edit success.");
			return helpers.base.redirect(res, mod_config.route);
		} else {
			req.flash("msg_error", update.msg);
			return helpers.base.redirect(res, mod_config.route + "/edit/" + req.params.id);
		}
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//delete
settings.post("/delete", async function (req, res) {
	try {
		var post_data = req.body;
		if (post_data === null || !post_data.listViewId) {
			req.flash("msg_error", "Delete error.");
			return helpers.base.redirect(res, mod_config.route);
		}
		var condition = { _id: { $in: post_data.listViewId } };
		var del = await adminModel.deleteMany(mod_config.collection, condition);
		if (del.status) {
			req.flash("msg_success", "Delete success.");
		} else {
			req.flash("msg_error", "Delete fail.");
		}
		return helpers.base.redirect(res, mod_config.route);
	} catch (e) {
		console.log(e);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//GET import
settings.get("/import", function (req, res) {
	try {
		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
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
settings.post("/import", async function (req, res) {
	try {
		let postData = { ...req.body };
		let data = JSON.parse(postData.data);
		//validate data fields
		let fields = await adminModel.get_fields(mod_config, "__v");
		let valid = helpers.admin.valid_import_data(fields, data);
		if (valid === true) {
			let insertData = await adminModel.insertMany(mod_config.collection, data);
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
		clog(e);
		return res.json({ status: e.message });
	}
});

//GET export
settings.get("/export", async function (req, res) {
	try {
		var fields = await adminModel.get_fields(mod_config, "__v");
		var field_keys = Object.keys(fields);
		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
		dataView.field_keys = field_keys;
		dataView.fields = fields;
		res.render("./layout/partial/export", dataView);
	} catch (e) {
		console.log(e);
		req.flash("msg_error", e.message);
		return helpers.base.redirect(res, mod_config.route);
	}
});

//POST Export
settings.post("/export", async function (req, res) {
	try {
		const dataPost = { ...req.body };

		let offset = helpers.base.parseInteger(dataPost.offset);
		if (offset == 0) offset = 1;
		const limit = appConfig.export_limit || 50;
		const skip = parseInt((offset - 1) * limit);

		const filterData = JSON.parse(dataPost.data);
		const columns = Object.keys(filterData);
		const fields = await adminModel.get_fields(mod_config, "__v");
		if (ctypeof(columns) !== "array" || columns.length == 0 || !helpers.base.arrayContainsArray(columns, Object.keys(fields))) {
			return res.json({ error: 1, msg: "Invalid column" });
		}

		const conditions = helpers.admin.buildQuery(filterData, fields);
		const data = await adminModel.find(mod_config.collection, conditions, columns.join(" "), {}, limit, skip);
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

//Get detail
settings.get("/detail/:_id", async function (req, res) {
	try {
		//validate
		var validator = new helpers.validate();
		var valid_error = validator.isObjectId(req.params._id, "ID must be ObjectID").hasErrors();
		if (valid_error.length > 0) {
			req.flash("msg_error", valid_error);
			return helpers.base.redirect(res, mod_config.route);
		}

		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
		var record = await adminModel.findOne(mod_config.collection, { _id: req.params._id });
		if (record) {
			dataView.fields = await adminModel.get_fields(mod_config, "__v");
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

settings.get("/list-key", async function (req, res) {
	try {
		var dataView = helpers.admin.get_data_view_admin(req, mod_config);
		dataView.curent_url = req.originalUrl;
		let list_keys = await libs.redis.list_keys();
		const filterkey = ["GIFTS", "setting_", "number_invalid_", "blocking_", "oa_access_token", "total_code_valid_today","GIFT_ID"];
		clog(list_keys);
		let list_keys_final = [];
		if (helpers.base.typeof(list_keys) === "array") {
			for (let i = 0; i < list_keys.length; i++) {
				let key = list_keys[i].replace(`${appConfig.redis.prefix}_${appConfig.env}_`, "");
				// let key = list_keys[i];
				if (key.indexOf("sess:") !== 0) {
					list_keys_final.push(key);
				}
				// if (filterkey.some((v) => key.includes(v))) {
				// 	// There's at least one
				// 	list_keys_final.push(key);
				// }
			}
		}
		//clog('list_keys_final',list_keys_final)
		dataView.list_keys = list_keys_final;
		return res.render("./" + mod_config.module + "/" + mod_config.view + "/list_key", dataView);
	} catch (error) {
		console.log(error);
		req.flash("msg_error", error.message);
		return res.redirect(_adminUrl);
	}

	// res.json(list_keys);
});

settings.post("/set-key", async function (req, res) {
	try {
		let key = req.body.key;
		let value = req.body.value;
		let expire = parseInt(req.body.expire);
		let setResult = await libs.redis.set(key, value, expire);
		res.json({ error: 0, msg: setResult });
	} catch (e) {
		console.log(e.message);
		return res.json({ error: 1, msg: e.message });
	}
});

settings.post("/del-key", async function (req, res) {
	try {
		let key = req.body.key;
		let delResult = await libs.redis.del(key);
		res.json({ error: 0, msg: delResult });
	} catch (e) {
		console.log(e.message);
		return res.json({ error: 1, msg: e.message });
	}
});

settings.post("/get-key", async function (req, res) {
	try {
		let key = req.body.key;

		let value = await libs.redis.get(key);
		let remainTime = await libs.redis.ttl(key);
		res.json({ error: 0, msg: value, remainTime: remainTime });
	} catch (e) {
		console.log(e.message);
		return res.json({ error: 1, msg: e.message });
	}
});
module.exports = settings;
