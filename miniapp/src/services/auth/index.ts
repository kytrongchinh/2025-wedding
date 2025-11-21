import UserApi from "@/services/miniapp/user";
import adtimabox from "@/services/adtimabox/index";

import config from "@/configs";
import { ROUTERS } from "types/contants";

class Authentication {
	private zmpToken: string | null;
	constructor() {
		this.zmpToken = null;
	}

	async getMiniAppToken() {
		try {
			const isDevMode = config?.MODE === "development";
			// Get and check Authorize
			const getAuthorize = await UserApi.getSetting();
			if (!getAuthorize) {
				const authorizeResult = await UserApi.authorize(["scope.userInfo", "scope.userPhonenumber"]);
				if (!authorizeResult) return null;
			}
			// -- Get token miniapp --310438
			let tokenFromMiniapp: string | null = null;
			if (isDevMode) tokenFromMiniapp = config?.USER_TOKEN;
			else tokenFromMiniapp = await UserApi.getAccessToken();
			if (!tokenFromMiniapp) return null;
			if (typeof tokenFromMiniapp === "string") {
				this.zmpToken = tokenFromMiniapp;
			}

			return tokenFromMiniapp;
		} catch (error) {
			console.log("getMiniAppToken error :>> ", error);
			return null;
		}
	}

	async getUserToken() {
		try {
			const tokenFromMiniapp = await this.getMiniAppToken();
			if (!tokenFromMiniapp) return null;
			// -- Get token adtimabox --
			const tokenFromAdtimaBox = await adtimabox.getTokenMini(tokenFromMiniapp);
			if (!tokenFromAdtimaBox) return null;
			// Save token to local storage
			if (tokenFromAdtimaBox?.data) {
				return tokenFromAdtimaBox.data;
			} else {
				console.log("Error getMe from adtimaBox");
				return null;
			}
		} catch (error) {
			console.log("getUserToken error :>> ", error);
			return null;
		}
	}

	async getAuthenticationInfo(adtimaBoxToken: any, retryCount = 0) {
		try {
			let userToken = adtimaBoxToken;
			if (!userToken) {
				const data_response = await this.getUserToken();
				if (!data_response || data_response == null) return null;
				userToken = data_response;
			}
			if (!userToken) throw new Error("Missing user token");

			const userData = await adtimabox.getMe(userToken?.accessToken);
			if (!userData) {
				console.log("Free cache and reset token");
				// Tránh infinite loop
				if (retryCount >= 2) {
					console.error("Reached maximum retry limit");
					return null;
				}

				if (!adtimaBoxToken) return null;

				return await this.getAuthenticationInfo(null, retryCount + 1);
			}

			if (!this.zmpToken) {
				this.zmpToken = await this.getMiniAppToken();
			}

			return {
				token: userToken,
				infor: userData?.data,
				zmpToken: this.zmpToken,
			};
		} catch (error) {
			console.log("getAuthenticationInfo error :>> ", error);
			return null;
		}
	}

	getRouteByUserInfo(userInfo: any) {
		if (!userInfo?.phone) return ROUTERS.HOME;
		else if (!userInfo?.isFollow || !userInfo?.uId) return ROUTERS.HOME;
		return ROUTERS.HOME;
	}
}

export default new Authentication();
