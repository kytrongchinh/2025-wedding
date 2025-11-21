import { MY_ROUTERS } from "./enums";

export const ROUTERS = {
	HOME: MY_ROUTERS.HOME,
	TNC: MY_ROUTERS.TNC,
	PERSONAL: MY_ROUTERS.PERSONAL,
	FORM: MY_ROUTERS.FORM,
	FOLLOW: MY_ROUTERS.FOLLOW,
	HISTORY: MY_ROUTERS.HISTORY,
};
export const LIST_ROUTER_GO_BACK = [MY_ROUTERS.HISTORY, MY_ROUTERS.UPDATE_INFO];
export const LIST_ROUTER_TO_ROUTER = [MY_ROUTERS.GIFT];
export const LIST_ROUTER_TO_HOME = [MY_ROUTERS.ITEM];
export const LIST_ROUTER_DISABLE = [MY_ROUTERS.ITEM];
export const ROUTRERS_USER_CANNOT_ACCESS_BEFORE_CAMPAIGN_START = [
	MY_ROUTERS.HOME,
	MY_ROUTERS.GIFT,
	MY_ROUTERS.PERSONAL,
	// MY_ROUTERS.FORM,
	MY_ROUTERS.UPDATE_INFO,
	MY_ROUTERS.SCAN,
	MY_ROUTERS.SCAN_ID,
];
export const ROUTRERS_USER_CANNOT_ACCESS_AFTER_CAMPAIGN_END = [MY_ROUTERS.TNC, MY_ROUTERS.UPDATE_INFO, MY_ROUTERS, MY_ROUTERS.SCAN, MY_ROUTERS.SCAN_ID];
export const ROUTRERS_NEED_AUTH = [MY_ROUTERS.FORM, MY_ROUTERS.HISTORY, MY_ROUTERS.PERSONAL, MY_ROUTERS.UPDATE_INFO, MY_ROUTERS.SCAN, MY_ROUTERS.SCAN_ID];
export const ROUTRERS_NEED_FOLLOW_OA = [MY_ROUTERS.HISTORY, MY_ROUTERS.SCAN, MY_ROUTERS.SCAN_ID];

export const USER_TOKEN_CACHE_KEY = "USER_TOKEN_CACHE_KEY";

export const PHONE_PREFIX = [
	"035",
	"036",
	"079",
	"056",
	"070",
	"092",
	"039",
	"094",
	"098",
	"078",
	"083",
	"097",
	"038",
	"086",
	"084",
	"089",
	"034",
	"093",
	"088",
	"058",
	"080",
	"059",
	"091",
	"037",
	"090",
	"082",
	"081",
	"033",
	"099",
	"077",
	"085",
	"076",
	"032",
	"096",
	"087",
	"055",
	"095",
];

const phoneValidate = (phoneNumber) => {
	const phoneParten = /^((01|02|03|05|07|08|09)+([0-9]{8})\b)|((02)+([0-9]{9})\b)+$/;
	return (phoneParten.test(phoneNumber) && PHONE_PREFIX.includes(phoneNumber.substr(0, 3))) || "Số điện thoại không hợp lệ";
};
export const REGISTER_FORM_VALIDATES = {
	lotteryCode: {
		required: "Vui lòng nhập mã dự thưởng.",
		validate: (value) => !!value.trim() || "Vui lòng nhập mã dự thưởng",
		minLength: {
			value: 3,
			message: "Vui lòng nhập mã dự thưởng ít nhất 3 ký tự",
		},
		maxLength: {
			value: 300,
			message: "Vui lòng nhập mã dự thưởng tối đa 300 ký tự",
		},
	},
	fullName: {
		required: "Vui lòng nhập họ tên.",
		validate: (value) => !!value.trim() || "Vui lòng nhập họ tên.",
		minLength: {
			value: 3,
			message: "Tên phải tối thiếu là 3 ký tự",
		},
		maxLength: {
			value: 300,
			message: "Tên phải tối đa là 300 ký tự",
		},
	},
	phone: {
		required: "Vui lòng nhập số điện thoại",
		validate: phoneValidate,
		minLength: {
			value: 10,
			message: "Số điện thoại không hợp lệ",
		},
		maxLength: {
			value: 11,
			message: "Số điện thoại không hợp lệ",
		},
	},
	address: {
		required: "Vui lòng nhập địa chỉ",
		validate: (value) => !!value.trim() || "Vui lòng nhập địa chỉ",
		minLength: {
			value: 3,
			message: "Địa chỉ phải tối thiểu 3 ký tự",
		},
		maxLength: {
			value: 300,
			message: "Địa chỉ có tối đa là 300 ký tự",
		},
	},
	fieldEmail: {
		required: "Vui lòng nhập email",
		pattern: { value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, message: "Email không hợp lệ" },
	},

	province: {
		required: "Vui lòng chọn thành phố",
	},
	captcha: {
		required: "Vui lòng nhập captcha",
	},
};
