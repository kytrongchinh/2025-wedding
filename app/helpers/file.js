const fs = require("fs");
const path = require("path");
const moment = require("moment");
const validator = require("validator");

const helper = {};

helper.createFolder = function (dir) {
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

helper.writeBase64 = function (base64Data, path) {
	return new Promise(async function (resolve, reject) {
		try {
			//isBase64
			if (!validator.isBase64(base64Data, { urlSafe: true })) {
				throw new Error(`Value must be Base64`);
			}

			if (base64Data.indexOf("data:image") === -1) return resolve(false);
			base64Data = base64Data
				.replace(/^data:image\/png;base64,/, "")
				.replace(/^data:image\/jpg;base64,/, "")
				.replace(/^data:image\/jpeg;base64,/, "");
			var dir = _basepath + path;
			var file_name = `${helpers.base.random(50)}_${new Date().getTime()}.jpg`;
			fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
				if (err) {
					if (err.code == "ENOENT") {
						fs.mkdir(dir, { recursive: true }, (err) => {
							if (err) {
								console.log("mkdir", err);
								resolve(false);
							} else {
								//callback writeFile
								fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
									return err ? resolve(false) : resolve(path + "/" + file_name);
								});
							}
						});
					} else {
						resolve(false);
					}
				} else {
					resolve(path + "/" + file_name);
				}
			});
		} catch (e) {
			console.log(e);
			resolve(false);
		}
	});
};

helper.uploadThumbnail = function (file) {
	return new Promise(function (resolve, reject) {
		var today = new Date();
		var file_name = `${helpers.base.random(50)}_${new Date().getTime()}.jpg`;

		var path = "media/photo/" + moment(today).format("YYYY/MM/DD") + "/";
		var dir = _basepath + path;
		var img_link = _staticUrl + path + file_name;

		fs.writeFile(dir + file_name, file.data, (err) => {
			//success
			if (err === null) return resolve({ error: null, link: img_link });
			//error
			if (err.code == "ENOENT") {
				//create folder
				fs.mkdir(dir, { recursive: true }, (err) => {
					if (err === null) {
						fs.writeFile(dir + file_name, file.data, (err) => {
							//success
							if (err === null) return resolve({ error: null, link: img_link });
							//error
							return resolve({ error: err.message });
						});
					} else {
						return resolve({ error: err.message });
					}
				});
			} else {
				return resolve({ error: err.message });
			}
		});
	});
};

helper.removeFile = function (path) {
	return new Promise(function (resolve, reject) {
		var dir = _basepath + "/" + path;
		//check exists
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err === null) {
				//unlink
				fs.unlink(dir, function (err) {
					if (err === null) {
						resolve(true);
					} else {
						console.log(err);
						resolve(false);
					}
				});
			} else {
				console.log(err);
				resolve(false);
			}
		});
	});
};

var deleteFolderRecursive = function (dir) {
	try {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(function (file, index) {
				var curPath = dir + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) {
					// recurse
					deleteFolderRecursive(curPath);
				} else {
					// delete file
					console.log("curPath", curPath);
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(dir);
		}
	} catch (e) {
		console.log(e);
	}
};

/**
 * Clear cache static urls
 * @param {String|Array} url Static url
 */
helper.clearCacheStatic = async function (urls) {
	try {
		if (!urls) throw new Error("Empty url");
		if (typeof urls == "string") {
			urls = [urls];
		} else if (Array.isArray(urls)) {
		} else {
			throw new Error("Invalid url: String|Array required");
		}
		const urlFilter = (link) => {
			link = link.replace(_basepath, "");
			link = link.match(/^http(s)?:\/\/.*/) ? link : url.resolve(_staticUrl, link);
			link = link.replace(/^https/g, "http");
			return encodeURI(link);
		};
		urls = urls.map(urlFilter);
		let linkArr = urls.join(",");
		let params = {
			url: "https://api.clearcache.zalo.so/v4/Teec4Knlus6umFK7vv5R?linkArr=" + linkArr,
			method: "GET",
			headers: {
				Accept: "text/html",
				"Content-type": "application/x-www-form-urlencoded; charset=utf-8",
			},
			no_proxy: true,
		};
		let result = await helpers.base.http_request(params);
		return {
			error: 0,
			result,
			urls,
		};
	} catch (error) {
		return {
			error: 1,
			msg: error.message,
		};
	}
};

helper.getRecursivePath = function (dir, file_only) {
	try {
		var paths = {
			[dir]: [],
		};
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(function (file, index) {
				var curPath = path.join(dir, file);
				if (fs.lstatSync(curPath).isDirectory()) {
					// recurse
					var subpaths = helper.getRecursivePath(curPath);
					paths[dir].push(subpaths);
				} else {
					paths[dir].push(curPath);
				}
			});
		}
		return paths;
	} catch (e) {
		console.log(e);
		return [];
	}
};

