const jwt = require("jsonwebtoken");
/**
 * This module used for verify jwt token
 * @param {*} token
 * @param {*} secretKey
 */
const verifyToken = (token) => {
	try {
		const privateKey = appConfig.JWT.PRIVATE_KEY;
		const decodeData = jwt.verify(token, privateKey);
		return decodeData?.data;
	} catch (error) {
		console.log("error", error);
		return null;
	}
};

/**
 *
 * @param {*} data
 * @returns
 */
const signToken = (data, expiresIn = "1h") => {
	const privateKey = appConfig.JWT.PRIVATE_KEY;
	return jwt.sign(
		{
			data,
		},
		privateKey,
		{ expiresIn: expiresIn }
	);
};

const expiredTime = (token) => {
	const payload = jwt.decode(token, (verify = false));
	return payload["exp"];
};

module.exports = { verifyToken, signToken, expiredTime };
