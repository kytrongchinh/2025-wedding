import { openPermissionSetting, requestSendNotification } from "zmp-sdk/apis";
class PermissionApi {
	async openPermissionSetting() {
		try {
			const data = await openPermissionSetting({});
			return data;
		} catch (error) {
			console.log("Error openPermissionSetting :>> ", error);
			return false;
		}
	}
	async requestSendNotification() {
		try {
			const data = await requestSendNotification({});
			return data;
		} catch (error) {
			console.log("Error requestSendNotification  :>> ", error);
			return false;
		}
	}
}
export default new PermissionApi();
