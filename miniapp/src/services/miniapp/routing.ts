import { closeApp, openMiniApp, getRouteParams, openWebview } from "zmp-sdk/apis";

type DataOpen = {
	appId: string;
	params: Record<string, any>; // Ensures params is an object with key-value pairs
};
class RoutingApi {
	async closeApp() {
		try {
			const data = await closeApp({});
			return data;
		} catch (error) {
			console.log("Error closeApp :>> ", error);
			return false;
		}
	}

	async openMiniApp(dataopen: DataOpen) {
		try {
			const data = await openMiniApp(dataopen);
			return data;
		} catch (error) {
			console.log("Error openMiniApp  :>> ", error);
			return false;
		}
	}

	async getRouteParams() {
		try {
			const data = getRouteParams();
			return data;
		} catch (error) {
			console.log("Error getRouteParams  :>> ", error);
			return false;
		}
	}

	async openWebview(url: string) {
		try {
			const data = await openWebview({ url });
			return data;
		} catch (error) {
			console.log("Error openWebview   :>> ", error);
			return false;
		}
	}
}
export default new RoutingApi();
