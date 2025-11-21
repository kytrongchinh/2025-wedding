import axios from "axios";
import { ParamsAxios } from "../types/types";

class CallApi {
	// Make the function generic with <T>
	http_request = <T>(params: ParamsAxios): Promise<T> => {
		return new Promise<T>((resolve, reject) => {
			if (!params.url) reject(new Error("No URL provided"));

			let headers = {
				Accept: "application/json",
				"Content-Type": "application/json; charset=utf-8",
			};

			if (typeof params.headers === "object") {
				headers = { ...headers, ...params.headers };
			}

			const axiosOptions = {
				baseURL: params.url,
				headers: headers,
				timeout: params?.timeout || 10000,
			};

			const axiosClient = axios.create(axiosOptions);

			if (params.method === "GET") {
				axiosClient
					.get(params.url, { params: params.data })
					.then((res) => resolve(res.data as T))
					.catch((err) => reject(err));
			} else if (params.method === "POST") {
				axiosClient
					.post(params.url, params.data)
					.then((res) => resolve(res.data as T))
					.catch((err) => {
						console.log(`eee POST==>`, err);
						reject(err);
					});
			} else if (params.method === "PUT") {
				axiosClient
					.put(params.url, params.data)
					.then((res) => resolve(res.data as T))
					.catch((err) => reject(err));
			} else {
				reject(new Error("Invalid HTTP method"));
			}
		});
	};
}

export default CallApi;
