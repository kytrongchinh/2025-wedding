import { HTTP_METHOD, HTTP_STATUS_CODE } from "types/enums";
import { ApiResponse, CommonData } from "types/interface";
import { ParamsAxios } from "types/types";
import CallApi from "@/utils/call-api";

class MyApi extends CallApi {
	private my_url: string;
	constructor() {
		super();
		this.my_url = import.meta.env.VITE_MY_URL || "";
	}
	async upload(token: string, data = {}) {
		try {
			const url = `${this.my_url}/upload`;
			const authorization = `Bearer ${token}`;

			const params: ParamsAxios = { url, headers: { token: token }, method: HTTP_METHOD.POST, data };
			const result = await this.http_request<ApiResponse<CommonData>>(params);
			if (result?.status !== HTTP_STATUS_CODE.OK && !result?.data) {
				throw new Error(`Upload failed with status code ${result?.status}, data: ${JSON.stringify(result?.data)}, message: ${result?.message}`);
			}
			return result;
		} catch (error) {
			console.log("Error upload :>> ", error);
			return {
				statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
				data: {},
				message: "Failed",
			};
		}
	}
}
export default new MyApi();
