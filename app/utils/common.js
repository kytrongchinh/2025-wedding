const HTTPStatus = require("http-status");

const common = (module.exports = {});

common.response = function (req, res, data, status, track_data) {
	let objRes = {};
	if (typeof status === "undefined") {
		status = HTTPStatus.OK;
	}

	const statusCode = status == 200 ? HTTPStatus.OK : status == 500 ? HTTPStatus.INTERNAL_SERVER_ERROR : HTTPStatus.BAD_REQUEST;

	objRes.status = statusCode;
	if (status == HTTPStatus.OK || status == 200) {
		// objRes = { ...objRes, ...data };
		objRes.result = data;

		// if (track_data) {
		// 	//
		// 	utils.logs.log(req, objRes);
		// }
	} else {
		objRes.message = data;
		// utils.logs.log(req, objRes);
	}

	return res.status(statusCode).json(objRes);
};

common.exc_response = function (req, res, err, results, fn) {
	return common.response(req, res, err, HTTPStatus.BAD_REQUEST);
};

common.empty_response = function (req, res, err, results, track_data) {
	if (err) {
		console.log(err);
		return common.response(req, res, err, HTTPStatus.BAD_REQUEST);
	} else {
		return common.response(req, res, {}, HTTPStatus.OK, track_data);
	}
};
