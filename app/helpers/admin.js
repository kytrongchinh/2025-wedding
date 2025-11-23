const moment = require("moment");
const querystring = require("querystring");
const pagination = require("pagination");
const fs = require("fs");
const adminModel = require("../modules/admin/models");
const i18n = require("../configs/i18n.config");
const helper = {};

helper.authAdmin = async function (req, res, next) {
	try {
		const admin_userdata = req.session?.admin_userdata;
		if (typeof admin_userdata === "undefined" || admin_userdata === null) {
			return helpers.base.redirect(res, `${appConfig.adminRouter}/login`);
		}

		if (admin_userdata.role == "root") {
			if (req.body._csrf !== undefined) delete req.body._csrf;
			helpers.log.tracking(req);
			return next();
		}

		const resources = helpers.base.parse_resource(req.originalUrl);
		//get module name by route
		resources.module = appConfig.modules_systems[resources.module];

		if (!resources || !resources.module || !resources.resource || !resources.method) {
			return req.method == "POST" ? res.status(200).send("No Permission") : helpers.base.redirect(res, `${appConfig.adminRouter}/no_permission`);
		}

		const list_perms = req.session.admin_userdata.list_perms;
		let perms = [];
		list_perms.forEach(function (per) {
			if (resources.module == per.module && resources.resource == per.resource) {
				perms = per.permissions;
			}
		});

		//set perms for resource using display button add,edit,delete ...
		req.session.admin_userdata.perms = perms;

		if (perms?.length > 0) {
			if (perms.indexOf(resources.method) != -1) {
				if (req.body._csrf !== undefined) delete req.body._csrf;
				helpers.log.tracking(req);
				return next();
			} else {
				return req.method == "GET" ? helpers.base.redirect(res, `${appConfig.adminRouter}/no_permission`) : res.status(200).send("No Permission");
			}
		} else {
			return req.method == "GET" ? helpers.base.redirect(res, `${appConfig.adminRouter}/no_permission`) : res.status(200).send("No Permission");
		}
	} catch (e) {
		clog(e);
		return req.method == "GET" ? helpers.base.redirect(res, `${appConfig.adminRouter}/no_permission`) : res.status(200).send("No Permission");
	}
};

/* Check perm by module,resource
 *
 * @param String module
 * @param String resource
 * @param String perm
 * @param Object admin_userdata (is req.session.admin_userdata)
 *
 * @return Boolean
 */
helper.checkPermByResource = function (module, resource, perm, admin_userdata) {
	if (admin_userdata.role == "root") return true;
	return admin_userdata.list_perms.some((item) => {
		return item.module == module && item.resource == resource && item.permissions.indexOf(perm) > -1;
	});
};

/* Check perm of resource current
 *
 * @param String perm
 * @param Object admin_userdata (is req.session.admin_userdata)
 *
 * @return Boolean
 */
helper.checkPerm = function (perm, admin_userdata) {
	if (admin_userdata.role == "root") return true;
	var perms = admin_userdata.perms;
	return perms && perms.indexOf(perm) != -1;
};

helper.checkMyPerm = function (perm, admin_userdata) {
	// if (admin_userdata.role == "root") return true;
	var perms = admin_userdata.perms;
	return perms && perms.indexOf(perm) != -1;
};

helper.get_data_view_admin = function (req, mod_config = null) {
	return {
		title: "Dashboard Admin",
		fullname: req.session.admin_userdata ? req.session.admin_userdata.fullname : "",
		avatar: req.session.admin_userdata ? req.session.admin_userdata.avatar : "",
		username: req.session.admin_userdata ? req.session.admin_userdata.username : "",
		role: req.session.admin_userdata ? req.session.admin_userdata.role : "",
		user_id: req.session.admin_userdata ? req.session.admin_userdata.user_id : "",
		msg_success: req.flash("msg_success"),
		msg_warning: req.flash("msg_warning"),
		msg_error: req.flash("msg_error"),
		valid_errors: req.flash("valid_errors"),
		post_data: req.flash("post_data"),
		mod_module: mod_config ? mod_config.module : "",
		mod_route: mod_config ? mod_config.route : "",
		mod_resource: mod_config ? mod_config.resource : "",
		mod_alias: mod_config ? mod_config.alias : "",
		mod_url: mod_config ? _baseUrl + mod_config.route : "",
	};
};

/* Get custom fields by role or default fields
 *
 * @param String module
 * @param String resource
 * @param String role
 *
 * @return Object | null
 */
helper.get_custom_fields = async function (module, resource, role) {
	try {
		//find custom fields
		var where = {
			module: module,
			resource: resource,
			role: role,
		};
		var items = await adminModel.findOne("adminCustomFields", where, "-_id custom_fields");
		if (items && items.custom_fields != undefined && items.custom_fields.length > 0) {
			return items.custom_fields;
		}
		//find default fields
		where = {
			module: module,
			name: resource,
		};
		items = await adminModel.findOne("adminResources", where, "-_id default_fields");

		return items && items.default_fields != undefined && items.default_fields.length > 0 ? items.default_fields : null;
	} catch (e) {
		console.log(e);
		return null;
	}
};

