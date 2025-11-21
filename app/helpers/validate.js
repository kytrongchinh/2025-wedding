/* Guide
 * Init: let validate = new helpers.validate();
 * Check: validate.notEmpty(req.body.fullname,'fullname is require','fullname');
 * Error: let valid_error = validate.hasErrors();
 */
var validator = require("validator");
class MyValidate {
	constructor() {
		this.errors = [];
	}

	checkBody(field, type, req, mess) {
		try {
			switch (type) {
				case "notEmpty":
					mess = mess ? mess : field + " is required";
					this.notEmpty(req.body[field], mess);
					break;
				case "isNumeric":
					mess = mess ? mess : field + " must be Number";
					this.isNumeric(req.body[field], mess);
					break;
				case "isBoolean":
					mess = mess ? mess : field + " must be Boolean (0 1 true false)";
					this.isBoolean(req.body[field], mess);
					break;
				case "isFormatUsername":
					mess = mess ? mess : field + " 4 to 20 characters, doesn't contain special character";
					this.isFormatUsername(req.body[field], mess);
					break;
				case "isFormatEmail":
					mess = mess ? mess : "Email incorrect";
					this.isFormatEmail(req.body[field], mess);
					break;
				case "isFormatPhone":
					mess = mess ? mess : "Phone incorrect";
					this.isFormatPhone(req.body[field], mess);
					break;
			}
		} catch (e) {
			this.errors.push(e.message);
		}
		return this;
	}

	notEmpty(value, mess, key) {
		mess = mess ? mess : "Value is required";
		if (value == undefined || typeof value !== "string" || validator.isEmpty(value, { ignore_whitespace: true })) {
			this.errors.push(key ? { key: key, mess: mess } : mess);
		}
		return this;
	}
	isEmpty(value, mess, key) {
		mess = mess ? mess : "Value is not empty";
		if (value) {
			this.errors.push(key ? { key: key, mess: mess } : mess);
		}
		return this;
	}

