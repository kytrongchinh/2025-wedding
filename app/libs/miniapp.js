const { OpenAPIClient } = require("zmp-openapi-nodejs");
const API_KEY = "mRMzT3zwYWd1jAHoENME3zcoe78aSu4BtBQeTJKuplOPJ3vob0i";
const ZALO_APP_ID = "3186780210664908793";
const MINIAPP_ID = "3124194681467352875";
const { HttpsProxyAgent } = require("https-proxy-agent");
class Miniapp {
	constructor() {
		this.client = "";
	}

	// set accessToken
	async setClient() {
		try {
			// Setup client
			if (this.client) {
				return true;
			}

			const client = new OpenAPIClient(
				API_KEY,
				ZALO_APP_ID
				// proxy // optional
			);

			// If you didn't config proxy at init, you can use this function to add proxy
			if (appConfig.env != "develop") {
				const proxy = {
					host: "10.100.100.254",
					port: "3128",
					// host: "10.50.173.232",
					// port: 254,
				};
				// const proxy = new HttpsProxyAgent(appConfig.http_proxy);
				client.setProxy(proxy);
			}
			console.log(`==>`, client);
			this.client = client;
			return true;
		} catch (error) {
			console.log(`==>`, error);
			return false;
		}
	}
	async getAnalystInstance(data) {
		try {
			await this.setClient();
			let statsRequest = {
				miniAppId: MINIAPP_ID,
				// type: "access-traffic",
				// startTime: 1700240400000,
				// endTime: 1702832399999,
				// utmSource: "zalo-search", // optional
			};
			statsRequest = { ...statsRequest, ...data };
			console.log(`==>statsRequest`, statsRequest);
			const response = await this.client.getStats(statsRequest);
			console.log(`response==>`, response);
			return response.data;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
module.exports = new Miniapp();