helper.menus = async function (role) {
	var menus = await adminModel.findAll("adminMenus", { status: true }, "", { weight: 1 });
	var adminPermissions = await adminModel.findAll("adminPermissions", { role: role }, "-_id role module resource permissions");
	var ppp = [];
	var tmp = [];
	menus.forEach(function (item) {
		if (item.parent_id) {
			let per = module.exports.get_permission(item.link, adminPermissions, role);
			if (per) {
				tmp.push(item);
			}
		} else {
			let n_data = {
				_id: item._id,
				name: item.name,
				link: item.link,
				weight: item.weight,
				icon: item.icon,
				parent_id: item.parent_id,
				is_dashboard: item.is_dashboard,
				childs: [],
			};
			if (item.link != "#") {
				let per = module.exports.get_permission(item.link, adminPermissions, role);
				if (per) {
					ppp.push(n_data);
				}
			} else {
				ppp.push(n_data);
			}
		}
	});

	//get child
	ppp.forEach(function (item, index) {
		var childs = module.exports.get_menu_childs(item._id, tmp);
		if (childs.length > 0) {
			childs.sort(function (a, b) {
				return a.weight - b.weight;
			});
			ppp[index].childs = childs;
		}
	});

	//remove menu hasn't childs
	let final_menu = [];
	ppp.forEach(function (item, index) {
		if (item.childs.length > 0) {
			final_menu.push(item);
		} else if (item.link !== "#") {
			final_menu.push(item);
		}
	});
	return final_menu;
};

helper.get_menu_childs = function (id, arr) {
	var tmp = [];
	arr.forEach(function (item) {
		if (item.parent_id == id) {
			tmp.push(item);
			//delete item;
		}
	});
	return tmp;
};
helper.get_permission = function (link, perm, role) {
	if (role == "root") {
		return true;
	}
	var flag_per = false;
	link = link.split("/");
	if (link.length < 2) {
		return flag_per;
	}
	perm.forEach(function (item) {
		if (item.role == role && link[0] == item.module && link[1] == item.resource && item.permissions.indexOf("view") !== -1) {
			flag_per = true;
		}
	});
	return flag_per;
};

/*
 * Get field format
 *
 */
helper.get_field_value = function (field, value, type) {
	try {
		if (value === null || value === undefined) return "";
		value = this.filterXSS(value);
		switch (type) {
			case "Date":
				value = moment(new Date(value)).format("YYYY-MM-DD HH:mm:ss");
				break;
			case "Mixed":
				value = Object.keys(value)
					.map(function (key) {
						return key + " : " + value[key] + "<br>";
					})
					.join(" ");
				break;
			case "Array":
				value = JSON.stringify(value);
				break;
			case "String":
				let ext = value.split(".").pop();
				if (["jpg", "JPG", "png", "PNG", "jpeg", "JPEG"].indexOf(ext) != -1) {
					if (value.indexOf("http") == 0) {
						value = '<img class="avatar" src="' + value + '">';
					} else {
						value = '<img class="avatar" src="' + _staticUrl + value + "?v=" + _versionCache + '">';
					}
				} else if (value.indexOf("http") == 0 && (value.indexOf("graph.facebook") > 0 || value.indexOf("google") > 0)) {
					//photo facebook
					value = '<img class="avatar" src="' + value + '">';
				}
				break;
			case "Link":
				value = '<a href="' + value + '">' + value + "</a>";
				break;
			default:
				value = typeof value != "undefined" ? value : "";
		}
		return value;
	} catch (e) {
		return "";
	}
};

/* Render status
 * return status label
 */
helper.render_status = function (status, label) {
	try {
		label = label || [
			{ color: "red", text: "Disable" },
			{ color: "green", text: "Active" },
			{ color: "yellow", text: "Waiting" },
		];
		var html = "";
		var color = "";
		var text = "";
		switch (status) {
			case 0:
			case false:
				color = label[0].color;
				text = label[0].text;
				break;
			case 1:
			case true:
				color = label[1].color;
				text = label[1].text;
				break;
			case 2:
				color = label[2].color;
				text = label[2].text;
				break;
			default:
				html = status;
		}
		html = '<small class="label bg-' + color + '">' + text + "</small>";
		return html;
	} catch (e) {
		return "";
	}
};

/*
 * Get body data
 *
 * return field value
 */
helper.get_query_data = function (data, field) {
	var value = "";
	if (data === null || typeof data != "object" || !field) {
		return value;
	}
	try {
		if (data[field] !== undefined) {
			value = data[field];
		} else if (typeof data[0] !== "undefined") {
			value = data[0][field];
		}
		return this.filterXSS(value);
	} catch (e) {
		console.log(e);
		return this.filterXSS(value);
	}
};

/* Render menu button default view,edit,delete
 * return multiple buttons
 */
helper.render_menu_buttons = function (mod_route, admin_userdata) {
	try {
		var html = "";
		var default_perms = ["add", "delete", "import", "export"];
		var perms = admin_userdata.role == "root" ? default_perms : admin_userdata.perms;
		perms.forEach(function (perm) {
			let href = `${_baseUrl}${mod_route}/${perm}`;
			switch (perm) {
				case "add":
					html += '<a href="' + href + '"><button type="button" class="btn btn-primary">Add</button></a> ';
					break;
				case "delete":
					html += '<a role="button"><button type="button" class="btn btn-primary JsDeleteItem">Delete</button></a> ';
					break;
				case "import":
					html += '<a href="' + href + '"><button type="button" class="btn btn-primary">Import</button></a> ';
					break;
				case "export":
					html += '<a href="' + href + '"><button type="button" class="btn btn-primary">Export</button></a> ';
					break;
				default:
			}
		});
		return html;
	} catch (e) {
		return "";
	}
};

