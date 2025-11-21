const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const JSONbigString = require("json-bigint")({ storeAsString: true });
const fs = require("fs");
const crypto = require("crypto");
const MobileDetect = require("mobile-detect");
const validator = require("validator");

const helper = {};

/* Redirect intenal
 *
 * @param res
 * @param path
 */
helper.redirect = function (res, path) {
	path = path ? path.replace(_baseUrl, "") : "";
	res.redirect(_baseUrl + path);
	res.end();
};

helper.redirect_oa = function (res) {
	return res.redirect(appConfig.zalo_oa.url);
};

/**
 *
 * @param originalUrl
 * @returns {Promise}
 */
helper.parse_resource = function (originalUrl) {
	var routes = { module: "", resource: "", method: "" };
	try {
		originalUrl = originalUrl.replace(appConfig.prefix, "");
		originalUrl = originalUrl.split("?")[0];
		originalUrl = originalUrl
			.replace(/(\/|\?)/g, " ")
			.trim()
			.split(" ");
		routes.module = typeof originalUrl[0] != "undefined" ? originalUrl[0] : "";
		routes.resource = typeof originalUrl[1] != "undefined" ? originalUrl[1] : "";
		routes.method = typeof originalUrl[2] != "undefined" ? originalUrl[2] : "view";
		return routes;
	} catch (e) {
		console.log("parse_resource", e.message);
		return routes;
	}
};

/**
 * Create array range
 * @param start, stop, step
 * @returns []
 */
helper.arrayRange = function (start, stop, step) {
	return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
};

/**
 * Convert array to array unique
 * @param array
 * @returns {*}
 */
helper.arrayUnique = function (array) {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j]) a.splice(j - 1, 1);
		}
	}
	return a;
};

helper.arrayContainsArray = function (needle, haystack) {
	for (var i = 0; i < needle.length; i++) {
		if (haystack.indexOf(needle[i]) === -1) return false;
	}
	return true;
};

helper.compare = function (a, b) {
	if (a.last_nom < b.last_nom) {
		return -1;
	}
	if (a.last_nom > b.last_nom) {
		return 1;
	}
	return 0;
};

/* Convert anything to Integer or 0 ...
 *
 * @param mix num
 * @param signed Boolean (accept num < 0)
 * @return Number
 */
helper.parseInteger = function (num, signed = false) {
	num = parseInt(num);
	return isNaN(num) ? 0 : signed ? num : Math.abs(num);
};

/** Find name in array by _id
 *
 * @param _id
 * @param arr
 * @returns boolean | string
 */
helper.findNameByID = function (_id, arr) {
	try {
		var result = "";
		if (_id !== null && typeof _id === "object" && _id.constructor !== Array) {
			result = [];
			_id.forEach(function (id) {
				arr.some(function (element) {
					if (element._id == id) {
						result.push(element.name);
						return true;
					}
					return false;
				});
			});
		} else {
			arr.some(function (element) {
				if (element._id == _id) {
					result = element.name;
					return true;
				}
				return false;
			});
		}
		return result;
	} catch (e) {
		return "";
	}
};

/** Request sync
 *
 * @param params :
 *      url
 *      method
 *      data | null
 */
helper.http_request = function (params) {
	//console.log('http_request_axios_params',params);
	return new Promise(function (resolve, reject) {
		if (!params.url) reject(false);
		let headers = {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		};
		if (typeof params.headers === "object") {
			headers = Object.assign(headers, params.headers);
		}
		const axiosOptions = {
			baseURL: params.baseURL || "",
			headers: headers,
			httpsAgent: undefined,
			timeout: 10000,
		};
		if (appConfig.http_proxy != "") {
			axiosOptions.httpsAgent = new HttpsProxyAgent(appConfig.http_proxy);
		}
		const axiosClient = axios.create(axiosOptions);
		if (params.method == "GET") {
			axiosClient
				.get(params.url, params.data)
				.then((res) => {
					// console.log("axios.res.data", res.data);
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err", err);
					reject(null);
				});
		} else if (params.method == "POST") {
			axiosClient
				.post(params.url, params.data)
				.then((res) => {
					// console.log("axios.res.data", res.data);
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err", err);
					reject(null);
				});
		} else {
			reject(null);
		}
	});
};

