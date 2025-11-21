import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

/* Usually format ISO 8601
- x : Unix timestamp in millisecond
- X : Unix timestamp in second
- YYYY-MM-DD HH:mm:ss.SSS | year-month-day hour:minute:second.millisecond
...
*/

export const getCurrentTime = (f = "YYYY-MM-DD HH:mm:ss") => {
	let objectDay = dayjs();
	if (f === "x") return objectDay.valueOf();
	if (f === "X") return objectDay.unix();
	return objectDay.format(f);
};

export const formatTime = (t: string | any | bigint, f = "YYYY-MM-DD HH:mm:ss") => {
	try {
		let objectDay = dayjs(t);
		if (f === "x") return objectDay.valueOf();
		if (f === "X") return objectDay.unix();
		return objectDay.format(f);
	} catch (e) {
		console.log("formatTime", e);
		return false;
	}
};

export const formatTimeByFormat = (t: string, f = "YYYY-MM-DD HH:mm:ss", formatInput = "YYYY-MM-DD HH:mm:ss") => {
	try {
		let objectDay = dayjs(t, formatInput);
		if (f === "x") return objectDay.valueOf();
		if (f === "X") return objectDay.unix();
		return objectDay.format(f);
	} catch (e) {
		console.log("formatTime", e);
		return false;
	}
};

/** Compare two time
 *
 * @param {*} a need compare (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @param {*} b target compare (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, timestamp ...)
 * @returns -1: a less than b | 0: a equal b | 1: a greater than b
 * @example compareTime('2023-12-01 00:00:02','2023-12-01 00:00:01'); //return 1
 */
export const compareTime = (a: string, b: string) => {
	try {
		const c = dayjs(a).diff(dayjs(b));
		return c < 0 ? -1 : c == 0 ? 0 : 1;
	} catch (e) {
		console.log("compareTime", e);
		return false;
	}
};

export const subtractCurrentTime = (value: number, type: any, f: string) => {
	try {
		const data = dayjs().subtract(value, type).format(f);

		return data;
	} catch (error) {
		return null;
	}
};

export const getDifference = (firstDate: string, secondDate: string, compareType: any, formatDate: string) => {
	try {
		const fDate = dayjs(firstDate, formatDate);
		const sDate = dayjs(secondDate, formatDate);

		return fDate.diff(sDate, compareType, true);
	} catch (error) {
		return null;
	}
};