/* Render menu button custom
 * return one buttons
 */
helper.render_menu_button = function (url, perm, admin_userdata, label = "") {
	try {
		var html = "";
		if (admin_userdata.role != "root") {
			var perms = admin_userdata.perms;
			if (perms.indexOf(perm) == -1) {
				return html;
			}
		}
		if (label == "") label = perm;
		var href = _baseUrl + url;
		html += '<a href="' + href + '"><button type="button" class="btn btn-primary">' + label + "</button></a>";
		return html;
	} catch (e) {
		return "";
	}
};

/* Render default action buttons
 *
 * @param String _id : id of record
 * @param String module
 * @param String resource
 * @param Object admin_userdata
 *
 * @return html | ''
 */
helper.render_action_buttons = function (_id, mod_route, admin_userdata) {
	try {
		var html = "";
		var default_perms = ["detail", "edit", "delete"];
		var perms = admin_userdata.role == "root" ? default_perms : admin_userdata.perms;
		perms.forEach(function (perm) {
			var href = `${_baseUrl}${mod_route}/${perm}/${_id}`;
			switch (perm) {
				case "detail":
					html += `<a title="Detail" href="${href}" class="btn action"><i class="fa fa-info-circle"></i></a>`;
					break;
				case "edit":
					html += `<a title="Edit" href="${href}" class="btn action"><i class="fa fa-edit"></i></a>`;
					break;
				case "delete":
					html += `<a title="Delete" data-id="${_id}" data-url="${_baseUrl}${mod_route}/${perm}" role="button" class="btn action JsDeleteItemRow"><i class="fa fa-trash"></i></a>`;
					break;
				default:
			}
		});
		return html;
	} catch (e) {
		return "";
	}
};

/* Render custom action button
 *
 * @param String url : url action
 * @param String perm
 * @param Object admin_userdata
 * @param String icon : html | text
 * @param Stirng des
 *
 * @return html | ''
 */
helper.render_action_button = function (url, perm, admin_userdata, icon = "", des = "") {
	try {
		var html = "";
		if (admin_userdata.role != "root") {
			var perms = admin_userdata.perms;
			if (perms.indexOf(perm) == -1) {
				return html;
			}
		}

		if (icon == "") icon = perm;
		if (des == "") des = perm;
		var href = _baseUrl + url;
		html += '<a title="' + des + '" href="' + href + '" class="btn action">' + icon + "</a>";
		return html;
	} catch (e) {
		return "";
	}
};

