var moment = require("moment");
var fs = require("fs");
var applog = {};

applog.writeError = function (data, label = "", file_name = "") {
	try {
		var today = new Date();
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");
		var dir = _basepath + "media/logs/error/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_" + (file_name || "error") + ".txt";

		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			data = logTime + " " + label + " " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

applog.writeData = function (data, label = "", file_name = "") {
	try {
		var today = new Date();
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");
		var dir = _basepath + "media/logs/data/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_" + (file_name || "error") + ".txt";

		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			data = JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

applog.writeRequest = function (req) {
	try {
		var params = {
			ua: req.get("User-Agent"),
			headers: req.headers,
			ip_address: helpers.base.getIpAdress(req),
		};
		//console.log('params',params);
		//return true;

		var today = new Date();
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");
		var dir = _basepath + "media/logs/error/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_" + "request.txt";
		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			var data = logTime + " " + JSON.stringify(params) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

applog.tracking = async function (req) {
	try {
		var admin_userdata = req.session.admin_userdata;
		if (typeof admin_userdata === "undefined" || admin_userdata === null) {
			return;
		}
		//ignore router unnecessary
		var resources = helpers.base.parse_resource(req.originalUrl);
		if (resources.method == "import" || resources.method == "export") {
			return;
		}

		let query = null;
		if (req.method == "GET" && Object.keys(req.query).length > 0) {
			query = Object.assign({}, req.query);
		} else if (req.method == "POST" && Object.keys(req.body).length > 0) {
			query = Object.assign({}, req.body);
		}
		if (!query) return;

		//ignore fields unnecessary
		if (typeof query.password != undefined) delete query.password;
		if (typeof query.old_password != undefined) delete query.old_password;
		if (typeof query.new_password != undefined) delete query.new_password;
		if (typeof query.password != undefined) delete query.retype_password;
		if (typeof query.new_avatar != undefined) delete query.new_avatar;
		if (typeof query._csrf !== undefined) delete query._csrf;
		if (typeof query["g-recaptcha-response"] !== undefined) delete query["g-recaptcha-response"];

		var data = {
			url: req.originalUrl,
			query: query,
		};

		var today = new Date();
		var logTime = moment(today).format("HH:mm:ss");

		var dir = _basepath + "media/logs/tracking/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_tracking.txt";
		var fol = await this.createFolder(dir);
		if (fol === true) {
			var data_log = logTime + " " + admin_userdata.username + " " + req.method + " " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data_log);
			stream.on("error", function (e) {
				stream.end();
			});
		}
	} catch (e) {
		console.log(e.message);
	}
};

applog.logDelete = async function (req, data) {
	try {
		var admin_userdata = req.session.admin_userdata;
		if (typeof admin_userdata === "undefined" || admin_userdata === null) {
			return;
		}

		var today = new Date();
		var logTime = moment(today).format("HH:mm:ss");

		var dir = _basepath + "media/logs/data_delete/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_data_delete.txt";
		var fol = await this.createFolder(dir);
		if (fol === true) {
			var data_log = logTime + " " + admin_userdata.username + " DELETE " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data_log);
			stream.on("error", function (e) {
				stream.end();
			});
		}
	} catch (e) {
		console.log(e.message);
	}
};

applog.createFolder = function (dir) {
	return new Promise(function (resolve, reject) {
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				//no such file or folder
				if (err.code == "ENOENT") {
					fs.mkdir(dir, { recursive: true }, (err) => {
						if (err) {
							console.log("fs.mkdir", err);
							return resolve(false);
						} else {
							return resolve(true);
						}
					});
				} else {
					//not permitted or any reasons
					console.log("fs.access", err);
					return resolve(false);
				}
			} else {
				return resolve(true);
			}
		});
	});
};

applog.remove = function (path) {
	var dir = _basepath + "media/logs/" + path;

	fs.stat(dir, function (err, stats) {
		if (err) {
			return false;
		}

		fs.unlink(dir, function (err) {
			if (err) return console.log(err);
		});
	});
	return true;
};

applog.debug = function (data, label = "", file_name = "") {
	try {
		var today = new Date();
		var dir = _basepath + "media/logs/debug/";
		var logfile = file_name ? file_name + ".txt" : "debug.txt";
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");

		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			data = logTime + " " + label + " " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logfile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

applog.writeDebugByDate = function (data, label = "", file_name = "") {
	try {
		var today = new Date();
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");
		var dir = _basepath + "media/logs/debug/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_" + (file_name || "debug") + ".txt";

		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			data = logTime + " | " + label + " | " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

applog.writeErrorWithMsg = function (data, errorMsg, label = "", file_name = "") {
	try {
		var today = new Date();
		var logTime = moment(today).format("YYYY-MM-DD HH:mm:ss");
		var dir = _basepath + "media/logs/error/" + moment(today).format("YYYY/MM/DD") + "/";
		var logFile = moment(today).format("YYYYMMDD") + "_" + (file_name || "error") + ".txt";

		//Check if the file exists in the current directory.
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				try {
					fs.mkdirSync(dir, { recursive: true });
				} catch (e) {
					console.log("mkdirSync", e);
					return false;
				}
			}
			data = logTime + " " + label + " | " + errorMsg + " | " + JSON.stringify(data) + "\n";
			var stream = fs.createWriteStream(dir + logFile, { flags: "a" }).end(data);
			stream.on("error", function (e) {
				stream.end();
			});
			return true;
		});
	} catch (e) {
		console.log(e);
		return false;
	}
};

module.exports = applog;
