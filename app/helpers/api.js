const JSONbigString = require("json-bigint")({ storeAsString: true });
var moment = require("moment");
var fs = require("fs");
var helper = {};

helper.getLastLogin = (req) => {
	let ip_user =
		req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
	let userAgent = typeof req.headers === "object" && typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "";
	let time = moment(Date.now()).format("DD-MM-YYYY HH:mm:ss");
	let last_login = {
		ip: ip_user,
		userAgent: userAgent,
		timeLogin: time,
		// numberLogin: 1,
	};
	return last_login;
};

helper.random = function (length, chars) {
	var crypto = require("crypto");
	chars = chars || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
	var rnd = crypto.randomBytes(length),
		value = new Array(length),
		len = Math.min(256, chars.length),
		d = 256 / len;

	for (let i = 0; i < length; i++) {
		// console.log(rnd[i],'rnd[i]', i);
		// console.log(Math.floor(rnd[i] / d),'Math.floor(rnd[i] / d)', i);
		value[i] = chars[Math.floor(rnd[i] / d)];
	}
	return value.join("");
};

helper.get_colors = function (index) {
	let colors = ["red", "green", "black", "while", "gray", "maroon", "purple", "silver", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"];
	if (index < colors.length) {
		return colors[index];
	} else {
		return "gray";
	}
};

helper.get_operators = function (operator) {
	let operators = ["eq", "gt", "gte", "in", "lt", "lte", "ne", "nin"];
	let op = operators.filter((ope) => {
		return ope == operator;
	});
	if (op.length > 0) {
		return "$" + op[0];
	} else {
		return "$eq";
	}
};

helper.get_condition_add = (where) => {
	let condition_add = {};
	try {
		let field_where = where.split(",");
		field_where.forEach((element) => {
			let fields = element.split("=");
			if (fields.length == 2) {
				let key_field = fields[0];
				let value = fields[1];
				if (typeof value.split("|")[1] != "undefined") {
					let operator_set = value.split("|")[1];
					let operator = helpers.api.get_operators(operator_set);
					if (typeof value.split("|")[2] != "undefined" && value.split("|")[2] == "n") {
						value = parseInt(value.split("|")[0]);
						let va = {};
						if (operator == "$nin" || operator == "$in") {
							va[`${operator}`] = [value];
						} else {
							va[`${operator}`] = value;
						}

						condition_add[`${key_field}`] = va;
					} else {
						value = value.split("|")[0];
						let va = {};
						if (operator == "$nin" || operator == "$in") {
							va[`${operator}`] = [value];
						} else {
							va[`${operator}`] = value;
						}
						condition_add[`${key_field}`] = va;
					}
				} else {
					value = value.split("|")[0];
					let va = {};
					let operator = "$eq";
					if (operator == "$nin" || operator == "$in") {
						va[`${operator}`] = [value];
					} else {
						va[`${operator}`] = value;
					}
					condition_add[`${key_field}`] = va;
				}
			}
		});
		return condition_add;
	} catch (error) {
		return condition_add;
	}
};

module.exports = helper;
