import { getNetworkType, onNetworkStatusChange, openPhone, openSMS, keepScreen, vibrate, checkStateBioAuthentication, openBioAuthentication } from "zmp-sdk/apis";
type NetworkStatus = {
	isConnected: boolean;
	networkType: string;
};
type BioAuthen = {
	secretData: string;
	ui: object;
	requireFingerprint: boolean;
};
class DeviceApi {
	/*********************************Network******************************** */
	async getNetworkType() {
		try {
			const data = await getNetworkType({});
			return data;
		} catch (error) {
			console.log("Error getNetworkType :>> ", error);
			return false;
		}
	}
	async getNetworkStatus(): Promise<NetworkStatus> {
		return new Promise((resolve) => {
			onNetworkStatusChange((data: NetworkStatus) => {
				resolve(data);
			});
		});
	}

	async onNetworkStatusChangeHandler() {
		try {
			const data = await this.getNetworkStatus();
			return data;
		} catch (error) {
			console.log("Error onNetworkStatusChange :>> ", error);
			return false;
		}
	}
	/*********************************Contact******************************** */
	async openPhone(phone: string) {
		try {
			const data = await openPhone({
				phoneNumber: phone,
			});
			return data;
		} catch (error) {
			console.log("Error openPhone :>> ", error);
			return false;
		}
	}
	async openSMS(content: string, phone: string) {
		try {
			const data = await openSMS({
				content: content,
				phoneNumber: phone,
			});
			return data;
		} catch (error) {
			console.log("Error openSMS :>> ", error);
			return false;
		}
	}
	/*********************************Screen******************************** */
	async keepScreen(status = true) {
		try {
			const data = await keepScreen({
				keepScreenOn: status,
			});
			return data;
		} catch (error) {
			console.log("Error keepScreen :>> ", error);
			return false;
		}
	}
	async vibrate(milliseconds: number) {
		try {
			const data = await vibrate({
				milliseconds: milliseconds,
				type: "oneShot",
			});
			return data;
		} catch (error) {
			console.log("Error vibrate :>> ", error);
			return false;
		}
	}
	/*********************************Biometric Authentication******************************** */
	async checkStateBioAuthentication(milliseconds: number) {
		try {
			const data = await checkStateBioAuthentication({});
			return data;
		} catch (error) {
			console.log("Error checkStateBioAuthentication :>> ", error);
			return false;
		}
	}
	async openBioAuthenUI(mybio: BioAuthen) {
		try {
			const data = await openBioAuthentication(mybio);
			return data;
		} catch (error) {
			console.log("Error openBioAuthentication :>> ", error);
			return false;
		}
	}
}
export default new DeviceApi();