helper.http_request_new = function (params) {
	//console.log('http_request_axios_params',params);
	return new Promise(function (resolve, reject) {
		if (!params.url) reject(false);
		let headers = {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		};
		if (typeof params.headers === "object") {
			headers = Object.assign(headers, params.headers);
		}
		const axiosOptions = {
			baseURL: params.baseURL || "",
			headers: headers,
			httpsAgent: undefined,
			timeout: 10000,
		};
		if (appConfig.http_proxy != "") {
			axiosOptions.httpsAgent = new HttpsProxyAgent(appConfig.http_proxy);
		}
		const axiosClient = axios.create(axiosOptions);
		if (params.method == "GET") {
			axiosClient
				.get(params.url, params.data)
				.then((res) => {
					// console.log("axios.res.data", res.data);
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err", err);
					reject(null);
				});
		} else if (params.method == "POST") {
			axiosClient
				.post(params.url, params.data)
				.then((res) => {
					// console.log("axios.res.data", res.data);
					resolve(res.data);
				})
				.catch((error) => {
					if (axios.isAxiosError(error)) {
						// Check for HTTP status code
						if (error.response) {
							// console.error("HTTP Status Code:", error.response.status);
							// console.error("Response Data:", error.response.data);
							// console.error("Response Headers:", error.response.headers);
							resolve(error.response.data);
						} else {
							// console.error("No response from server:", error.message);
							reject(null);
						}
					}
				});
		} else {
			reject(null);
		}
	});
};

/* Random one string
 *
 * @param Number len : length of string random
 * @param String chars : string pattern
 *    1: Number
 *    2: Char Upper
 *    3: Char Lower
 *    4: Char Mix
 *    5: Number Char Upper
 *    6: Number Char Lower
 * @param Boolean unique : char in string not duplicate
 *
 * @return String
 */
helper.random = function (len, chars, unique) {
	len = this.parseInteger(len);
	switch (chars) {
		case 1:
			chars = "0123456789";
			break;
		case 2:
			chars = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
			break;
		case 3:
			chars = "abcdefghijklmnopqrstuwxyz";
			break;
		case 4:
			chars = "ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuwxyz";
			break;
		case 5:
			chars = "0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ";
			break;
		case 6:
			chars = "0123456789abcdefghijklmnopqrstuwxyz";
			break;
		default:
			chars = typeof chars == "string" ? chars : "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
	}
	if (unique) {
		//remove char duplicate
		chars = this.arrayUnique(chars.split("")).join("");
		if (len > chars.length) {
			return false;
		}
	}

	var rnd = crypto.randomBytes(len);
	var value = new Array(len);
	var d = 256 / Math.min(256, chars.length);

	for (let i = 0; i < len; i++) {
		let pos = Math.floor(rnd[i] / d);
		value[i] = chars[pos];

		if (unique) {
			//remove char[pos]
			chars = chars.replace(chars[pos], "");
			d = 256 / Math.min(256, chars.length);
		}
	}
	return value.join("");
};

/* Random one integer number
 *
 * @param Number min
 * @param Number max
 *
 * @return Number
 */
helper.randomInteger = function (min, max) {
	return crypto.randomInt(min, max);
};

/* Random one element in array
 *
 * @param Array arr
 *
 * @return Mix : array element
 */
helper.randomArray = function (arr) {
	try {
		return arr[crypto.randomInt(0, arr.length - 1)];
	} catch (e) {
		return null;
	}
};

/* shuffle array
 *
 * @param Array arr
 *
 * @return Mix : array element
 */
