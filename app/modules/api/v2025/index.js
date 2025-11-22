const express = require("express");
const helmet = require("helmet");
const v2025 = express();
const { checkLoginToken, checkFollow } = require("../../../utils/middleware");

v2025.use(helmet(appConfig.helmet));

// v2025.use(checkTimeline);
/**
 * Logins the user
 */
// v2025.use("/login", require("./login/index"));
/**
 *  The user information
 */
v2025.use("/info", require("./info/index"));
v2025.use("/mini", require("./mini/index"));
v2025.use("/album", require("./album/index"));
v2025.use("/photo", require("./photo/index"));
v2025.use("/invitee", require("./invitee/index"));

// v2025.use("/user", checkLoginToken, require("./user/index"));
// v2025.use("/exercise", require("./exercise/index"));
// v2025.use("/practice", checkLoginToken, require("./practice/index"));
// v2025.use("/share", checkLoginToken, checkFollow, require("./share/index"));
// v2025.use("/gift", checkLoginToken, require("./gift/index"));
// v2025.use("/certificate", checkLoginToken, require("./certificate/index"));
// v2025.use("/survey", checkLoginToken, require("./survey/index"));
// v2025.use("/quiz", checkLoginToken, require("./quiz/index"));

module.exports = v2025;
