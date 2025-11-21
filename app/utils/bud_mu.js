const moment = require("moment");

const bud_mu = {};
bud_mu.lastLogin = function (req) {
	try {
		let ipdd =
			req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
		let userAgent = typeof req.headers === "object" && typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : "";
		let time = moment(Date.now()).format("DD-MM-YYYY HH:mm:ss");
		let last_login = {
			ip: ipdd,
			userAgent: userAgent,
			time: time,
		};
		return last_login;
	} catch (error) {
		return {};
	}
};

bud_mu.set_date_play = function (startDate = "2024-12-01", numberWeek = 300) {
	let current = moment().format("x");
	// if (appConfig.env != "production") {
	// 	startDate = "2023-10-01";
	// 	current = 1735664400000;
	// }
	let start = moment(startDate).format("YYYY-MM-DD");
	let next_date = moment(startDate).format("YYYY-MM-DD");
	let month = moment(current, "x").format("M");
	let month_year = moment(current, "x").format("YYYY-MM");
	let period = 0;
	for (let index = 1; index < numberWeek; index++) {
		const week = index;
		const date_old = next_date;
		let date_old_time = moment(date_old).format("x");

		let new_date = moment(next_date).add(7, "days");
		next_date = new_date.format("YYYY-MM-DD");
		let time_end = new_date.format("x");
		if (current >= date_old_time && current < time_end) {
			let date = moment(current, "x").format("YYYY-MM-DD");

			if (appConfig.env != "production") {
				if (date >= "2023-10-01" && date <= "2023-12-15") {
					period = 1;
				}
				if (date >= "2023-12-16" && date <= "2024-01-28") {
					period = 2;
				}
				if (date > "2024-01-28") {
					period = 2;
				}
			} else {
				if (date >= "2023-11-01" && date <= "2023-12-15") {
					period = 1;
				}
				if (date >= "2023-12-16" && date <= "2024-01-28") {
					period = 2;
				}
				if (date > "2024-01-28") {
					period = 2;
				}
			}

			let full_date = moment(current, "x").format("YYYY-MM-DD HH:mm:ss");
			let date_start_week = moment(date_old).format("YYYY-MM-DD");
			let date_end_week = new_date.format("YYYY-MM-DD");
			return {
				date,
				full_date,
				date_start_week,
				date_end_week,
				week,
				month: month,
				month_year: month_year,
				period: period,
			};
		}
	}

	return {
		date: moment(current, "x").format("YYYY-MM-DD"),
		full_date: moment(current, "x").format("YYYY-MM-DD HH:mm:ss"),
		date_start_week: "2023-09-27",
		date_end_week: "2023-11-01",
		week: 0,
		month: month,
		period: 1,
	};
};

module.exports = bud_mu;
