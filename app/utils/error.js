class BaseError extends Error {
	constructor(httpCode, description) {
		super(description);
		Object.setPrototypeOf(this, new.target.prototype);

		this.httpCode = httpCode;

		Error.captureStackTrace(this);
	}
}

const HttpStatusCode = {
	OK: 200,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	REQUEST_TIMEOUT: 408,
	INTERNAL_SERVER: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
};

class APIError extends BaseError {
	constructor(httpCode = HttpStatusCode.INTERNAL_SERVER, description = "internal server error", data = {}) {
		super(httpCode, description);
		this.data = data;
	}
}

class ValidationError extends APIError {
	/**
	 *
	 * @param {String} description
	 * @param {Object|Any} data
	 */
	constructor(description = "validation error", data = {}) {
		super(HttpStatusCode.BAD_REQUEST, description, data);
	}

	/**
	 *
	 * @returns {Array<Object>}
	 */
	toArray() {
		const data = [];
		for (const [key, value] of Object.entries(this.data)) {
			data.push({ key, value });
		}
		return data;
	}
}

module.exports = { APIError, ValidationError, HttpStatusCode };
