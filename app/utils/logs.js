const logModel = require("../modules/logs/models/cp_logs");
const acdModel = require("../modules/logs/models");

const logs = (module.exports = {});

logs.logReceive = function (req, user = {} || req.user, type = "", result = {}, options = {}) {
	try {
		const date_info = utils.milo_mu.set_date_play();
		let userAgent = typeof req.headers === "object" && typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "";
		let log = {
			name: `Log from ${user?.display_name} for ${type}`,
			uid: user?._id,
			from: type,
			ip: logs.getClientIP(req),
			user: user?._id,
			path: req.originalUrl,
			user_agent: userAgent,
			date: date_info?.date,
			time: date_info?.full_date,
			data: Object.assign(req.body, req.files, req.query, options),
			result: result,
			month: date_info?.month_year,
			type: type,
			status: 1,
		};

		if (Object.keys(log).length > 0) {
			const logIns = new logModel(log);
			setTimeout(function () {
				logIns.save();
			}, 1000);
		}
		return true;
	} catch (error) {
		return false;
	}
};

logs.getClientIP = function (req) {
	const clientIp = req.headers && req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",")[0] : req.connection.remoteAddress;
	return clientIp;
};

logs.escapeRegExpChars = function (text) {
	return text ? text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : null;
};

logs.logACD = async function (action, name = "", data_request = null, data_response = {}) {
	try {
		if (action == "create") {
			const data_cdp = {
				name,
				data_request,
				data_response,
				status: 0,
			};
			const cre = await acdModel.create("acds", data_cdp);
			if (cre.status == true) {
				return cre.msg._id;
			}
		}
		return true;
	} catch (error) {
		console.log(error, "error");
		return false;
	}
};

logs.logACDUpdate = function (id, data_response = {}, status) {
	try {
		const data_cdp = {
			data_response,
		};
		if (data_response?.success == true) {
			data_cdp.status = 1;
		} else {
			data_cdp.status = 2;
		}
		acdModel.updateOne("acds", { _id: id }, data_cdp);
		return true;
	} catch (error) {
		return false;
	}
};