helper.htmlEscape = function (text) {
	if (typeof text != "string") return text;

	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;") // it's not neccessary to escape >
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

helper.filterXSS = function (data) {
	try {
		if (typeof data === "object") {
			for (const prop1 in data) {
				if (typeof data[prop1] === "object") {
					for (const prop2 in data[prop1]) {
						data[prop1][prop2] = this.htmlEscape(data[prop1][prop2]);
					}
				} else {
					data[prop1] = this.htmlEscape(data[prop1]);
					//console.log(`obj.${prop} = ${obj[prop]}`);
				}
			}
		} else {
			data = this.htmlEscape(data);
		}
		return data;
	} catch (e) {
		return {};
	}
};

helper.build_query = function (obj, temp_key) {
	var output_string = [];
	Object.keys(obj).forEach(function (val) {
		var key = val;
		if (key != "page") {
			//num_prefix && !isNaN(key) ? key = num_prefix + key : '';
			var key = querystring.escape(key.replace(/[!'()*]/g, escape));
			if (temp_key) {
				key = temp_key + "[" + key + "]";
			}
			//temp_key ? key = temp_key + '[' + key + ']' : '';
			if (typeof obj[val] === "object") {
				var query = module.exports.build_query(obj[val], key);
				output_string.push(query);
			} else {
				obj[val] = String(obj[val]);
				var value = querystring.escape(obj[val].replace(/[!'()*]/g, escape));
				output_string.push(key + "=" + value);
			}
		}
	});
	return output_string.join("&");
};

helper.filterQuery = function (query, fields) {
	var conditions = {};
	try {
		var queryFields = Object.keys(query);
		if (queryFields.length > 0) {
			queryFields.forEach(function (field) {
				if (field == "from_date" || field == "to_date") {
					var isFromDate = helpers.date.isFormat(query.from_date, "YYYY-MM-DD");
					var isToDate = helpers.date.isFormat(query.to_date, "YYYY-MM-DD");
					if (isFromDate && isToDate) {
						var from_date = moment(query.from_date).toDate();
						var to_date = moment(query.to_date).add(1, "days").toDate();
						conditions.createdAt = { $gte: from_date, $lt: to_date };
					} else if (isFromDate) {
						var from_date = moment(query.from_date).toDate();
						conditions.createdAt = { $gte: from_date };
					} else if (isToDate) {
						var to_date = moment(query.to_date).add(1, "days").toDate();
						conditions.createdAt = { $lt: to_date };
					}
				} else {
					switch (fields[field]) {
						case "String":
							if (query[field]) {
								var escape_advanced_search = helpers.base.escapeFunc(query[field]);
								var regex_advanced_search = new RegExp(escape_advanced_search, "i");
								conditions[field] = { $regex: regex_advanced_search };
							}
							break;
						case "Number":
							if (!isNaN(query[field]) && query[field]) {
								conditions[field] = { $eq: Number(query[field]) };
							}
							break;
						case "Date":
							//code here
							var parseDate = Date.parse(query[field]);
							var isDate = helpers.date.isFormat(query[field]);
							if (isDate) {
								var start_date = moment(query[field]).toDate();
								var end_date = moment(query[field]).add(1, "days").toDate();
								conditions[field] = { $gte: start_date, $lt: end_date };
							}
							break;
						case "ObjectID":
						case "ObjectId":
							//validate ObjectID
							var validator = new helpers.validate();
							var valid_error = validator.isObjectId(query[field]).hasErrors();
							if (valid_error.length === 0) {
								conditions[field] = query[field];
							} else {
								conditions[field] = null;
							}
							break;
						case "Boolean":
							//code here
							var str = query[field].toLowerCase();
							if (str === "true" || str == "on" || str == "active" || str === "1") {
								conditions[field] = true;
							} else if (str === "false" || str == "off" || str == "inactive" || str === "0") {
								conditions[field] = false;
							} else {
								conditions[field] = null;
							}
							break;
						case "Array":
							//code here
							conditions[field] = { $all: query[field] };
							break;
						case "Buffer":
							//code here
							break;
						case "Mixed":
							//code here
							break;
					}
				}
			});
		}
		return conditions;
	} catch (e) {
		console.log(e.message);
		return null;
	}
};

helper.buildQuery = function (data, fields) {
	try {
		var keys = Object.keys(data);
		var conditions = {};
		keys.forEach(function (field) {
			var field_type = fields[field];
			switch (field_type) {
				case "Date":
					var isFromDate = helpers.date.isFormat(data[field].from, "YYYY-MM-DD");
					var isToDate = helpers.date.isFormat(data[field].to, "YYYY-MM-DD");
					if (isFromDate && isToDate) {
						var from_date = moment(data[field].from).toDate();
						var to_date = moment(data[field].to).add(1, "days").toDate();
						conditions[field] = { $gte: from_date, $lt: to_date };
					} else if (isFromDate) {
						var from_date = moment(data[field].from).toDate();
						conditions[field] = { $gte: from_date };
					} else if (isToDate) {
						var to_date = moment(data[field].to).add(1, "days").toDate();
						conditions[field] = { $lt: to_date };
					}
					break;
				case "ObjectID":
				case "ObjectId":
					//validate ObjectID
					var validator = new helpers.validate();
					var valid_error = validator.isObjectId(data[field]).hasErrors();
					if (valid_error.length === 0) {
						conditions[field] = data[field].value;
					}
					break;
				case "String":
					if (data[field].search == "like") {
						var escape_advanced_search = helpers.base.escapeFunc(data[field].value);
						var regex_advanced_search = new RegExp(escape_advanced_search, "i");
						conditions[field] = { $regex: regex_advanced_search };
					} else if (data[field].search == "equal") {
						conditions[field] = { $eq: data[field].value };
					}
					break;
				case "Boolean":
					var str = data[field].value.toLowerCase();
					if (str === "true" || str == "on" || str == "active" || str === "1") {
						conditions[field] = true;
					} else if (str === "false" || str == "off" || str == "inactive" || str === "0") {
						conditions[field] = false;
					}
					break;
				case "Number":
					if (!isNaN(data[field].value) && data[field].value) {
						conditions[field] = helpers.base.parseInteger(data[field].value);
					}
					break;
				case "Array":
					if (data[field].value) {
						conditions[field] = data[field].value;
					}
					break;
				case "Mixed":
					if (data[field].value) {
						conditions[field] = data[field].value;
					}
					break;
				default:
					conditions[field] = data[field].value;
			}
		});
		return conditions;
	} catch (e) {
		console.log(e);
		return {};
	}
};

helper.pagination = function (link, p_current, totals, limit) {
	return new pagination.TemplatePaginator({
		prelink: link,
		current: p_current,
		rowsPerPage: limit,
		totalResult: totals,
		template: function (result) {
			var i, len, prelink;
			var html = '<div><ul class="pagination">';
			if (result.pageCount < 2) {
				html += "</ul></div>";
				return html;
			}
			prelink = this.preparePreLink(result.prelink);
			if (result.previous) {
				html += '<li><a href="' + prelink + result.previous + '">' + this.options.translator("PREVIOUS") + "</a></li>";
			}
			if (result.range.length) {
				for (i = 0, len = result.range.length; i < len; i++) {
					if (result.range[i] === result.current) {
						html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + "</a></li>";
					} else {
						html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + "</a></li>";
					}
				}
			}
			if (result.next) {
				html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + this.options.translator("NEXT") + "</a></li>";
			}
			html += "</ul></div>";
			return html;
		},
	});
};

helper.get_update_by = function (req) {
	return req.session.hasOwnProperty("admin_userdata") ? req.session.admin_userdata.username : "";
};

helper.check_recaptcha = function (g_response) {
	return new Promise(async function (resolve, reject) {
		let url = "https://www.google.com/recaptcha/api/siteverify?secret=" + appConfig.recaptcha.secret_key + "&response=" + g_response;
		let options = {
			url: url,
			method: "GET",
			headers: {
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Content-type": "application/json; charset=utf-8",
				"User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13",
			},
		};

		if (appConfig.http_proxy != "") {
			options.proxy = appConfig.http_proxy;
		}

		let result = await helpers.base.http_request(options);
		resolve(result);
	});
};

/** Scan folder module
 *
 */
helper.updateModule = function () {
	try {
		const path = `${_basepath}app/modules`;
		const ignore = ["frontend", "api"];
		fs.readdirSync(path)
			.filter(function (file) {
				return file.indexOf(".js") !== 0 && file !== "index.js" && ignore.indexOf(file) === -1;
			})
			.forEach(function (module_name) {
				helpers.admin.updateResource(module_name);
			});
	} catch (e) {
		clog(e);
		return false;
	}
};

/** Update resource to db
 *
 */
helper.updateResource = async function (module_name) {
	try {
		let moduleData = await adminModel.findOne("adminModules", { name: module_name });
		if (!moduleData) {
			let insertData = await adminModel.create("adminModules", {
				name: module_name,
				route: module_name,
				status: 1,
			});
			moduleData = insertData.status === true ? insertData.msg : null;
		}
		const pathR = `${_basepath}app/modules/${module_name}/routes`;
		var dataMenu = [];
		var dataResource = [];
		fs.readdirSync(pathR)
			.filter(function (file) {
				return file !== "index.js";
			})
			.forEach(async function (resource) {
				//create data resources
				resource = resource.substring(0, resource.lastIndexOf("."));
				var itemResource = {
					name: resource,
					module: module_name,
					collection_name: "",
					custom_fields: [],
					permissions: appConfig.perm_default,
				};
				dataResource.push(itemResource);

				//create data menus ignore dashboard
				if (resource != "dashboard" && moduleData) {
					let link = `${moduleData.route}/${resource}`;
					let itemMenu = {
						name: module_name + "_" + resource,
						link: link,
						parent_id: "",
						weight: 1,
						icon: "fa-circle-o",
						status: true,
						is_dashboard: false,
					};
					dataMenu.push(itemMenu);
				}
			});

		for (let i = 0; i < dataMenu.length; i++) {
			let c_item = await adminModel.count("adminMenus", { link: dataMenu[i].link });
			if (c_item == 0) {
				await adminModel.create("adminMenus", dataMenu[i]);
			}
		}

		for (let i = 0; i < dataResource.length; i++) {
			let c_item = await adminModel.count("adminResources", { module: dataResource[i].module, name: dataResource[i].name });
			if (c_item == 0) {
				await adminModel.create("adminResources", dataResource[i]);
			}
		}
	} catch (e) {
		console.log(e);
		return false;
	}
};

helper.sort_field = (field, urlLink = null, custom_field = null) => {
	let icon = "";
	let default_sort = 1;

	let linkUrl = urlLink;
	const resource = helpers.base.parse_resource(urlLink);
	//urlLink = helpers.base.parse_resource(urlLink);
	//let linkUrl = _baseUrl+urlLink.module+'/'+urlLink.resource+'';

	let pre_key = "?";
	if (linkUrl.indexOf(pre_key) != -1) {
		pre_key = "&";
	}

	//search vi tri sort on url
	if (linkUrl.indexOf("s[" + field + "]") != -1) {
		if (linkUrl.indexOf("s[" + field + "]=1") != -1) {
			default_sort = -1;
			icon = '<i class="fa fa-long-arrow-down"></i>';
			// cut url
			linkUrl = linkUrl.replace("s[" + field + "]=1", "s[" + field + "]=" + default_sort);
		} else {
			icon = '<i class="fa fa-long-arrow-up"></i>';
			linkUrl = linkUrl.replace("s[" + field + "]=-1", "s[" + field + "]=" + default_sort);
		}
	} else {
		linkUrl = linkUrl + pre_key + "s[" + field + "]=" + default_sort;
	}

	linkUrl = linkUrl.replace(appConfig.prefix + "/", "");
	if (i18n.getLocale() == "vi_VN") {
		return '<a class="sort" href="' + _baseUrl + linkUrl + '">' + icon + i18n.__(`${resource.resource}.${custom_field || field}`) + "</a>";
	} else {
		return '<a class="sort" href="' + _baseUrl + linkUrl + '">' + icon + field + "</a>";
	}
};

helper.sortQuery = function (query) {
	let data_sort = query.s;
	if (data_sort && typeof data_sort == "object") {
		//var f = true;
		for (const prop in data_sort) {
			if (data_sort[prop] != 1 && data_sort[prop] != -1) {
				//f = false;
				data_sort[prop] = -1;
			}
			//console.log(`data_sort.${prop} = ${data_sort[prop]}`);
		}
		return data_sort;
	} else {
		return { createdAt: -1 };
	}
};

helper.convertDataExport = function (data, type) {
	if (data == undefined) return "";
	switch (type) {
		case "String":
			break;
		case "Date":
			data = moment(data).format("YYYY-MM-DD HH:mm:ss");
			break;
		case "Number":
			break;
		case "ObjectID":
			data = String(data);
			break;
		case "Boolean":
			break;
		case "Array":
			data = data.join(",");
			break;
	}

	return data;
};

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

helper.convertDataImports = function (data, fields) {
	for (let i = 0; i < data.length; i++) {
		let item = data[i];
		for (let k in item) {
			item[k] = convertDataImport(item[k], fields[k]);
		}
		data[i] = item;
	}
	return data;
};

helper.load_model = async function (module) {
	try {
		let moduleModel = require("../modules/" + module + "/models");
		return moduleModel;
	} catch (e) {
		return null;
	}
};

helper.valid_import_data = function (fields, data) {
	try {
		if (helpers.base.typeof(fields) !== "object" || helpers.base.typeof(data) !== "array") {
			clog("invalid data");
			return false;
		}

		//valid shema key
		let shema_key = Object.keys(fields);
		let data_key = [];
		for (let i = 0; i < data.length; i++) {
			Object.keys(data[i]).forEach((v) => {
				if (data_key.indexOf(v) === -1) data_key.push(v);
			});
		}
		if (!helpers.base.arrayContainsArray(data_key, shema_key)) {
			clog("invalid schema fields");
			return false;
		}
		//valid schema data

		//clog(fields)
		//clog(data)

		return true;
	} catch (e) {
		clog(e.message);
		return false;
	}
};

helper.get_field_value_custom_old = function (field, value, type) {
	try {
		if (value === null || value === undefined) return "";
		value = this.filterXSS(value);
		switch (type) {
			case "Date":
				value = moment(new Date(value)).format("YYYY-MM-DD HH:mm:ss");
				break;
			case "Mixed":
				let Mixed = value;
				// console.log(Array.isArray(Mixed), 'typeof Array.isArray(Mixed)')
				if (Array.isArray(Mixed) === true) {
					let htmlMixed = "<div>";
					if (Mixed.length > 5) {
						htmlMixed = '<div style="overflow: scroll; height: 800px;">';
					}

					Mixed.forEach((vl, index) => {
						if (index < 3) {
							htmlMixed += '<div class="box box-warning" style="min-width: 300px !important;">';
						} else {
							htmlMixed += '<div class="box box-warning collapsed-box " style="min-width: 300px !important;">';
						}

						htmlMixed += '<div class="box-header with-border">';
						htmlMixed += '<i class="fa fa-hand-peace-o"></i> <h3 class="box-title"> ' + (index + 1) + "</h3>";
						htmlMixed +=
							'<div class="box-tools pull-right"><button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-plus"></i></button></div>';
						htmlMixed += "</div>";
						htmlMixed += '<div class="box-body" style="">';
						htmlMixed += '<ul class="nav nav-pills nav-stacked">';
						for (const key in vl) {
							if (Object.hasOwnProperty.call(vl, key)) {
								const element = vl[key];
								if (typeof element == "object" && element != null) {
									htmlMixed +=
										'<li  class="item"><a href="#">' +
										key +
										'<pre style="max-height: 300px;max-width: 500px;overflow: auto;">' +
										JSON.stringify(element) +
										"</pre></a></li>";
								} else {
									htmlMixed += '<li><a href="#">' + key + '<span class="pull-right text-green">' + element + "</span></a></li>";
								}
							}
						}
						htmlMixed += "</ul>";
						htmlMixed += "</div>";
						htmlMixed += "</div>";
					});
					htmlMixed += "</div>";
					value = htmlMixed;
				} else {
					let htmlMixed = "";
					htmlMixed += '<div class="box box-default" style="min-width: 300px !important;">';
					htmlMixed += '<div class="box-footer no-padding"></div>';
					htmlMixed += '<ul class="nav nav-pills nav-stacked">';

					for (const key in Mixed) {
						if (Object.hasOwnProperty.call(Mixed, key)) {
							let element = Mixed[key];
							//console.log(element,'element')
							//console.log(typeof element,'typeof element')
							if (typeof element == "string") {
								let ext = element.split(".").pop();
								if (["jpg", "JPG", "png", "PNG", "jpeg", "JPEG"].indexOf(ext) != -1) {
									if (element.indexOf("http") == 0) {
										element = '<img class="avatar" style="max-width: 20px;" src="' + element + '">';
									} else {
										element = '<img class="avatar" style="max-height: 20px;" src="' + _staticUrl + element + '">';
									}
								}
								htmlMixed +=
									'<li style="display: flow-root;" class="item"><a href="#">' +
									key +
									'<span class="pull-right text-green" onclick="click_copy_data_in_list(this)" >' +
									element +
									"</span></a></li>";
							}
							if (typeof element == "number") {
								htmlMixed += '<li  class="item"><a href="#">' + key + '<span class="pull-right text-yellow">' + element + "</span></a></li>";
							}

							if (typeof element == "object") {
								if (element == null) {
									htmlMixed +=
										'<li  class="item"><a href="#">' +
										key +
										'<span class="pull-right text-green" onclick="click_copy_data_in_list(this)" >' +
										element +
										"</span></a></li>";
								} else {
									htmlMixed +=
										'<li  class="item"><a href="#">' +
										key +
										'<pre style="max-height: 300px;max-width: 500px;overflow: auto;">' +
										JSON.stringify(element) +
										"</pre></a></li>";
								}
							}
						}
					}
					htmlMixed += "</ul>";
					htmlMixed += "</div>";
					value = htmlMixed;
				}

				break;
			case "Array":
				let arrayData = value;
				if (Array.isArray(arrayData) === true) {
					if (typeof arrayData[0] == "string") {
						let html = "";
						html += '<ul class="chart-legend clearfix">';
						arrayData.forEach((el, index) => {
							html += '<li><i class="fa fa-circle-o text-' + helpers.api.get_colors(index) + '"></i> ' + el + "</li>";
						});
						html += "</ul >";
						value = html;
					} else {
						let html = "";
						let size = 466;
						if (arrayData.length > 3) {
							size = 932;
						}
						html += '<div class="row" style="min-width: ' + size + 'px;">';
						arrayData.forEach((item, index) => {
							html += '<div class="col-md-4">';
							html += '<div class="box box-primary" >';
							html += '<div class="box-header with-border"><h3 class="box-title">Item ' + (index + 1) + "</h3></div>";
							html += '<div class="box-body">';
							for (const key in item) {
								if (Object.hasOwnProperty.call(item, key)) {
									let element = item[key];
									if (typeof element == "string") {
										let ext = element.split(".").pop();
										if (["jpg", "JPG", "png", "PNG", "jpeg", "JPEG"].indexOf(ext) != -1) {
											html += '<strong><i class="fa fa-image margin-r-5"></i> ' + key + "</strong>";
											if (element.indexOf("http") == 0) {
												element =
													'<a class="fancybox" title="' +
													element +
													'" rel="arr_' +
													key +
													'" href="' +
													element +
													'" ><img class="img-responsive" src="' +
													element +
													'"></a>';
											} else {
												element =
													'<a class="fancybox" title="' +
													_staticUrl +
													element +
													'" rel="arr_' +
													key +
													'" href="' +
													_staticUrl +
													element +
													'" ><img class="img-responsive"  src="' +
													_staticUrl +
													element +
													'"></a>';
											}
										} else {
											html += '<strong><i class="fa fa-book margin-r-5"></i> ' + key + "</strong>";
											element = '<p class="text-muted">' + element + "</p>";
										}

										html += element;
										html += "<hr>";
									} else {
										html += '<strong><i fa fa-file-text-o margin-r-5"></i> ' + key + "</strong>";
										html += '<p class="text-muted">' + element + "</p>";
										html += "<hr>";
									}
								}
							}
							html += "</div>";
							html += "</div>";
							html += "</div>";
						});
						html += "</div>";
						value = html;
					}
				} else {
				}
				break;
			case "String":
				let ext = value.split(".").pop();
				if (["jpg", "JPG", "png", "PNG", "jpeg", "JPEG"].indexOf(ext) != -1) {
					if (value.indexOf("http") == 0) {
						value =
							'<a class="fancybox" title="' +
							value +
							'" rel="' +
							value +
							'" href="' +
							value +
							'" ><img class="avatar" style="max-width: 150px; max-height: 150px;" src="' +
							value +
							'"></a>';
					} else {
						value =
							'<a class="fancybox" title="' +
							_staticUrl +
							value +
							'" rel="' +
							value +
							'" href="' +
							_staticUrl +
							value +
							'" ><img class="avatar" style="max-width: 150px; max-height: 150px;" src="' +
							_staticUrl +
							value +
							'"></a>';
					}
				} else if (value.indexOf("http") == 0 && value.indexOf("graph.facebook") > 0) {
					//photo facebook
					value = '<img class="avatar" style="max-width: 350px;" src="' + value + '">';
				} else if (value.indexOf("https") == 0 && value.indexOf("drive.google.com") > 0) {
					//photo driver
					// value = '<img class="avatar" style="max-width: 350px;" src="' + value + '">';
					value =
						'<a class="fancybox" title="' +
						value +
						'" rel="' +
						value +
						'" href="' +
						value +
						'" ><img class="avatar" style="max-width: 150px; max-height: 150px;" src="' +
						value +
						'"></a>';
				} else {
					if (value.length > 250) {
						value = '<p class="text-muted" style="min-width: 300px !important;">' + value + "</p>";
					} else {
						value = '<p class="text-muted">' + value + "</p>";
					}
				}
				break;
			case "Link":
				value = '<a href="' + value + '">' + value + "</a>";
				break;

			default:
				value = typeof value != "undefined" ? value : "";
		}
		return value;
	} catch (e) {
		console.log(e);
		return "";
	}
};

helper.get_field_value_custom = function (field, value, type, myclass = "") {
	try {
		type = type.toLowerCase();
		if (type !== "boolean" && !value) return value;

		value = this.filterXSS(value);
		switch (type) {
			case "objectid":
				value = value.toString();
				value = `<span class="${myclass}" onclick="click_copy_data_in_list(this)">${value}</span>`;
				break;
			case "date":
				value = moment(new Date(value)).format("YYYY-MM-DD HH:mm:ss");
				value = `<span class="${myclass}" onclick="click_copy_data_in_list(this)">${value}</span>`;
				break;
			case "mixed":
				value = this.get_field_value_custom(field, value, typeof value);
				break;
			case "object":
				if (Array.isArray(value)) {
					value = helper.get_field_value_custom(field, value, "array");
					break;
				}
				value = Object.keys(value)
					.map(function (key) {
						let transform = "";
						switch (typeof value[key]) {
							case "object":
								if (key === "_id") {
									return `<div class="item"><label>${key}</label>: ${value[key].toString()}</div>`;
								}
								if (Array.isArray(value[key])) {
									transform = helper.get_field_value_custom(key, value[key], "array");
								} else {
									transform = helper.get_field_value_custom(key, value[key], value[key] instanceof Date ? "date" : typeof value[key]);
								}
								break;
							case "string":
								transform = helper.get_field_value_custom(key, value[key], "string", "text-yellow");
								break;

							case "number":
								return `<div class="item"><label>${key}</label>:<span class="pull-right text-green" onclick="click_copy_data_in_list(this)">${value[key]}</span></div>`;

							default:
								transform = `<span class="pull-right text-blue" onclick="click_copy_data_in_list(this)">${value[key]}</span>`;
								break;
						}
						return `<div class="item"><label>${key}</label>: ${transform}</div>`;
					})
					.join("");

				if (value != "") {
					value = `<div class="render-field">${value}</div>`;
				}
				break;
			case "array":
				value = value.length > 0 ? value.map((v) => helper.get_field_value_custom(null, v, typeof v)).join("<br>") : value;
				if (value != "") {
					value = `<div class="render-field">${value}</div>`;
				}
				break;
			case "string":
				let ext = value.split(".").pop();
				if (["jpg", "JPG", "png", "PNG", "jpeg", "JPEG"].indexOf(ext) != -1) {
					if (value.indexOf("http") == 0) {
						value =
							'<a class="fancybox pull-right" title="' +
							value +
							'" rel="' +
							value +
							'" href="' +
							value +
							'" ><img class="avatar" style="max-width: 30px; max-height: 25px;" src="' +
							value +
							'"></a>';
					} else {
						value =
							'<a class="fancybox pull-right" title="' +
							_staticUrl +
							value +
							'" rel="' +
							value +
							'" href="' +
							_staticUrl +
							value +
							'" ><img class="avatar" style="max-width: 20px; max-height: 20px;" src="' +
							_staticUrl +
							value +
							'"></a>';
					}
				} else if (value.indexOf("http") == 0 && value.indexOf("graph.facebook") > 0) {
					//photo facebook
					value = '<img class="avatar pull-right" style="max-width: 150px;" src="' + value + '">';
				} else if (value.indexOf("https") == 0 && value.indexOf("drive.google.com") > 0) {
					//photo driver
					// value = '<img class="avatar" style="max-width: 350px;" src="' + value + '">';
					value =
						'<a class="fancybox pull-right" title="' +
						value +
						'" rel="' +
						value +
						'" href="' +
						value +
						'" ><img class="avatar" style="max-width: 30px; max-height: 25px;" src="' +
						value +
						'"></a>';
				} else if (value.indexOf("https") == 0 && value.indexOf("googleusercontent.com") > 0) {
					//photo driver
					// value = '<img class="avatar" style="max-width: 350px;" src="' + value + '">';
					value =
						'<a class="fancybox pull-right" title="' +
						value +
						'" rel="' +
						value +
						'" href="' +
						value +
						'" ><img class="avatar" style="max-width: 350px;" src="' +
						value +
						'"></a>';
				} else {
					if (value.length > 250) {
						value = `<span class="text-muted ${myclass} pull-right" style="min-width: 300px !important; text-align: justify;" onclick="click_copy_data_in_list(this)">${value}</span>`;
					} else {
						value = `<span class="text-muted ${myclass} pull-right" style="text-align: justify;" onclick="click_copy_data_in_list(this)">${value}</span>`;
					}
				}
				break;
			case "link":
				value = '<a href="' + value + '">' + value + "</a>";
				break;
			case "boolean":
				value = `<span  class="label label-${value ? "success" : "danger"} pull-right ${myclass}">${value}</span>`;
				break;
			case "number":
				value = `<span onclick="click_copy_data_in_list(this)" class="label label-${value ? "success" : "danger"} pull-right ${myclass}">${value}</span>`;
				break;

			default:
				value = typeof value != "undefined" ? value : "";
		}
		return value;
	} catch (e) {
		console.log(e);
		return "";
	}
};

helper.get_query_data = function (data, field) {
	var value = "";
	if (data === null || typeof data != "object" || !field) {
		return value;
	}
	try {
		if (data[field] !== undefined) {
			value = data[field];
		} else if (typeof data[0] !== "undefined") {
			value = data[0][field];
		}
		return this.filterXSS(value);
	} catch (e) {
		console.log(e);
		return this.filterXSS(value);
	}
};

helper.loadTags = async function (data, field) {
	try {
		const weddingModal = require("../modules/weddings/models");
		const items = await weddingModal.findAll("wd_invitees", { status: 1 }, "name slug_name status");
		let options = ``;
		for (let item = 0; item < items.length; item++) {
			const element = items[item];
			options += options += `<option value="${element?.slug_name}">${element?.name}</option>`;
		}
		return options;
	} catch (e) {
		console.log(e);
		return null;
	}
};

module.exports = helper;