helper.removeModule = function (modules) {
	modules.forEach(function (module) {
		var dir_module = _basepath + "app/modules/" + module;
		var dir_views = _basepath + "app/views/" + module;
		deleteFolderRecursive(dir_module);
		deleteFolderRecursive(dir_views);
	});
};

helper.removeResource = function (resources) {
	//return false;
	resources.forEach(function (resource) {
		var file_model = "app/modules/" + resource.module + "/models/" + resource.collection_name + ".js";
		var file_route = "app/modules/" + resource.module + "/routes/" + resource.name + ".js";
		var dir_views = _basepath + "app/views/" + resource.module + "/" + resource.name;
		helpers.file.removeFile(file_model);
		helpers.file.removeFile(file_route);
		deleteFolderRecursive(dir_views);
	});
};

helper.removeFile = function (path) {
	return new Promise(function (resolve, reject) {
		var dir = _basepath + "/" + path;
		//check exists
		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err === null) {
				//unlink
				fs.unlink(dir, function (err) {
					if (err === null) {
						resolve(true);
					} else {
						console.log(err);
						resolve(false);
					}
				});
			} else {
				console.log(err);
				resolve(false);
			}
		});
	});
};

var deleteFolderRecursive = function (dir) {
	try {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(function (file, index) {
				var curPath = dir + "/" + file;
				if (fs.lstatSync(curPath).isDirectory()) {
					// recurse
					deleteFolderRecursive(curPath);
				} else {
					// delete file
					console.log("curPath", curPath);
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(dir);
		}
	} catch (e) {
		console.log(e);
	}
};

helper.writeMyBase64New = function (base64Data, is_resize = false, path, file_name, file_name_resize) {
	return new Promise(async function (resolve, reject) {
		try {
			//isBase64
			if (!validator.isBase64(base64Data, { urlSafe: true })) {
				// throw new Error(`Value must be Base64`);
			}
			if (base64Data.indexOf("data:image") === -1) return resolve(false);
			base64Data = base64Data
				.replace(/^data:image\/png;base64,/, "")
				.replace(/^data:image\/jpg;base64,/, "")
				.replace(/^data:image\/jpeg;base64,/, "");

			let dir = _basepath + path;

			fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
				console.log(err, "err");
				if (err) {
					if (err.code == "ENOENT") {
						fs.mkdir(dir, { recursive: true }, (err) => {
							if (err) {
								console.log("mkdir", err);
								resolve(false);
							} else {
								//callback writeFile
								fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
									if (is_resize == true) {
										helpers.photo.resizeCustom(path + "/" + file_name, path + "/" + file_name_resize, "thumb");
									}
									return err ? resolve(false) : resolve(path + "/" + file_name);
								});
							}
						});
					} else {
						resolve(false);
					}
				} else {
					if (is_resize == true) {
						helpers.photo.resizeCustom(path + "/" + file_name, path + "/" + file_name_resize, "thumb");
					}
					resolve(path + "/" + file_name);
				}
			});
		} catch (e) {
			console.log(e);
			resolve(false);
		}
	});
};

helper.writeMyBase64 = function (base64Data, path, file_name) {
	return new Promise(async function (resolve, reject) {
		try {
			if (base64Data.indexOf("data:image") === -1) return resolve(false);
			base64Data = base64Data
				.replace(/^data:image\/png;base64,/, "")
				.replace(/^data:image\/jpg;base64,/, "")
				.replace(/^data:image\/jpeg;base64,/, "");

			let dir = _basepath + path;

			fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
				console.log(err, "err");
				if (err) {
					if (err.code == "ENOENT") {
						fs.mkdir(dir, { recursive: true }, (err) => {
							if (err) {
								console.log("mkdir", err);
								resolve(false);
							} else {
								//callback writeFile
								fs.writeFile(dir + "/" + file_name, base64Data, "base64", function (err) {
									return err ? resolve(false) : resolve(path + "/" + file_name);
								});
							}
						});
					} else {
						resolve(false);
					}
				} else {
					resolve(path + "/" + file_name);
				}
			});
		} catch (e) {
			console.log(e);
			resolve(false);
		}
	});
};

module.exports = helper;
