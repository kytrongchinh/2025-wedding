import { AdaptiveAnalytics } from "zmp-ga4";

let GA = null;
const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS;

export const initGA = () => {
	GA = new AdaptiveAnalytics(
		trackingId, // measurement id
		"5vOFT-3sSFG7gH3BNF-7xQ", //measurement protocol api secrets
		{
			useMeasurementProtocolWhen() {
				return true;
			},
			gtagConfig: {
				send_page_view: false,
			},
		}
	);
};

export const GAevent = (eventName) => {
	if (GA) {
		const params = loadEvent(eventName);
		GA.trackEvent(eventName, params);
	}
};

export const ACTIONS = {
	click_btn_mo_zalo: "click_btn_mo_zalo",
};

const loadEvent = (eventName) => {
	let params = {
		label: eventName,
		category: eventName,
	};
	switch (eventName) {
		//----------------------------------------------------------------
		case "click_btn_tham_gia_ngay":
			params = {
				category: "Trang Homepage",
				lable: "Tham gia ngay",
				description: "Nút Tham gia ngay trong trang chủ",
			};
			break;
	}
	return params;
};
