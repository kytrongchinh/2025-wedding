"use strict";

class MyModel {
	constructor(c_db) {
		this.db = c_db;
	}

	filterData(modelName, data, exclude = "__v") {
		let result = {};
		try {
			let paths = this.db[modelName].schema.paths;
			let field_keys = [];
			let field_types = {};
			if (helpers.base.typeof(exclude) === "string") {
				exclude = exclude.split(" ");
			}
			Object.keys(paths).forEach(function (field) {
				if (exclude.indexOf(field) === -1) {
					field_keys.push(field);
					field_types[field] = paths[field].instance;
				}
			});
			Object.keys(data).forEach(function (key) {
				if (field_keys.indexOf(key) >= 0) {
					if (field_types[key] == "Mixed") {
						result[key] = helpers.base.json_data(data[key]);
					} else {
						result[key] = data[key];
					}
				}
			});
			return result;
		} catch (e) {
			console.log(e);
			return result;
		}
	}

	async get_fields(mod_config, exclude = "__v", role = null) {
		var arrField = {};
		try {
			var paths = this.db[mod_config.collection].schema.paths;
			var custom_keys = null;
			if (role) {
				custom_keys = await helpers.admin.get_custom_fields(mod_config.module, mod_config.resource, role);
			}
			var fields = custom_keys === null ? Object.keys(paths) : custom_keys;
			if (fields) {
				fields.map(function (field) {
					if (typeof exclude == "string") exclude = exclude.split(" ");
					if (exclude.indexOf(field) === -1 && paths[field] != undefined) {
						arrField[field] = paths[field].instance;
					}
				});
			}
			return arrField;
		} catch (e) {
			console.log("get_fields", e);
			return {};
		}
	}

	async find(model_name, where = {}, fields = "", order = {}, limit = 20, skip = 0) {
		try {
			let items = await this.db[model_name].find(where, fields).skip(skip).sort(order).limit(limit);
			return items ? items : null;
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	async findAll(model_name, where = {}, fields = "", order = {}, callback = null) {
		try {
			let items = await this.db[model_name].find(where, fields).sort(order);
			return callback ? callback(items) : items;
		} catch (e) {
			console.log("error", e);
			return callback ? callback(null) : null;
		}
	}

	async findOne(model_name, where = {}, fields = "") {
		try {
			// console.log(model_name, where, "findOne");
			let item = await this.db[model_name].findOne(where, fields);
			return item ? item : null;
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	async findOneOrder(model_name, where = {}, fields = "", order = {}) {
		try {
			let item = await this.db[model_name].findOne(where, fields).sort(order);
			return item ? item : null;
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	async get_stream(model_name, where, str_fields = "", order = { createdAt: "desc" }) {
		try {
			let items = await this.db[model_name].find(where, str_fields).lean(true).cursor();

			return items;
		} catch (err) {
			console.log(err);
			return {};
		}
	}

	//count
	async count(model_name, where = {}) {
		try {
			var total = await this.db[model_name].countDocuments(where);
			return parseInt(total);
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	//count distinct
	async distinct(model_name, field, where) {
		try {
			var total = await this.db[model_name].distinct(field, where);
			return total.length;
		} catch (e) {
			console.log("error", e);
			return null;
		}
	}

	/** Create
	 *
	 * return object {status,msg}
	 *
	 */
	async create(model_name, data) {
		var result = { status: false, msg: "" };
		if (!data || Object.keys(data).length <= 0) {
			result.msg = "Missing data";
			return result;
		}

		try {
			let new_item = await this.db[model_name].create(data);
			if (new_item) {
				result.status = true;
				result.msg = new_item;
			}
			return result;
		} catch (e) {
			console.log(e);
			result.msg = e.message;
			return result;
		}
	}
	async create1(model_name, data, check_field = false, callback = false) {
		var result = { status: false, msg: "" };
		if (!data || Object.keys(data).length <= 0) {
			result.msg = "Missing data";
			return callback ? callback(result) : result;
		}

		try {
			let mySchema = this.db[model_name];
			let tmp = eval(new mySchema(data));
			let new_item = await tmp.save();
			if (new_item) {
				result.status = true;
				result.msg = new_item;
			}
			return callback ? callback(result) : result;
		} catch (e) {
			console.log(e);
			result.msg = e.message;
			return callback ? callback(result) : result;
		}
	}

	async insertMany(model_name, data, callback) {
		var result = { status: false, msg: "" };

		try {
			let insert = await this.db[model_name].insertMany(data);
			if (insert) {
				result.status = true;
				result.msg = insert;
			}
			return callback ? callback(result) : result;
		} catch (e) {
			result.msg = e.message;
			return callback ? callback(result) : result;
		}
	}

	/** Update one document
	 * options : {"new" : return new data, "upsert": create new if do not exist}
	 *
	 * return object {status,msg}
	 *
	 */
	async updateOne(modelName, where, data, options) {
		let result = { status: false, msg: "" };
		try {
			options = options || { new: true, upsert: false };
			let update = await this.db[modelName].findOneAndUpdate(where, data, options);
			if (update) {
				result.status = true;
				result.msg = update;
			}
			return result;
		} catch (e) {
			result.msg = e.message;
			return result;
		}
	}

	/** Update
	 *
	 * return object {status,msg}
	 *
	 */
	async updateMany(model_name, where, data, check_field = false) {
		var result = { status: false, msg: "" };
		try {
			if (check_field) {
				result.msg = this.check_fields(model_name, data);
				if (result.msg) return result;
			}

			let update = await this.db[model_name].updateMany(where, data);
			if (update) {
				result.status = true;
				result.msg = update;
			}
			return result;
		} catch (e) {
			result.msg = e.message;
			return result;
		}
	}

	/** Delete many
	 *
	 * return object {status,msg}
	 *
	 */
	async removeDocs(model_name, condition) {
		var result = { status: false, msg: "" };
		try {
			let del = await this.db[model_name].deleteOne(condition);
			if (del) result.status = true;
			return result;
		} catch (e) {
			result.msg = e.message;
			return result;
		}
	}

	/** Delete many
	 *
	 * return object {status,msg}
	 *
	 */
	async deleteMany(model_name, condition) {
		var result = { status: false, msg: "" };
		try {
			let del = await this.db[model_name].deleteMany(condition);
			if (del) result.status = true;
			return result;
		} catch (e) {
			result.msg = e.message;
			return result;
		}
	}

	/** Delete one
	 *
	 * return object {status,msg}
	 *
	 */
	async deleteOne(model_name, condition) {
		var result = { status: false, msg: "" };
		try {
			let del = await this.db[model_name].deleteOne(condition);
			if (del) result.status = true;
			return result;
		} catch (e) {
			result.msg = e.message;
			return result;
		}
	}

	//aggregate
	async aggregate(model_name, where, group_by, sum_by) {
		let items;
		items = await this.db[model_name].aggregate([
			{
				$group: {
					_id: "$" + group_by,
					count: { $sum: 1 },
				},
			},
		]);
		return items;
	}

	async getRandom(model_name, num) {
		let items;
		items = await this.db[model_name].aggregate([{ $sample: { size: num } }]);
		return items;
	}

	// aggregate custom with query
	async aggregateCustom(model_name, query) {
		let items;
		items = await this.db[model_name].aggregate(query);
		return items;
	}

	// aggregate stream data
	async aggregateCustomStream(model_name, query) {
		let items;

		items = await this.db[model_name].aggregate(query).cursor({ batchSize: 100 }).exec();
		// items = await this.db[model_name].aggregate(query);
		return items;
	}
}

module.exports = MyModel;