	equals(value, value2, mess, key) {
		mess = mess ? mess : "Value is not equal";
		if (typeof value !== "string" || typeof value2 !== "string" || !validator.equals(value, value2)) {
			this.errors.push(key ? { key: key, mess: mess } : mess);
		}
		return this;
	}
	isLength(value, min, max, mess) {
		mess = mess ? mess : "Value must be from " + min + " to " + max + " character";
		if (!validator.isLength(value, { min: min, max: max })) {
			this.errors.push(mess);
		}
		return this;
	}
	isFormatEmail(value, mess, key) {
		mess = mess ? mess : "Email incorrect";
		var re =
			/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|xyz|[a-z][a-z])|([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}))(:[\d]{1,5})?$/i;
		if (typeof value === "undefined" || !re.test(value)) {
			this.errors.push(key ? { key: key, mess: mess } : mess);
		}
		return this;
	}

	isFormatPhone(value, mess, key) {
		mess = mess ? mess : "Phone incorrect";
		//var re = /^(096|097|098|086|032|033|034|035|036|037|038|039|094|091|081|082|083|084|085|088|093|090|089|070|076|077|078|079|092|052|056|058|059|099|019|095|087)+([\d]{7})|(02)+([\d]{9})\b$/;
		var re =
			/^(096|097|098|086|032|033|034|035|036|037|038|039|094|091|081|082|083|084|085|088|093|090|089|070|076|077|078|079|092|052|056|058|059|099|019|095|087)+([0-9]{7})\b$/;
		if (typeof value === "undefined" || !re.test(value)) {
			this.errors.push(key ? { key: key, mess: mess } : mess);
		}
		return this;
	}
	/**
	 * 6-50 chars, at least 1 lowercase, at least 1 uppercase and at least 1 numeric
	 */
	isFormatPassword(value, mess, key) {
		mess = mess ? mess : "Password incorrect";
		var re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d]).{6,30}$/;
		if (typeof value === "undefined" || !re.test(value)) {
			if (key) {
				this.errors.push({ key: key, mess: mess });
			} else {
				this.errors.push(mess);
			}
		}
		return this;
	}
	isValidDate(value, mess, key) {
		mess = mess ? mess : "Date incorrect";
		var regex_date = /^\d{2}\/\d{2}\/\d{4}$/;
		if (!regex_date.test(value)) {
			this.errors.push({ key: key, mess: mess });
			return this;
		}
		// Parse the date parts to integers
		var parts = value.split("/");
		var day = parseInt(parts[0], 10);
		var month = parseInt(parts[1], 10);
		var year = parseInt(parts[2], 10);
		// Check the ranges of month and year
		if (year < 1000 || year > 3000 || month == 0 || month > 12) {
			this.errors.push({ key: key, mess: mess });
			return this;
		}
		var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		// Adjust for leap years
		if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
			monthLength[1] = 29;
		}

		if (day <= 0 || day > monthLength[month - 1]) {
			this.errors.push({ key: key, mess: mess });
			return this;
		}
	}
	isString(value, mess, key) {
		mess = mess ? mess : "Value must be String";
		if (!value || typeof value !== "string") {
			this.errors.push({ key, mess });
		}
		return this;
	}
	isNumeric(value, mess) {
		mess = mess ? mess : "Value must be Number";
		if (value == undefined || !validator.isNumeric(value, { no_symbols: true })) {
			this.errors.push(mess);
		}
		return this;
	}
	isInt(value, min, max, mess, key) {
		mess = mess ? mess : "Value must be Number";
		if (value == undefined || !validator.isInt(value + "", { min, max }) || typeof value !== "number") {
			this.errors.push({ key, mess });
		}
		return this;
	}
	maxLength(value, maximum, mess, key) {
		mess = mess ? mess : "Length value is maximum " + maximum;
		if (value == undefined || value.length > maximum) {
			//this.errors.push(mess);
			this.errors.push({ key: key, mess: mess });
		}
		return this;
	}
	minLength(value, minimum, mess, key) {
		mess = mess ? mess : "Length value is minimum " + minimum;
		if (value == undefined || value.length < minimum) {
			//this.errors.push(mess);
			this.errors.push({ key: key, mess: mess });
		}
		return this;
	}
	isBoolean(value, mess) {
		mess = mess ? mess : "Value must be Boolean (0 1 true false)";
		if (value == undefined || !validator.isBoolean(value, { no_symbols: true })) {
			this.errors.push(mess);
		}
		return this;
	}

	isObjectId(value, mess) {
		mess = mess ? mess : "Value must be ObjectId";
		let re = /^[0-9a-fA-F]{24}$/;
		if (!re.test(value)) {
			this.errors.push(mess);
		}
		return this;
	}

	isArray(value, mess) {
		try {
			mess = mess ? mess : "Value must be Array";
			if (value === null || typeof value !== "object" || value.constructor !== Array) {
				this.errors.push(mess);
			}
			return this;
		} catch (e) {
			return this;
		}
	}

	isObject(value, mess, key) {
		try {
			mess = mess ? mess : "Value must be Object";
			if (value === null || typeof value !== "object" || value.constructor !== Object) {
				this.errors.push({ key, mess });
			}
			return this;
		} catch (e) {
			return this;
		}
	}

	isFormatUsername(value, mess) {
		mess = mess ? mess : "Username must be 4 to 20 characters, doesn't contain special character";
		let re = /^[A-Za-z_0-9]{4,20}$/;
		if (typeof value === "undefined" || !re.test(value)) {
			this.errors.push(mess);
		}

		return this;
	}

	//check some format
	isFormat(value, type, mess) {
		mess = mess ? mess : "Value incorrect format";
		let regex = null;
		switch (type) {
			case 1:
				//letters, number, and  [_]
				regex = /^[A-Za-z0-9_]{3,30}$/;
				if (typeof value === "undefined" || !regex.test(value)) this.errors.push(mess);
				break;
			case 2:
				//letters, and  [-_]
				regex = /^[A-Za-z_]{3,30}$/;
				if (typeof value === "undefined" || !regex.test(value)) this.errors.push(mess);
				break;
			case 3:
				//letters, and  [-_]
				regex = /^[A-Za-z0-9_,]{3,}$/;
				if (typeof value === "undefined" || !regex.test(value)) this.errors.push(mess);
				break;
		}
		return this;
	}

	isPattern(value, pattern, mess) {
		mess = mess ? mess : "value incorrect format";
		var regex = new RegExp(pattern);
		if (typeof value === "undefined" || !regex.test(value)) this.errors.push(mess);
		return this;
	}

	//check if the string contains only letters (a-zA-Z).
	isAlpha(value, mess, locale = "en-US") {
		mess = mess ? mess : "The string must be contains only letters (a-zA-Z)";
		if (!validator.isAlpha(value, locale)) {
			this.errors.push(mess);
		}
		return this;
	}

	//check if the string contains only letters and numbers.
	isAlphanumeric(value, mess, key, locale = "en-US") {
		mess = mess ? mess : "The string must be contains only letters (a-zA-Z)";
		if (!validator.isAlphanumeric(value, locale)) {
			//this.errors.push(mess);
			this.errors.push({ key: key, mess: mess });
		}
		return this;
	}

	/** check is includes
	 *
	 * @param value: String
	 * @param compareValues: Array
	 * @param mess
	 * @returns {my_validate}
	 */
	isIncludes(value, compareValues = [], mess, key) {
		if (!compareValues.includes(value)) {
			mess = mess ? mess : "Value is not include";
			this.errors.push({ key, mess });
		}
		return this;
	}

	/** check file type
	 *
	 * @param file_upload
	 * @param mimetype []
	 * @param mess
	 * @returns {my_validate}
	 */
	checkFileType(file_upload, mimetype, mess) {
		if (mimetype.indexOf(file_upload.mimetype) == -1) {
			mess = mess ? mess : "Chỉ chấp nhận dạng file: " + mimetype;
			this.errors.push(mess);
		}
		return this;
	}

	/** check file size
	 *
	 * @param file_upload
	 * @param size
	 * @param mess
	 * @returns {my_validate}
	 */
	checkFileSize(file_upload, size, mess) {
		if (file_upload.size > size) {
			mess = mess ? mess : "Dung lượng tối đa " + Math.floor(size / 1048576) + "MB";
			this.errors.push(mess);
		}
		return this;
	}
	/** Check has error
	 *
	 * @returns {*}
	 */
	hasErrors() {
		if (this.errors.length > 0) {
			var err = this.errors;
			this.errors = [];
			return err;
		}
		return [];
	}
}

module.exports = MyValidate;
