import { getLocation } from "zmp-sdk/apis";
class LocationApi {
	async getLocation() {
		try {
			const data = await getLocation({});
			return data;
		} catch (error) {
			console.log("Error getAppInfo :>> ", error);
			return false;
		}
	}
}
export default new LocationApi();
