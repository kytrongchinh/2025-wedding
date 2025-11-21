"use strict";

const express = require("express");
const mongoose = require("mongoose");
const tools = express.Router();
/***********ROUTER***************/

const mdw = async function (req, res, next) {
	//return res.send('Done')
	return next();
};

tools.get("/", mdw, function (req, res) {
	try {
		var dataView = helpers.admin.get_data_view_admin(req);
		return res.render("./admin/tools/index", dataView);
	} catch (e) {
		console.log(e);
		return res.redirect(_adminUrl);
	}
});

/* Get zalo profile by zalo_id or phone
 *
 */
tools.get("/get_profile", mdw, async function (req, res) {
	try {
		const k = req.query.k;
		if (!k) return res.send("Missing params k: ?k=zalo_id");

		const zaloApi = new libs.zalo();
		const data = await zaloApi.getProfileUser(k);
		if (data.error == 0 && data.data.birth_date) {
			data.data.birth_date = helpers.date.format(data.data.birth_date * 1000, "DD/MM/YYYY");
		}
		return res.send(data);
	} catch (e) {
		console.log(e);
		return res.send("Error: " + e.message);
	}
});

/* Check mongo or redis version
 *
 */
tools.get("/check_versions", mdw, async function (req, res) {
	try {
		//return res.send('Done')

		const admin = new mongoose.mongo.Admin(mongoose.connection.db);
		const [infoRedis, infoMongo] = await Promise.all([admin.buildInfo(), libs.redis.info()]);
		return res.json({ infoRedis: infoRedis, infoMongo: infoMongo });
	} catch (e) {
		return res.send("Error: " + e.message);
	}
});

/* Check collection information
 */
tools.get("/check_collection", mdw, async function (req, res) {
	try {
		//return res.send('Done')

		var col = req.query.k;
		if (!col) return res.send("Missing params: ?k=colection");
		var cur_db = mongoose.connection.db;
		var collinfo = await cur_db.listCollections({ name: col }).next();
		if (collinfo) {
			var indexes = await cur_db.collection(col).indexes();
			collinfo["indexes"] = indexes;
			return res.json(collinfo);
		}
		return res.send("Error: Not found collection " + col);
	} catch (e) {
		return res.send("Error: " + e.message);
	}
});

tools.get("/check_index_collection", async function (req, res) {
	// return res.send('Done');
	var cur_mrd_db = mongoose.connection.db;
	var indexes = [];
	let collections = await cur_mrd_db.collections();
	collections.forEach(async (col, index) => {
		let id = await col.indexes();
		// console.log(col.s.namespace.collection,'col')
		// console.log(col,'col')
		// indexes[col.s.namespace.collection] = id;
		// console.log(indexes)
		id["collection_name"] = col.s.namespace.collection;
		let d = {
			collection_name: col.s.namespace.collection,
			id,
		};
		indexes.push(d);
		if (index == collections.length - 1) {
			return res.send(indexes);
		}
	});
});

/* Set unique
 */
tools.get("/set_unique", mdw, async function (req, res) {
	// return res.send('Done');
	try {
		var col = req.query.c;
		var fields = req.query.f;
		if (!col || !fields) return res.send("Missing params: ?c=colection&f=field1,field2");

		fields = fields.split(",");
		var keys = {};
		fields.forEach((i) => {
			keys[i] = 1;
		});

		var cur_db = mongoose.connection.db;
		var collinfo = await cur_db.listCollections({ name: col }).next();

		if (collinfo) {
			var result = await cur_db.collection(col).createIndex(keys, { unique: true });
			return res.send(result);
		}

		return res.send("Error: Not found collection " + col);
	} catch (e) {
		return res.send("Error: " + e.message);
	}
});

/* Set unique
 */
tools.get("/set_index", mdw, async function (req, res) {
	// return res.send('Done');
	try {
		var col = req.query.c;
		var fields = req.query.f;
		if (!col || !fields) return res.send("Missing params: ?c=colection&f=field1,field2");

		fields = fields.split(",");
		var keys = {};
		fields.forEach((i) => {
			keys[i] = 1;
		});

		var cur_db = mongoose.connection.db;
		var collinfo = await cur_db.listCollections({ name: col }).next();

		if (collinfo) {
			var result = await cur_db.collection(col).createIndex(keys, { unique: false });
			return res.send(result);
		}

		return res.send("Error: Not found collection " + col);
	} catch (e) {
		return res.send("Error: " + e.message);
	}
});

/* Remove unique
 */
tools.get("/remove_unique", mdw, async function (req, res) {
	// return res.send("Done");
	try {
		var col = req.query.c;
		var fields = req.query.f;
		if (!col || !fields) return res.send("Missing params: ?c=colection&f=field1,field2");

		fields = fields.split(",");
		var keys = {};
		fields.forEach((i) => {
			keys[i] = 1;
		});

		var cur_db = mongoose.connection.db;
		var collinfo = await cur_db.listCollections({ name: col }).next();

		if (collinfo) {
			var result = await cur_db.collection(col).dropIndex(keys, { unique: true });
			return res.send(result);
		}

		return res.send("Error: Not found collection " + col);
	} catch (e) {
		return res.send("Error: " + e.message);
	}
});

/*
 List collection
 */
tools.get("/list_collection", mdw, function (req, res) {
	// return res.send("Done");
	try {
		var data = { title: "List Collections" };
		var cur_db = mongoose.connection.db;
		cur_db.listCollections().toArray(function (err, names) {
			if (err) {
				data.error = err;
				res.send(data);
			} else {
				data.collections = [];
				names.forEach(function (e, i, a) {
					//console.log(i);
					//console.log("--->>", e.name);
					data.collections.push(e.name);
					//data.collections[i] = e.name;
				});
				res.send(data);
			}
		});
	} catch (e) {
		console.log(e);
	}
});

/*
 Xoa collection
 */
tools.get("/remove_collection", mdw, function (req, res) {
	return res.send("Done");
	try {
		var collect_name = req.query.k;
		if (collect_name === undefined) {
			return res.send("Missing param k: ?k=adfashd");
		}

		//Xoa collection
		var cur_mrd_db = mongoose.connection.db;
		try {
			cur_mrd_db.dropCollection(collect_name, function (err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send(result);
				}
			});
		} catch (e) {
			res.send(e.message);
		}
	} catch (e) {
		res.send(e.message);
	}
});

tools.get("/format_collection", mdw, async function (req, res) {
	// return res.send("Done");
	try {
		var collect_name = req.query.k;
		if (collect_name === undefined) {
			return res.send("Missing param k: ?k=adfashd");
		}
		if (appConfig.env == "production") {
			const moment = require("moment");
			const today = moment().format("YYYY-MM-DD");
			if(today >= "2023-11-01"){
				return res.send("Done");
			}
		}
		//Xoa collection
		var cur_mrd_db = mongoose.connection.db;
		var collectionName = collect_name;

		// Use the deleteMany method to delete all documents in the collection
		cur_mrd_db.collection(collectionName).deleteMany({}, function (err, result) {
			if (err) {
				console.error("Error emptying collection:", err);
			} else {
				console.log(`Deleted ${result.deletedCount} documents from the ${collectionName} collection.`);
			}
		});
		res.send(collect_name);
	} catch (e) {
		res.send(e.message);
	}
});

module.exports = tools;
