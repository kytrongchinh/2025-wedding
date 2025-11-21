import config from "@/configs";
import cmpService from "@/services/cmp/index";
import { HTTP_STATUS_CODE } from "@/types/enums";
import { dataConsent } from "@/types/types";
import _ from "lodash";

const getOS = () => {
	const userAgent: string = window.navigator.userAgent;
	const platform: string = (window.navigator as any).userAgentData?.platform || window.navigator.platform;
	const macosPlatforms: string[] = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
	const windowsPlatforms: string[] = ["Win32", "Win64", "Windows", "WinCE"];
	const iosPlatforms: string[] = ["iPhone", "iPad", "iPod"];
	let os: string = "";

	// Determine the OS
	if (macosPlatforms.includes(platform)) {
		os = "MacOS";
	} else if (iosPlatforms.includes(platform)) {
		os = "iOS";
	} else if (windowsPlatforms.includes(platform)) {
		os = "Windows";
	} else if (/Android/.test(userAgent)) {
		os = "Android";
	} else if (/Linux/.test(platform)) {
		os = "Linux";
	} else {
		os = "Unknown";
	}
	return os;
};

export const getBrowser = (): string => {
	const userAgent: string = window.navigator.userAgent;

	// Utility function to test regex patterns on userAgent
	const test = (regexp: RegExp): boolean => {
		return regexp.test(userAgent);
	};
	// Check for different browsers
	if (test(/zalo/i)) {
		return "Zalo Browser";
	} else if (test(/opr\//i)) {
		return "Opera";
	} else if (test(/edg/i)) {
		return "Microsoft Edge";
	} else if (test(/chrome|chromium|crios/i)) {
		return "Google Chrome";
	} else if (test(/firefox|fxios/i)) {
		return "Mozilla Firefox";
	} else if (test(/safari/i) && !test(/chrome|chromium|crios/i)) {
		return "Apple Safari";
	} else if (test(/trident/i)) {
		return "Microsoft Internet Explorer";
	} else if (test(/ucbrowser/i)) {
		return "UC Browser";
	} else if (test(/samsungbrowser/i)) {
		return "Samsung Browser";
	} else {
		return "Unknown Browser";
	}
};

export const loadCMPData = async (user_id: string) => {
	try {
		const cmpOptions = {
			organization_id: config.CMP_ORGANIZATION_ID,
			term_id: config.CMP_TERM_ID,
			extend_app_id: config.CAMPAIGN_ID,
			extend_app_name: config.CAMPAIGN_NAME,
			extend_id: user_id,
			platform: getOS(),
			browser: getBrowser(),
		};
		const cmpResult = await cmpService.getCmpTerms(cmpOptions);
		if (cmpResult?.statusCode !== HTTP_STATUS_CODE.OK) throw new Error("CMP Error");

		const applicationTerm: any = cmpResult.data;
		const termList = applicationTerm?.term?.record[0]?.term_properties;
		if (!_.isArray(termList)) throw new Error("CMP Error");

		const applicationCmp = {
			mappingKey: applicationTerm?.data_obs,
			termListIds: [...termList].map((term) => term._id),
			termList: [...termList],
			termCheckList: {},
			requestData: cmpOptions,
		};

		termList.forEach((term) => {
			applicationCmp["termCheckList"][term._id] = {
				property_id: term._id,
				property_value: false,
				property_type: term.type,
				property_name: term.name,
			};
		});

		return applicationCmp;
	} catch (error) {
		console.log("error", error);
		return null;
	}
};

export const postConsents = async (cmpData: dataConsent) => {
	try {
		const convertData = {
			organization_id: cmpData.organization_id,
			mapping_key: cmpData.mapping_key,
			extend_app_id: cmpData.extend_app_id,
			extend_app_name: cmpData.extend_app_name,
			extend_uid: cmpData.extend_uid,
			term_id: cmpData.term_id,
			property_last_data: cmpData.property_last_data,
			last_platform: cmpData.last_platform,
			last_browser: cmpData.last_browser,
		};
		const adtimaResponse = await cmpService.sendConsent(convertData);

		return adtimaResponse ? true : false;
	} catch (error) {
		console.log("error", error);
		return false;
	}
};
