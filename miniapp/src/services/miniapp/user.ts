import { authorize, getUserID, getUserInfo, getAccessToken, getPhoneNumber, getSetting } from "zmp-sdk/apis";
type Scope = "scope.userInfo" | "scope.userLocation" | "scope.userPhonenumber";

class UserApi {
	/*********************************Authorization******************************** */

	async authorize(scopes: Scope[]) {
		try {
			const data = await authorize({ scopes });
			return data;
		} catch (error) {
			console.log("Error authorize :>> ", error);
			return null;
		}
	}

	/*********************************User information******************************** */
	async getUserID() {
		try {
			const data = await getUserID({});
			return data;
		} catch (error) {
			console.log("Error getUserID :>> ", error);
			return null;
		}
	}
	async getUserInfo() {
		try {
			const data = await getUserInfo({});
			return data;
		} catch (error) {
			console.log("Error getUserInfo :>> ", error);
			return null;
		}
	}

	async getAccessToken() {
		try {
			const data = await getAccessToken({});
			return data;
		} catch (error) {
			console.log("Error getAccessToken :>> ", error);
			return null;
		}
	}
	async getPhoneNumber() {
		try {
			const data = await getPhoneNumber({});
			return data;
		} catch (error) {
			console.log("Error getPhoneNumber :>> ", error);
			return null;
		}
	}
	/*********************************Setting******************************** */
	async getSetting() {
		try {
			const data = await getSetting({});
			return data;
		} catch (error) {
			console.log("Error getSetting  :>> ", error);
			return null;
		}
	}
}
export default new UserApi();
