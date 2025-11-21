import { HTTP_METHOD, HTTP_STATUS_CODE } from "types/enums";
import { ApiResponse, CommonData } from "types/interface";
import { ParamsAxios } from "types/types";
import CallApi from "@/utils/call-api";

class AdtimaBoxApi extends CallApi {
	private url_api_addresss: string;
	private url_api: string;
	private campaign_id: string;
	private campaign_secret_key: string;
	private challengeId: string;
	constructor() {
		super();
		this.url_api_addresss = "https://campaign-public-api-v2-stg.adtimabox.vn/digital-api";
		this.url_api = import.meta.env.VITE_API_URL || "";
		this.campaign_id = import.meta.env.VITE_CAMPAIGN_ID || "";
		this.campaign_secret_key = import.meta.env.VITE_CAMPAIGN_SECRET_KEY || "";
		this.challengeId = import.meta.env.VITE_CHALLENGE_ID || "";
	}
	// *********************************** Authen **********************************
	async getTokenMini(userToken: string) {
		try {
			const url = this.url_api + "/digital-user-auth/getTokenDigitalMiniApp";
			const params: ParamsAxios = {
				url,
				method: HTTP_METHOD.POST,
				data: { campaignId: this.campaign_id, tokenUser: userToken },
			};
			const result = await this.http_request<ApiResponse<CommonData>>(params);

			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getToken :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}
	// *********************************** Captcha **********************************
	async getCaptcha(token: string, length = 4, charsetType = "alphabet", width = 200, height = 50) {
		try {
			const url = `${this.url_api}/digital-user-auth/getCaptcha?length=${length}&charsetType=${charsetType}&width=${width}&height=${height}`;
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getCaptcha :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** get user profile **********************************
	async getMe(token: string) {
		try {
			const url = this.url_api + "/digital-user/me";
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getMe :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	async updateProfile(token: string, data: any) {
		try {
			const url = `${this.url_api}/digital-user`;
			const authorization = `Bearer ${token}`;

			const params = { url, headers: { authorization }, method: HTTP_METHOD.PUT, data: data };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getMe :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}
	// *********************************** checkFollow **********************************
	async checkFollow(token: string) {
		try {
			const url = this.url_api + "/digital-user/check-follow";
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error checkFollow :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** myPoint **********************************
	async myPoint(token: string) {
		try {
			const url = this.url_api + "/digital-user/myPoint";
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error myPoint :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** myGift **********************************
	async myGift(token: string, page = 0, limit = 6) {
		try {
			const url = `${this.url_api}/digital-user/myGift?limit=${limit}&page=${page}`;
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error myGift :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** myGiftDetail **********************************
	async myGiftDetail(token: string, gift_id: string) {
		try {
			const url = `${this.url_api}/digital-user/myGift/${gift_id}`;
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error myGiftDetail :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** getCampaignDetail **********************************
	async getCampaignDetail() {
		try {
			const url = `${this.url_api}/digital-campaign/detail/${this.campaign_id}`;
			const params: ParamsAxios = { url, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getCampaignDetail :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	// *********************************** getCampaignDetail **********************************
	async getProvinces(token: string) {
		try {
			const url = `${this.url_api_addresss}/address/provinces?limit=63&page=0`;
			const authorization = `Bearer ${token}`;
			const params: ParamsAxios = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error getProvinces :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}

	async myLocationPhone(token: string, minitoken: string, code: string) {
		try {
			const url = `${this.url_api}/digital-user/myLocationPhone?userAccessToken=${minitoken}&code=${code}`;
			const authorization = `Bearer ${token}`;

			const params = { url, headers: { authorization }, method: HTTP_METHOD.GET };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error myLocationPhone :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed",
			};
		}
	}
}

export default new AdtimaBoxApi();
