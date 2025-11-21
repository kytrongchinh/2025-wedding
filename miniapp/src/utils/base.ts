import axios from "axios";
import moment from "moment";

export const httpRequest = (params: any) => {
	return new Promise(function (resolve, reject) {
		if (!params.url) reject(false);
		let headers = {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		};
		if (typeof params.headers === "object") {
			headers = Object.assign(headers, params.headers);
		}
		const axiosOptions = {
			baseURL: params.baseURL || "",
			headers: headers,
			httpsAgent: undefined,
			timeout: 10000,
		};
		const axiosClient = axios.create(axiosOptions);
		if (params.method == "GET") {
			axiosClient
				.get(params.url, params.data)
				.then((res) => {
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err", err);
					reject(null);
				});
		} else if (params.method == "POST") {
			axiosClient
				.post(params.url, params.data)
				.then((res) => {
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err :>> ", err);
					reject(err.response.data);
				});
		} else if (params.method == "PUT") {
			axiosClient
				.put(params.url, params.data)
				.then((res) => {
					resolve(res.data);
				})
				.catch((err) => {
					console.log("err", err);
					reject(null);
				});
		} else {
			reject(null);
		}
	});
};

export const loadImage = (img: string) => {
	const PATH = import.meta.env.VITE_MY_STATIC_URL;
	return PATH + img + "?v=5123";
};

export const countPercent = (num: number, total: number) => {
	num ? num : 0;
	total ? total : 0;
	if (total == 0) return 0;
	return Math.ceil((num / total) * 100);
};

export const countRemain = (num: number, total: number) => {
	num ? num : 0;
	total ? total : 0;
	return (total - num).toLocaleString();
};

export const convertMoney = (point: number, convert = 200) => {
	try {
		let money: number | string = point * convert;
		if (money >= 1000000) {
			money = (money / 1000000).toFixed(0);
			money = "~" + money.toLocaleString() + "tr";
		} else if (money >= 100000 && money < 1000000) {
			money = (money / 1000).toFixed(0);
			money = "~" + money.toLocaleString() + "k";
		} else {
			money = money.toLocaleString();
		}
		return money;
	} catch (error) {
		return (point * 200).toLocaleString() || 0;
	}
};
export const convertBottle = (point: number) => {
	try {
		let money: number | string = point;
		if (money >= 1000000) {
			money = (money / 1000000).toFixed(0);
			money = "~" + money.toLocaleString() + "tr";
		} else if (money >= 10000 && money < 1000000) {
			money = (money / 1000).toFixed(0);
			money = "~" + money.toLocaleString() + "k";
		} else {
			money = money.toLocaleString();
		}
		return money;
	} catch (error) {
		return point.toLocaleString() || 0;
	}
};

export const convertDate = (s: string, f = "YYYY-MM-DD HH:mm:ss") => {
	return moment(s).format(f);
};

export const convertDateNew = (s: string, f = "YYYY-MM-DD HH:mm:ss") => {
	return moment(s, "DD-MM-YYYY").format(f);
};

export const padText = (text = "", chars = "x", n = 7) => {
	return text.substring(0, n).padEnd(10, chars);
};

export const convertPage = (total = 0, limit = 1) => {
	total = Math.floor(total);
	limit = Math.floor(limit);
	if (limit < 1) {
		return 0;
	}
	let page = Math.ceil(total / limit);
	return page;
};

export const countNumberItemRedeem = (total = 0, value = 0) => {
	try {
		if (value == 0 || value < 0) {
			return 0;
		}
		let num = Math.floor(total) / Math.floor(value);
		num = Math.floor(num);
		num = num > 10 ? 10 : num;
		return num;
	} catch (error) {
		return 0;
	}
};

export const convertNumberFromStringObject = (stringSet: string, field = "point") => {
	try {
		if (stringSet) {
			const newString = JSON.parse(stringSet);
			if (field == "point") {
				const point = parseInt(newString?.point);
				return isNaN(point) ? 0 : point.toLocaleString();
			}
			if (field == "distance") {
				const distance = parseFloat(newString?.distance);
				return isNaN(distance) ? 0 : distance.toLocaleString();
			}
			return newString?.[field];
		} else {
			return 0;
		}
	} catch (error) {
		return 0;
	}
};

export const randomLatLong = function () {
	try {
		const minLatitude = 8.1758; // Southernmost point of Vietnam
		const maxLatitude = 23.3934; // Northernmost point of Vietnam
		const minLongitude = 102.1446; // Westernmost point of Vietnam
		const maxLongitude = 109.4694; // Easternmost point of Vietnam

		// Generate a random latitude within the defined range
		const latitude = Math.random() * (maxLatitude - minLatitude) + minLatitude;

		// Generate a random longitude within the defined range
		const longitude = Math.random() * (maxLongitude - minLongitude) + minLongitude;

		return { latitude: latitude, longitude: longitude };
	} catch (error) {
		return 0;
	}
};

export const ignoreRouter = () => {
	try {
		const listRouter = ["/rule", "/zapps/685771351622425549/rule"];
		const currentRoute = window.location.pathname;
		if (listRouter.includes(currentRoute)) {
			return true;
		}
		return false;
	} catch (error) {
		return false;
	}
};

export const activeRoute = function (pathname = "", routecheck = []) {
	try {
		let is_active = false;
		if (pathname && routecheck) {
			routecheck.forEach((rot) => {
				if (pathname.indexOf(rot) > -1) {
					is_active = true;
				}
			});
		}
		if (is_active == false) {
			return "";
		} else {
			return "active";
		}
	} catch (error) {
		return "";
	}
};

export const checkListUrlRedirect = function (redirect: string) {
	try {
		const listRouter = ["tnc", "personal"];
		if (listRouter.includes(redirect)) {
			return true;
		}
		return false;
	} catch (error) {
		return false;
	}
};

export const checkListUrlRedirectCustom = function (redirect: string) {
	try {
		const listRouter = ["tnc", "personal"];

		if (listRouter.includes(redirect)) {
			return true;
		}
		if (redirect.indexOf("news-detail/")) {
			return true;
		}

		return false;
	} catch (error) {
		return 0;
	}
};

export const parseInteger = (num = 0, signed = false) => {
	num = Math.floor(num);
	return isNaN(num) ? 0 : signed ? num : Math.abs(num);
};

export const randomString = (len: number, chars: string) => {
	len = parseInteger(len);
	const characters = chars;
	let value = new Array(len);
	for (let i = 0; i < len; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		value[i] = characters[randomIndex];
	}
	return value.join("");
};

export const convertDateUTC = () => {
	return moment.utc().valueOf();
};

export const loadImageThumb = (originalImageUrl: string, extra = "_thumb") => {
	const fileExtension = originalImageUrl.split(".").pop();
	// Add "_thumb" before the file extension to create the thumbnail URL
	const thumbnailImageUrl = originalImageUrl.replace(`.${fileExtension}`, `${extra}.${fileExtension}`);
	return thumbnailImageUrl || originalImageUrl;
};
