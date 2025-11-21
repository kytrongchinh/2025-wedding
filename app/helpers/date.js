var helper = {};
var moment = require("moment");

/* Usually format ISO 8601
- x : timestamp
- YYYY-MM-DD: year-month-day
- YYYY-MM-DD HH:mm:ss | year-month-day hour:minute:second
...
*/
var iso_format = ["x", "YYYY-MM-DD", "YYYY-MM-DD HH:", "YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm:ss.SSS"];

/* Convert value to Date type || string date
 * @param String s : string date ISO format || object Date (Ex:2020-11-30T17:00:00.000Z) || timestamp
 * @param String f : format target (ISO format || date)
 * @return Date : UTC time || string || Invalid date
 * Example:
 *    helpers.date.convert(1655009033459); // '2022-06-12 11:43:53'
 *    helpers.date.convert('2022-06-12 11:43:53','YYYY-MM-DD'); // '2022-06-12'
 *    helpers.date.convert('2020-11-30T17:00:00.000Z'); // '2020-12-01 00:00:00'
 *    helpers.date.convert('2020-12-01 00:00:00','odate'); // 2020-11-30T17:00:00.000Z'
 */
helper.convert = function (s, f = "YYYY-MM-DD HH:mm:ss") {
	if (["number", "string", "date"].indexOf(helpers.base.typeof(s)) != -1) {
		return f == "odate" ? moment(s).toDate() : moment(s).format(f);
	} else {
		return "Invalid date";
	}
};

/* Format to string date
 * @param String s : string date or object Date (Ex:2020-11-30T17:00:00.000Z)
 * @param String f : format target (Ex: YYYY-MM-DD ...)
 * @return String
 */
helper.format = function (s, f = "YYYY-MM-DD HH:mm:ss") {
	return moment(s).format(f);
};

/* Get today with format YYYY-MM-DD
 * @return string
 */
helper.getToday = function (f = "YYYY-MM-DD") {
	return moment().format(f);
};

/* Get today with format YYYY-MM-DD
 * @return string
 */
helper.getDayInWeek = function () {
	return moment().isoWeekday();
};

/* Get current time (default YYYY-MM-DD HH:mm:ss)
 * @param format string
 * @return string || number
 */
helper.getCurrentTime = function (format = "YYYY-MM-DD HH:mm:ss") {
	return format == "x" ? parseInt(moment().format(format)) : moment().format(format);
};

/* Compare two time
 * @param a : need compare (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @param b : target compare (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @return -1: a less than b, 0: a equal b, 1: a greater than b
 * @example :
 *      helpers.date.compareTime('2020-12-01 00:00:02','2020-12-01 00:00:01'); //return 1
 */
helper.compareTime = function (a, b) {
	var c = moment(a).diff(b);
	return c < 0 ? -1 : c == 0 ? 0 : 1;
};

/* Check time in range
 * @param a : need check (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @param b : from (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @param c : to (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @return Boolean
 * @example :
 *      helpers.date.inTime('2020-12-03','2020-12-01','2020-12-31'); //return true
 */
helper.inTime = function (a, b, c) {
	a = moment(a).format("x");
	b = moment(b).format("x");
	c = moment(c).format("x");
	return b <= a && a <= c;
};

/* Get Time Previous
 * @param date
 * @param step
 * @param type
 * @param format
 * @return string | number
 */
helper.getTimePrevious = function (date, step = 1, type = "days", format = "YYYY-MM-DD") {
	var preTime = moment(date).subtract(step, type);
	return format == "x" ? parseInt(preTime.format(format)) : preTime.format(format);
};

/* Get Time Next
 * @param date
 * @param step
 * @param type
 * @param format
 * @return string | number
 */
helper.getTimeNext = function (date, step = 1, type = "days", format = "YYYY-MM-DD") {
	var nextTime = moment(date).add(step, type);
	return format == "x" ? parseInt(nextTime.format(format)) : nextTime.format(format);
};

/* Calculate week in range date
 * @param startDate YYYY-MM-DD
 * @param stopDate YYYY-MM-DD
 * @param desDay YYYY-MM-DD
 * @return number || 0
 */
helper.getWeek = function (startDate, stopDate, desDay = false) {
	var today = desDay || this.getToday();
	if (!this.isFormat(today, "YYYY-MM-DD") || !this.isFormat(startDate, "YYYY-MM-DD") || !this.isFormat(stopDate, "YYYY-MM-DD")) return 0;

	today = moment(today).toDate().getTime();
	var start = moment(startDate).toDate().getTime();
	var end = moment(stopDate).toDate().getTime();
	if (start > end || today < start || today > end) return 0;
	var w = 1;
	var c = 1;
	while (start <= end) {
		if (start == today) {
			break;
		}
		start = this.getTimeNext(start, 1, "days", "x");
		if (c % 7 == 0) w++;
		c++;
	}
	return w;
};

/* Create date range
 * @param startDate YYYY-MM-DD
 * @param stopDate YYYY-MM-DD
 * @return array
 */
