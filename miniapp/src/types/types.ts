import { HTTP_METHOD } from "./enums";
export type ParamsAxios = {
	method: HTTP_METHOD;
	url: string;
	headers?: object;
	data?: any;
	timeout?: number;
};

export type cmpOptions = {
	organization_id: string;
	term_id: string;
	extend_app_id: string;
	extend_app_name: string;
	extend_id: string;
	platform: string;
	browser: string;
};

export type dataConsent = {
	organization_id: string;
	mapping_key: string;
	extend_app_id: string;
	extend_app_name: string;
	extend_uid: string;
	term_id: string;
	property_last_data: string;
	last_platform: string;
	last_browser: string;
};

export type PropsWheel = {
	wheelResultPosition: number;
	handlePlayGame: () => void;
	handleWheelStop: (animationName: number) => void;
};

export type WheelHandle = {
	set: (state: string) => void;
	start: (state: string, position: number) => void;
};
