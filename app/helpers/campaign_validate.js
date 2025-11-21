const { PHONE_CARRIERS } = require("../configs/constants");
const checkEmpty = (fields) => {
	if (!fields?.length) return null;
	const fieldError = fields.find((field) => field.required && !field?.value);
	return fieldError ? { error: fieldError.id, msg: fieldError.empty_error } : null;
};

const checkPhone = (fields, keyCheck = null) => {
	const myKey = keyCheck || "phone" || "delivery_phone";
	let phoneField = fields.find((field) => field.id === myKey);
	if (!phoneField) return null;

	const fieldValue = phoneField.value;
	if (!fieldValue) return { error: phoneField.id, error_msg: phoneField.empty_error };

	const phoneParten = /^((01|02|03|05|07|08|09)+([0-9]{8})\b)|((02)+([0-9]{9})\b)+$/;
	const phoneValid = phoneParten.test(fieldValue) && PHONE_CARRIERS.includes(fieldValue.substr(0, 3));

	if (!phoneValid) return { error: phoneField.id, error_msg: phoneField.format_error };
	return null;
};

module.exports = { checkEmpty, checkPhone };
