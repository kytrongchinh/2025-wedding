import { nativeStorage } from "zmp-sdk/apis";
class StorageApi {
	private oa_id: string;
	private oa_url: string;
	private env: string;
	private user_token: string;
	private expireTime: number;
	constructor() {
		this.oa_id = import.meta.env.VITE_ZALO_OA_ID || "";
		this.oa_url = import.meta.env.VITE_ZALO_OA_URL || "";
		this.env = import.meta.env.MODE;
		this.user_token = import.meta.env.VITE_USER_TOKEN || "";
		this.expireTime = 600000 * 3;
	}
	async setItem(key: string, value: string) {
		try {
			nativeStorage.setItem(key, value);
			return true;
		} catch (error) {
			console.log("Error setItem :>> ", error);
			return false;
		}
	}

	async getItem(key: string) {
		try {
			const data = nativeStorage.getItem(key);
			return data;
		} catch (error) {
			console.log("Error getStorage :>> ", error);
			return false;
		}
	}

	async getMiniAppStorageInfo() {
		try {
			const data = nativeStorage.getStorageInfo();
			return data;
		} catch (error) {
			console.log("Error getStorageInfo :>> ", error);
			return false;
		}
	}
	async removeItem(key: string) {
		try {
			nativeStorage.removeItem(key);
			return true;
		} catch (error) {
			console.log("Error removeStorage :>> ", error);
			return false;
		}
	}

	async clearStorage() {
		try {
			nativeStorage.clear();
			return true;
		} catch (error) {
			console.log("Error clearStorage :>> ", error);
			return false;
		}
	}
}
export default new StorageApi();
