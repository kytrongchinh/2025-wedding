import { getAppInfo, getSystemInfo, openOutApp, getDeviceId, getContextAsync } from "zmp-sdk/apis";
class BasicApi {
	private oa_id: string;
	private oa_url: string;
	private env: string;
	private user_token: string;
	constructor() {
		this.oa_id = import.meta.env.VITE_ZALO_OA_ID || "";
		this.oa_url = import.meta.env.VITE_ZALO_OA_URL || "";
		this.env = import.meta.env.MODE;
		this.user_token = import.meta.env.VITE_USER_TOKEN || "";
	}
	async getAppInfo() {
		try {
			const data = await getAppInfo({});
			return data;
		} catch (error) {
			console.log("Error getAppInfo :>> ", error);
			return false;
		}
	}

	async getSystemInfo() {
		try {
			const data = getSystemInfo();
			return data;
		} catch (error) {
			console.log("Error getSystemInfo :>> ", error);
			return false;
		}
	}

	async openOutApp(url: string) {
		try {
			const data = await openOutApp({
				url: url,
			});
			return data;
		} catch (error) {
			console.log("Error openOutApp :>> ", error);
			return false;
		}
	}
	async getDeviceId() {
		try {
			const data = getDeviceId();
			return data;
		} catch (error) {
			console.log("Error getDeviceId :>> ", error);
			return false;
		}
	}

	async getContextAsync() {
		try {
			const data = await getContextAsync();
			return data;
		} catch (error) {
			console.log("Error getContextAsync :>> ", error);
			return false;
		}
	}
}
export default new BasicApi();