helper.getDates = function (startDate, stopDate) {
	if (!this.isFormat(startDate, "YYYY-MM-DD") || !this.isFormat(stopDate, "YYYY-MM-DD")) return [];

	var dateArray = [];
	var start = moment(startDate).toDate().getTime();
	var end = moment(stopDate).toDate().getTime();
	if (start > end) return dateArray;

	var w = 1;
	var c = 1;
	while (start <= end) {
		dateArray.push({
			date: moment(start).format("YYYY-MM-DD"),
			month: moment(start).format("MM"),
			week: w,
		});
		start = this.getTimeNext(start, 1, "days", "x");
		if (c % 7 == 0) w++;
		c++;
	}
	return dateArray;
};

/* Check string day match format
 * @param d String (ex: 2020-02-02 23:24:59)
 * @param f String|Array (ex: YYYY-MM-DD HH:mm:ss)
 * @return Boolean
 */
helper.isFormat = function (d, f = null) {
	if (!f) f = ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD", "x", "YYYY-MM-DD HH:mm"];
	return moment(d, f, true).isValid();
};

/* Format timestamp to HH:mm:ss.sss
 * @param Number timestamp
 * @return String
 */
helper.formatElapsed = function (timestamp, ms = false) {
	let endElapsed = new Date(parseInt(timestamp));
	let parts = {
		h: endElapsed.getUTCHours().toString().padStart(2, "0"),
		m: endElapsed.getUTCMinutes().toString().padStart(2, "0"),
		s: endElapsed.getUTCSeconds().toString().padStart(2, "0"),
		ms: endElapsed.getUTCMilliseconds().toString().padStart(3, "0"),
	};
	return ms ? `${parts.h}:${parts.m}:${parts.s}:${parts.ms}` : `${parts.h}:${parts.m}:${parts.s}`;
};

helper.now = function () {
	return helper.format(Date.now(), "YYYY-MM-DD");
};

helper.getArrayDates = function (startDate, endDate) {
	const dateArray = [];
	const start = moment(startDate).utcOffset("+0700");
	const end = moment(endDate).utcOffset("+0700");
	while (start.isSameOrBefore(end)) {
		dateArray.push(start.format("YYYY-MM-DD"));
		start.add(1, "day");
	}
	return dateArray;
};

helper.convertGMT7 = function (utcTimestamp, format) {
	return moment(utcTimestamp).utcOffset("+07:00").format(format);
};

helper.getNow = function (format) {
	return moment().format(format);
};

helper.set_date_play = async function (startDate = "2023-11-01", endDate = "2023-11-01") {
	try {
		console.log(startDate, "startDate");
		console.log(endDate, "endDate");
		const startDateMoment = moment(startDate);
		const endDateMoment = moment(endDate);
		// Array to store dates
		let dateList = [];

		// Loop through each date between start and end dates and push to dateList
		let currentDate = startDateMoment.clone();
		console.log(currentDate, "currentDate");
		console.log(startDateMoment, "startDateMoment");
		console.log(endDateMoment, "endDateMoment");
		while (currentDate.isSameOrBefore(endDateMoment)) {
			// dateList.push(currentDate.format("YYYY-MM-DD"));

			const current = currentDate.format("YYYY-MM-DD");
			const full_date = currentDate.format("YYYY-MM-DD HH:mm:ss");
			const week = currentDate.format("W");
			const specificDay = currentDate.day();
			const month = currentDate.format("MM");
			const year = currentDate.format("YYYY");
			dateList.push({
				date: current,
				full_date: full_date,
				week: week,
				specificDay: specificDay,
				name: convertDate(specificDay),
				month: month,
				year: year,
			});
			currentDate.add(1, "day");
		}
		return dateList;
	} catch (error) {
		console.log(error);
		return [];
	}
};

const convertDate = (num) => {
	let name = "";
	switch (num) {
		case 0:
			name = "Sunday";
			break;
		case 1:
			name = "Monday";
			break;
		case 2:
			name = "Tuesday";
			break;
		case 3:
			name = "Wednesday";
			break;
		case 4:
			name = "Thursday";
			break;
		case 5:
			name = "Friday";
			break;
		case 6:
			name = "Saturday";
			break;
		default:
			name = "";
			break;
	}
	return name;
};

helper.getExpiredTime = function () {
	const currentTime = moment();
	// Add one hour
	const oneHourLater = currentTime.add(1, "hours");
	return oneHourLater.format("X");
	// return {
	// 	currentTime: currentTime.format("YYYY-MM-DD HH:mm:ss"),
	// 	full: oneHourLater.format("YYYY-MM-DD HH:mm:ss"),
	// 	timestamp: oneHourLater.format("X"),
	// };
};

helper.getDayAgo = function (numberDays = 14) {
	const currentTime = moment();
	// Add one hour
	const oneHourLater = currentTime.add(-numberDays, "days");
	return oneHourLater.format("YYYY-MM-DD");
};

module.exports = helper;