helper.arrayShuffle = function (arr, n) {
	try {
		let currentIndex = arr.length,
			randomIndex;
		// While there remain elements to shuffle.
		while (currentIndex != 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			// And swap it with the current element.
			[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
		}
		return n ? arr.slice(0, n) : arr;
	} catch (e) {
		clog(e);
		return arr;
	}
};

helper.isFacebookApp = function (req) {
	//if(appConfig.env == 'dev')  return true;
	let ua = req.get("User-Agent");
	return ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
};

helper.getZaloIdByOA = function (req) {
	try {
		return req.cookies["biquyetdinhduong.brand.zing.vn_zoanid"] || req.cookies["zoanid"] || req.session.zid_by_oa;
	} catch (e) {
		return "";
	}
};

helper.getLinkZaloInApp = function (req, router) {
	try {
		var link = router ? _baseUrl + router : _baseUrl + req.url.substring(1);
		return `${appConfig.zalo_oa.url}?src=NonZaloBrowser&redirect_url=${encodeURI(link)}`;
	} catch (e) {
		return `${appConfig.zalo_oa.url}?src=NonZaloBrowser&redirect_url=${encodeURI(_baseUrl)}`;
	}
};

/** Check in mobile
 *
 * @param req
 * @returns Boolean
 */
helper.inMobile = function (req) {
	const md = new MobileDetect(req.headers["user-agent"]);
	return md.mobile() !== null;
};

/** Check in zalo browser
 *
 * @param req
 * @returns Boolean
 */
helper.inZalo = function (req) {
	if (appConfig.env == "develop") return true;
	const md = new MobileDetect(req.headers["user-agent"]);
	return md.match("zalo|Zalo");
	//let ua = req.get('User-Agent');
	//ua = ua.toLowerCase();
	//return (ua.indexOf('zalo') >= 0) ? true : false;
};

/** Remove negation [0-9a-zA-Z_whitespace]
 * do not remove: []/-=|
 * @param {*} str
 * @returns
 */
helper.removeSpecialChars = function (str) {
	try {
		return str.replace(/[^\w\s\][/-=|]/gi, "").replace(/[<]/gi, "");
	} catch (e) {
		return "";
	}
};

/** Add slash to special chars
 *
 * @param str String
 * @returns String
 */
helper.escapeFunc = function (string) {
	try {
		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	} catch (e) {
		return string;
	}
};

/** Get email html template and replace data
 *
 * @param mail_template String : name email in public/frontend/email/
 * @param data_replace Array : [{key:'',data:''}];
 * @returns String
 */
helper.getEmailTemplate = async function (mail_template, data_replace) {
	try {
		var template = fs.readFileSync(_basepath + "public/frontend/email/" + mail_template + ".html", { encoding: "utf-8" });
		var escapeFunc = function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		};
		data_replace.forEach(function (item) {
			var regex = new RegExp(escapeFunc(item.key), "g");
			template = template.replace(regex, item.data);
		});
		return template;
	} catch (e) {
		console.log(e);
		return null;
	}
};

/**
 *
 * @param data Object
 *          form : sender address
 *          to : list of receivers
 *          subject : Subject line
 *          html : plain text body
 * @returns {Promise|any|Promise<T>}
 */
helper.sendMailByGmail = function (data) {
	return new Promise((resolve, reject) => {
		var nodemailer = require("nodemailer");
		var transporter = nodemailer.createTransport({
			service: "Gmail",
			host: "smtp.gmail.com",
			port: 465,
			secure: true, // use SSL
			auth: {
				user: "pakadin404@gmail.com",
				pass: "orghwzgaslwtvgco",
			},
			proxy: appConfig.http_proxy,
		});

		const mailOptions = {
			from: data.from,
			to: data.to,
			subject: data.subject,
			html: data.html,
		};

		transporter.sendMail(mailOptions, function (err, info) {
			if (err) resolve(err);
			else resolve(true);
		});
	});
};

helper.get_data_flash = function (req) {
	return {
		msg_success: req.flash("msg_success"),
		msg_warning: req.flash("msg_warning"),
		msg_error: req.flash("msg_error"),
		valid_errors: req.flash("valid_errors"),
		post_data: req.flash("post_data"),
	};
};

helper.setCookie = function (key, value, req) {
	try {
		req.cookies[key] = value;
		//return req.cookies[key] || default_value;
	} catch (e) {
		return default_value;
	}
};

helper.getCookie = function (key, req) {
	try {
		return req.cookies[key] || "";
	} catch (e) {
		return "";
	}
};

helper.getIpAdress = function (req) {
	try {
		var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
		return ip;
	} catch (e) {
		console.log("getIpAdress", e);
		return "";
	}
};

/* JSON data
 * @param s variable need json
 * @param stringify object to string
 * @return
 */
helper.json_data = function (s, stringify) {
	try {
		s = stringify ? JSON.stringify(s) : JSONbigString.parse(s);
	} catch (e) {}
	return s;
};

helper.addZeroPad = function (num, size) {
	num = num.toString();
	while (num.length < size) num = "0" + num;
	return num;
};

helper.lastLogin = function (req) {
	try {
		let ipdd =
			req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
		let userAgent = typeof req.headers === "object" && typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "";
		let last_login = {
			ip: ipdd,
			userAgent: userAgent,
			time: helpers.date.getCurrentTime(),
		};
		return last_login;
	} catch (error) {
		return {};
	}
};

