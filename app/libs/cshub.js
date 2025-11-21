const URL_AUTH = "https://cshub.adtimabox.vn/api/publics/auth/get-access-token";
const URL_API = "https://cshub.adtimabox.vn/api/";
const HUB_APP_ID = "a5e4047ae196a89b251f389b2e4090be";
const HUB_APP_SECRET = "2d3cc4736610275d4e8a81c81caf3931ee1a6282236619d9acca9c74349698f9";
const HUB_ORGANIZATION = "64db30ec987771e0ff0fffb2";
const HUB_OAID = "4055269882832372821";
const _ = require("lodash");
const moment = require("moment");
class cshub {
	/** Init token
	 *
	 * @param oaId
	 */
	constructor() {
		this.token = "";
		this.apiUrl = URL_API;
		this.apiAuth = URL_AUTH;
		this.app_id = HUB_APP_ID;
		this.app_secret = HUB_APP_SECRET;
		this.organization = HUB_ORGANIZATION;
	}

	// set Token
	async setToken() {
		try {
			let cs_hub_token = await libs.redis.get("cs_hub_token");
			if (cs_hub_token) {
				this.token = cs_hub_token;
				return;
			}

			// get access_token by refresh_token
			let params = {
				headers: {
					organization: this.organization,
					"Content-type": "application/json",
				},
				url: this.apiAuth,
				method: "POST",
				data: {
					app_id: this.app_id,
					app_secret: this.app_secret,
				},
			};
			// console.log(params, "params");
			let result = await helpers.base.http_request(params);
			console.log("result", result);
			if (result) {
				if (result?.statusCode == 200) {
					this.token = result?.data?.accessToken;
					libs.redis.set("cs_hub_token", result?.data?.accessToken, 12 * 60 * 60 - 500);
				}
			} else {
				console.log("cs_hub_token", params);
			}
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventCreatUser(data) {
		try {
			await this.setToken();
			if (_.isObject(data)) {
				let data_push = {
					oa_id: HUB_OAID,
					source: "Campaign Milo",
					name: data?.fullname,
					zalo_id_by_oa: data?.user_id,
					zalo_id_by_app: data?.user_id_by_app,
					zalo_name: data?.display_name,
					phone: data?.phone,
					orgId: data?.cmp_info?.cmpKey || "",
					extras: {
						milo_utm_source: data?.mparams?.utm_source || "",
						milo_utm_medium: data?.mparams?.utm_medium || "",
						milo_utm_campaign: data?.mparams?.utm_campaign || "",
					},
				};
				const cshubModel = require("../modules/cshub/models");

				const log = await cshubModel.create("cshub_logs", { name: "eventCreatUser", data_request: data_push, status: 0 });

				let params = {
					headers: {
						"Content-type": "application/json",
						authorization: `Bearer ${this.token}`,
						organization: this.organization,
					},
					url: this.apiUrl + "publics/business-customer/add-customer",
					method: "POST",
					data: data_push,
				};

				const result = await helpers.base.http_request_new(params);
				if (result) {
					cshubModel.updateOne("cshub_logs", { _id: log?.msg?._id }, { data_response: result, status: 1 });
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return false;
		}
	}

	async eventPushCert(data, user) {
		try {
			await this.setToken();
			if (_.isObject(data)) {
				const element = data;

				// let data_push = {
				// 	phone: element?.phone,
				// 	extras: {},
				// };
				let data_push = {
					oa_id: HUB_OAID,
					source: "Campaign Milo",
					name: user?.fullname,
					zalo_id_by_oa: user?.user_id,
					zalo_id_by_app: user?.user_id_by_app,
					zalo_name: user?.fullname,
					phone: user?.phone,
					extras: {},
					is_upsert: true,
					// engage_at: element.date,
					current_round: element.challenge,
				};
				data_push.extras[`played_at${element.challenge}`] = element.date;
				const cshubModel = require("../modules/cshub/models");

				const log = await cshubModel.create("cshub_logs", { name: "eventPushChallenge", data_request: data_push, status: 0 });

				let params = {
					headers: {
						"Content-type": "application/json",
						authorization: `Bearer ${this.token}`,
						organization: this.organization,
					},
					url: this.apiUrl + "publics/business-customer/update-customer",
					method: "POST",
					data: data_push,
				};

				const result = await helpers.base.http_request_new(params);
				if (result) {
					cshubModel.updateOne("cshub_logs", { _id: log?.msg?._id }, { data_response: result, status: 1 });
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return false;
		}
	}

	async eventPushEngage(data, user) {
		try {
			await this.setToken();
			if (_.isObject(data)) {
				const element = data;

				// let data_push = {
				// 	phone: element?.phone,
				// 	extras: {},
				// };
				let data_push = {
					oa_id: HUB_OAID,
					source: "Campaign Milo",
					name: user?.fullname,
					zalo_id_by_oa: user?.user_id,
					zalo_id_by_app: user?.user_id_by_app,
					zalo_name: user?.fullname,
					phone: user?.phone,
					extras: {},
					is_upsert: true,
					// engage_at: element.date,
					// current_round: element.challenge,
				};
				data_push.extras[`played_at_1`] = element.date;
				data_push.extras[`engage_at`] = element.date;
				data_push.extras[`current_round`] = 1;
				const cshubModel = require("../modules/cshub/models");

				const log = await cshubModel.create("cshub_logs", { name: "eventPushEngage", data_request: data_push, status: 0 });

				let params = {
					headers: {
						"Content-type": "application/json",
						authorization: `Bearer ${this.token}`,
						organization: this.organization,
					},
					url: this.apiUrl + "publics/business-customer/update-customer",
					method: "POST",
					data: data_push,
				};

				const result = await helpers.base.http_request_new(params);
				if (result) {
					cshubModel.updateOne("cshub_logs", { _id: log?.msg?._id }, { data_response: result, status: 1 });
				} else {
					console.log("eventPushEngage", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return false;
		}
	}
}

module.exports = new cshub();
