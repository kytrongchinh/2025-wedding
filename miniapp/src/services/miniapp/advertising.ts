import { setupAd, loadAd, displayAd, refreshAd } from "zmp-sdk/apis";
class AdvertisingApi {
	async setupAd() {
		try {
			const data = await setupAd({});
			return data;
		} catch (error) {
			console.log("Error setupAd  :>> ", error);
			return false;
		}
	}
	async loadAd(ids: string[], config: object) {
		try {
			const data = await loadAd({ ids, config });
			return data;
		} catch (error) {
			console.log("Error loadAd  :>> ", error);
			return false;
		}
	}
	async displayAd(id: string) {
		try {
			const data = await displayAd({ id });
			return data;
		} catch (error) {
			console.log("Error displayAd  :>> ", error);
			return false;
		}
	}
	async refreshAd(id: string) {
		try {
			const data = await refreshAd({ id });
			return data;
		} catch (error) {
			console.log("Error refreshAd  :>> ", error);
			return false;
		}
	}
}
export default new AdvertisingApi();
