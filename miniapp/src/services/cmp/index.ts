import { dataConsent } from "@/types/interface";
import { HTTP_METHOD, HTTP_STATUS_CODE } from "types/enums";
import { ApiResponse, CommonData } from "types/interface";
import { cmpOptions, ParamsAxios } from "types/types";
import CallApi from "@/utils/call-api";

class cmp extends CallApi {
	private url_api: string;
	constructor() {
		super();
		this.url_api = "https://cmp-public-api.adtimabox.vn/digital-api";
	}

	// Return type as Promise<ApiResponse<CommonData>>
	async getCmpTerms(options: cmpOptions): Promise<ApiResponse<CommonData>> {
		try {
			const url = this.url_api + "/cmp-terms";
			const requestData: ParamsAxios = { method: HTTP_METHOD.GET, url, data: options };

			// Await the API call and type the response
			const adtimaResponse = await this.http_request<ApiResponse<CommonData>>(requestData);

			// Check for success status and data
			if (adtimaResponse?.statusCode === HTTP_STATUS_CODE.OK && adtimaResponse?.data) {
				return adtimaResponse;
			} else {
				throw new Error("Not Found");
			}
		} catch (error) {
			console.log("Error getCmpTerms :>> ", error);

			// Return a consistent error response
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: {} as CommonData, // Return an empty object as fallback
				message: "Failed to fetch CMP Terms",
			};
		}
	}

	async sendConsent(dataconsent: dataConsent): Promise<ApiResponse<CommonData>> {
		try {
			const url = this.url_api + "/cmp-consents";

			const requestData: ParamsAxios = { method: HTTP_METHOD.POST, url, data: dataconsent };
			const adtimaResponse = await this.http_request<ApiResponse<CommonData>>(requestData);
			console.log(`adtimaResponse==>`, adtimaResponse);
			if (adtimaResponse?.statusCode === HTTP_STATUS_CODE.OK && adtimaResponse?.data) {
				return adtimaResponse;
			} else {
				throw new Error("Not Found");
			}
		} catch (error) {
			console.log("Error sendConsent :>> ", error);

			// Return a consistent error response
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: {} as CommonData, // Return an empty object as fallback
				message: "Failed to  sendConsent",
			};
		}
	}
}
export default new cmp();