helper.sortObjectByValue = function (obj, assoc = true) {
	let sortable = [];
	for (const key in obj) {
		sortable.push([key, obj[key]]);
	}
	// [["you",100],["me",75],["foo",116],["bar",15]]

	sortable.sort(function (a, b) {
		return assoc ? (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0) : a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0;
	});
	// [["bar",15],["me",75],["you",100],["foo",116]]

	let orderedList = {};
	for (const idx in sortable) {
		orderedList[sortable[idx][0]] = sortable[idx][1];
	}
	return orderedList;
};

/** Get type of data
 *
 * @param mixed data
 * @returns String ['string','number','boolean','object','function','array',date,'undefined','null','NaN']
 */
helper.typeof = function (data) {
	const t = typeof data;
	if (t === "object") {
		return data === null ? "null" : Array.isArray(data) ? "array" : data instanceof Date ? "date" : t;
	} else if (t === "number") {
		return isNaN(data) ? "NaN" : "number";
	}
	return t;
};

/**
 * Trim, filter [ ?+~!`#$"<>*()\/[]' ], escape data
 *
 * @param String data
 * @returns
 */
helper.sanitization = function (data, specialChar = "") {
	try {
		let sanitize = (string) => {
			string = validator.trim(string);
			string = validator.blacklist(string, "?+~!`#$\"<>*()\\[\\]/'");
			string = validator.escape(string);
			return string;
		};

		if (this.typeof(data) === "array") {
			for (let i = 0; i < data.length; i++) {
				data[i] = sanitize(data[i]);
			}
		} else {
			data = sanitize(data);
		}
		return data;
	} catch (e) {
		return "";
	}
};

/**
 * Filter, escape req.query req.body
 * support: object 2 level
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
helper.sanitizersQuery = function (req, res, next) {
	try {
		let resources = helpers.base.parse_resource(req.originalUrl);
		if (req.method == "POST" && resources && (resources.method === "import" || resources.method === "export")) {
			return next();
		}

		//if (appConfig.sanitizersIgnore.indexOf(req.path) != -1) return next();

		let postData = { ...req.body };
		let queryData = { ...req.query };
		if (postData && Object.keys(postData).length > 0) {
			//clog('sanitizers_body_start',postData)
			for (let k in postData) {
				if (postData.hasOwnProperty(k)) {
					//clog(k,postData[k])
					postData[k] = helpers.base.sanitization(postData[k]);
				}
			}
			req.body = postData;
			//clog('sanitizers_body_finish',req.body)
		}
		if (queryData && Object.keys(queryData).length > 0) {
			//clog('sanitizers_query_start',queryData)
			for (let k in queryData) {
				if (queryData.hasOwnProperty(k)) {
					if (helpers.base.typeof(queryData[k]) === "object") {
						for (let k2 in queryData[k]) {
							if (queryData[k].hasOwnProperty(k2)) {
								queryData[k][k2] = helpers.base.sanitization(queryData[k][k2]);
							}
						}
					} else {
						queryData[k] = helpers.base.sanitization(queryData[k]);
					}
				}
			}
			req.query = queryData;
			//clog('ssanitizers_query_finish',req.query)
		}
		return next();
	} catch (e) {
		clog("sanitizers", e);
		return res.status(400).send(`Bad request`);
	}
};

helper.getCSP = function () {
	let csp = "";
	for (let k in appConfig.csp) {
		csp += `${k} ${appConfig.csp[k]}; `;
	}
	//clog(csp)
	return csp;
};

helper.getValuesFromCollectionByKey = function (values, key) {
	if (Array.isArray(values) && key) {
		return values.map((v) => {
			return v[key];
		});
	}
	return null;
};

/* Random uuid
 *
 * @param Number min
 * @param Number max
 *
 * @return Number
 */
helper.randomUUID = function () {
	return crypto.randomUUID();
};

helper.get_item_name = function (item) {
	let name = "";
	switch (item) {
		case "hopbau":
			name = "Hộp bầu";
			break;

		case "hopcua":
			name = "Hộp Cua";
			break;

		case "hopca":
			name = "Hộp cá";
			break;

		case "hoprong":
			name = "Hộp rồng";
			break;

		default:
			name = "";
			break;
	}
	return name;
};

helper.getTypeUser = function (createdAt) {
	try {
		let type_user = "old";
		const day30Ago = helpers.date.getDayAgo(30);
		const dateUserJoined = helpers.date.format(createdAt, "YYYY-MM-DD");
		if (dateUserJoined >= day30Ago) {
			type_user = "new";
		}
		return type_user;
	} catch (error) {
		return (type_user = "old");
	}
};

module.exports = helper;
