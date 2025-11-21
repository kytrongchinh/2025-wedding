import { showFunctionButtonWidget, showOAWidget } from "zmp-sdk/apis";
type Widget = {
	id: string;
	type: string;
	text: string;
	fontSize?: string;
	color?: string;
	onDataReceived?: (messageToken: string) => void;
};
class WidgetsApi {
	async showFunctionButtonWidget(wg: Widget) {
		try {
			const data = await showFunctionButtonWidget(wg);
			return data;
		} catch (error) {
			console.log("Error showFunctionButtonWidget :>> ", error);
			return false;
		}
	}
}
export default new WidgetsApi();
