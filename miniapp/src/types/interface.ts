import { ReactNode } from "react";
export interface ApiResponse<T> {
	statusCode: number;
	data: T;
	message: string;
	status?: number;
}
export interface CommonData {
	data: object | string;
}

export interface MainSectionProps {
	title?: string;
	description?: string;
	children: ReactNode;
	bodyClass?: string;
}

export interface CommonProps {
	[key: string]: any;
}

export interface HeaderSectionProps {
	title?: string;
}

export interface ButtonProps {
	text: string;
	buttonType?: string;
	onClick?: () => void;
	path?: string;
	align?: string;
	customClass?: string;
	variant?: "primary" | "secondary" | "tertiary" | "white";
}

export interface CmpRequestData {
	organization_id: any;
	term_id: any;
	extend_app_id: any;
	extend_app_name: any;
	extend_id: string;
	platform: string;
	browser: string;
}
export interface CmpDataResponse {
	mappingKey: any;
	termListIds: any[];
	termList: any[];
	termCheckList: Record<string, any>; // Use Record<string, any> for an object with dynamic keys
	requestData: CmpRequestData;
}

export interface dataConsent {
	organization_id: string;
	mapping_key: string;
	extend_app_id: string;
	extend_app_name: string;
	extend_uid: string;
	term_id: string;
	property_last_data: string;
	last_platform: string;
	last_browser: string;
}
