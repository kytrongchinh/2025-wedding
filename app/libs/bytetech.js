const URL_AUTH = "https://account.mydatalakes.com/api/accounts/authen";
const URL_API = "https://svc.mydatalakes.com/dhub-i/api/v1.0/ingest";
const _ = require("lodash");
const moment = require("moment");
// const saintGobainModel = require("../modules/saintgobain/models");
class ByteTech {
	/** Init token
	 *
	 * @param oaId
	 */
	constructor() {
		this.token = "";
		this.apiUrl = URL_API;
		this.apiAuth = URL_AUTH;
		this.username = appConfig?.BYTETECH?.USERNAME;
		this.apiKey = appConfig?.BYTETECH?.API_KEY;
		this.cdpGKey = appConfig?.BYTETECH?.CDP_GKEY;
	}

	// set Token
	async setToken() {
		try {
			let byte_tech_token = await libs.redis.get("byte_tech_token");
			if (byte_tech_token) {
				this.token = byte_tech_token;
				return;
			}

			// get access_token by refresh_token
			let params = {
				headers: {
					// secret_key: appConfig.zalo_app.secret_key,
					"Content-type": "application/json",
				},
				url: this.apiAuth,
				method: "POST",
				data: {
					username: this.username,
					apiKey: this.apiKey,
					cdpGKey: this.cdpGKey,
				},
			};
			let result = await helpers.base.http_request(params);
			if (result) {
				if (result?.success == true) {
					this.token = result?.token;
					libs.redis.set("byte_tech_token", result.token, parseInt(result?.expiredAfter) - 200);
				}
			} else {
				console.log("byte_tech_token", params);
			}
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushTurn(data) {
		try {
			await this.setToken();
			this.userEventPushTurn(data);
			if (_.isArray(data)) {
				const element = data.map((da) => {
					return {
						momCode: "M-Q3JP7-O-OHITB-M",
						refId: da?.customer_id + Date.now() + helpers.base.random(6, "1234567890qwertyuiopasdfghjklzxcvbnm"),
						customerId: da?.customer_id,
						phone: da?.phone,
						customFieldTexts: {
							customField01: da?.name,
							customField02: da?.brand,
							customField03: da?.region,
							customField04: da?.city,
							customField05: da?.district,
							customField06: da?.ward,
							customField07: da?.address,
							customField08: "normal",
							customField09: da?.area,
						},
						customFieldLongs: {
							customFieldLong02: da?.play_turn,
						},
					};
				});
				let data_push = element;
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushTurn", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;
				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-turn", "push-data-turn");
				let result = await helpers.base.http_request(params);

				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-turn-response", "push-data-turn-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async userEventPushTurn(data) {
		try {
			await this.setToken();
			if (_.isArray(data)) {
				const element = data.map((da) => {
					return {
						source: "M-Q3JP7-O-OHITB-M",
						sourceId: da?.customer_id,
						condition: "Changed",
						channel: "Online",
						eventCtg: "CampaignBehaviour",
						eventCtg2: "Changed",
						eventCtg3: "Changed",
						eventName: "PushTurn",
						eventAt: moment().format("X") * 1000,
						value: da?.play_turn,
						eventLabels: ["Normal"],
						eventLabel2s: [`Turn: ${da?.play_turn}`],
						eventLabel3s: [],
						customerId: da?.customer_id,
						phone: da?.phone,
						zaloOAId: "",
						zaloUserId: "",
						note: "Active",
						recordStatus: "",
						customFieldTexts: {
							customField01: da?.name,
							customField02: da?.brand,
							customField03: da?.region,
							customField04: da?.city,
							customField05: da?.district,
							customField06: da?.ward,
							customField07: da?.address,
							customField08: "normal",
							customField09: da?.area,
						},
						customFieldLongs: {
							customFieldLong02: da?.play_turn,
						},
					};
				});
				let data_push = element;
				let data_send = {
					objectType: "user-event",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "userEventPushTurn", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "user-event-push-data-turn", "user-event-push-data-turn");
				let result = await helpers.base.http_request(params);

				data_log.result = result;
				helpers.log.writeData(data_log, "user-event-push-data-turn-response", "user-event-push-data-turn-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("userEventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushGoldTurn(data) {
		try {
			await this.setToken();
			this.userEventPushGoldTurn(data);
			if (_.isArray(data)) {
				const element = data.map((da) => {
					return {
						momCode: "M-Q3JP7-O-OHITB-M",
						refId: da?.customer_id + Date.now() + helpers.base.random(6, "1234567890qwertyuiopasdfghjklzxcvbnm"),
						customerId: da?.customer_id,
						phone: da?.phone,
						customFieldTexts: {
							customField01: da?.name,
							customField02: da?.brand,
							customField03: da?.region,
							customField04: da?.city,
							customField05: da?.district,
							customField06: da?.ward,
							customField07: da?.address,
							customField08: "gold",
							customField09: da?.area,
						},
						customFieldLongs: {
							customFieldLong02: da?.play_turn,
						},
					};
				});
				let data_push = element;
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushGoldTurn", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;
				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-turn-gold", "push-data-turn-gold");
				let result = await helpers.base.http_request(params);
				// console.log(result, "result");
				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-turn-gold-response", "push-data-turn-gold-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async userEventPushGoldTurn(data) {
		try {
			await this.setToken();
			if (_.isArray(data)) {
				const element = data.map((da) => {
					return {
						source: "M-Q3JP7-O-OHITB-M",
						sourceId: da?.customer_id,
						condition: "Changed",
						channel: "Online",
						eventCtg: "CampaignBehaviour",
						eventCtg2: "Changed",
						eventCtg3: "Changed",
						eventName: "PushGoldTurn",
						eventAt: moment().format("X") * 1000,
						value: da?.play_turn,
						eventLabels: ["Gold"],
						eventLabel2s: [`Turn: ${da?.play_turn}`],
						eventLabel3s: [],
						customerId: da?.customer_id,
						phone: da?.phone,
						zaloOAId: "",
						zaloUserId: "",
						note: "Active",
						recordStatus: "",
						customFieldTexts: {
							customField01: da?.name,
							customField02: da?.brand,
							customField03: da?.region,
							customField04: da?.city,
							customField05: da?.district,
							customField06: da?.ward,
							customField07: da?.address,
							customField08: "gold",
							customField09: da?.area,
						},
						customFieldLongs: {
							customFieldLong02: da?.play_turn,
						},
					};
				});
				let data_push = element;
				let data_send = {
					objectType: "user-event",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "userEventPushGoldTurn", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "user-event-push-data-gold-turn", "user-event-push-data-gold-turn");
				let result = await helpers.base.http_request(params);

				data_log.result = result;
				helpers.log.writeData(data_log, "user-event-push-data-gold-turn-response", "user-event-push-data-gold-turn-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("userEventPushGoldTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushUser(data) {
		try {
			await this.setToken();
			if (_.isObject(data)) {
				const element = data;
				let data_push = {
					momCode: "M-VQVAU-O-JRYR8-M",
					refId: element?._id.toString(),
					customerId: element?.customer_id,
					phone: element?.phone,
					createdAt: moment(element?.createdAt).format("X"),
					updatedAt: moment(element?.updatedAt).format("X"),
					customFieldTexts: {
						customField01: element?.name,
						customField02: element?.brand,
						customField03: element?.brand_name,
						customField04: element?.region, //6 MN, 5: MB
						customField05: element?.region_name,
						customField06: element?.city,
						customField07: element?.city_name,
						customField08: element?.district,
						customField09: element?.district_name,
						customField10: element?.ward,
						customField11: element?.ward_name,
						customField12: element?.address,
					},
					customFieldLongs: {
						customFieldLong01: element?.status,
					},
					customFieldTimestamps: {
						customFieldTimestamp01: moment(element?.createdAt).format("X"),
						customFieldTimestamp02: moment(element?.updatedAt).format("X"),
					},
				};

				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: [data_push],
				};

				const id_log = await utils.logs.logCDP("create", "eventPushUser", data_push);

				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};

				const data_log = params;
				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-user", "push-data-user");
				let result = await helpers.base.http_request(params);
				// console.log(result, "result");
				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-user-response", "push-data-user-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushLog(data) {
		try {
			await this.setToken();
			if (_.isObject(data)) {
				const element = data;

				let data_push = {
					momCode: "M-ILJOO-O-PU0IY-M",
					refId: element?._id.toString(),

					phone: element?.phone,
					customerId: element?.customer_id,
					createdAt: moment(element?.createdAt).format("X"),
					updatedAt: moment(element?.updatedAt).format("X"),
					customFieldTexts: {
						customField01: element?.user_id,
						customField02: element?.region,
						customField03: element?.city,
						customField04: moment(element?.date).format("X"),
						customField05: element?.item,
						customField06: null,
						customField07: null,
						customField08: null,
						customField09: null,
						customField10: null,
						customField11: null,
						customField12: null,
						customField13: JSON.stringify(element?.wins),
						customField14: element?.type,
					},
					customFieldLongs: {
						customFieldLong01: element?.amount,
						customFieldLong02: null,
						customFieldLong03: element?.period,
						customFieldLong04: element?.status,
					},
					customFieldTimestamps: {
						customFieldTimestamp01: moment(element?.createdAt).format("X"),
						customFieldTimestamp02: moment(element?.updatedAt).format("X"),
					},
					// customFieldListTexts: {
					// 	customFieldList01: element?.wins,
					// 	customFieldList02: element?.list_gifts,
					// },
				};

				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: [data_push],
				};
				const id_log = await utils.logs.logCDP("create", "eventPushLog", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;
				// console.log(params, "params");

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-bet", "push-data-bet");

				let result = await helpers.base.http_request(params);
				// console.log(result, "result");
				this.eventPushWinner(element?._id);
				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-bet-response", "push-data-bet-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushWinner(bet_id) {
		try {
			await this.setToken();
			const winners = await saintGobainModel.findAll("winners", { bet_id: bet_id });

			if (winners && _.isArray(winners)) {
				const element = winners.map((da) => {
					return {
						momCode: "M-ZJVQZ-O-2GMVT-M",
						refId: da?._id.toString(),
						customerId: da?.customer_id,
						phone: da?.phone,

						customFieldTexts: {
							customField01: da?.bet_id,
							customField02: da?.user_id,
							customField03: da?.gift_id,
							customField04: da?.gift_name,
							customField05: da?.gift_thumb,
							customField06: da?.turn_id,

							customField07: da?.region,
							customField08: da?.city,
							customField09: da?.item,
							customField10: da?.type,
							customField11: da?.code,
						},
						customFieldLongs: {
							customFieldLong01: da?.status,
							customFieldLong02: da?.period,
						},
						customFieldTimestamps: {
							customFieldTimestamp01: moment(da?.createdAt).format("X"),
							customFieldTimestamp02: moment(da?.updatedAt).format("X"),
						},
					};
				});
				let data_push = element;
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushWinner", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-winner", "push-data-winner");
				let result = await helpers.base.http_request(params);

				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-winner-response", "push-data-winner-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushTurnRetry(element) {
		try {
			await this.setToken();
			if (element) {
				let data_push = element;
				// console.log(data_push, "data_push");
				// return;
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushTurnUpdate2", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;
				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "retry-push-data-turn", "retry-push-data-turn");

				let result = await helpers.base.http_request(params);

				data_log.result = result;
				helpers.log.writeData(data_log, "retry-push-data-turn-response", "retry-push-data-turn-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushGoldTurnRetry(element) {
		try {
			await this.setToken();
			if (element) {
				let data_push = element;
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushGoldTurnUpdate2", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;
				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "retry-push-data-turn-gold", "retry-push-data-turn-gold");
				let result = await helpers.base.http_request(params);
				// console.log(result, "result");
				data_log.result = result;
				helpers.log.writeData(data_log, "retry-push-data-turn-gold-response", "retry-push-data-turn-gold-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushTurn", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "error");
			return (this.token = "");
		}
	}

	async eventPushWinnerRecall(winner) {
		try {
			await this.setToken();

			if (winner) {
				const element = {
					momCode: "M-ZJVQZ-O-2GMVT-M",
					refId: winner?._id.toString(),
					customerId: winner?.customer_id,
					phone: winner?.phone,

					customFieldTexts: {
						customField01: winner?.bet_id,
						customField02: winner?.user_id,
						customField03: winner?.gift_id,
						customField04: winner?.gift_name,
						customField05: winner?.gift_thumb,
						customField06: winner?.turn_id,

						customField07: winner?.region,
						customField08: winner?.city,
						customField09: winner?.item,
						customField10: winner?.type,
						customField11: winner?.code,
					},
					customFieldLongs: {
						customFieldLong01: winner?.status,
						customFieldLong02: winner?.period,
					},
					customFieldTimestamps: {
						customFieldTimestamp01: moment(winner?.createdAt).format("X"),
						customFieldTimestamp02: moment(winner?.updatedAt).format("X"),
					},
				};
				let data_push = [element];
				let data_send = {
					objectType: "custom-model",
					source: "Adtima",
					entries: data_push,
				};
				const id_log = await utils.logs.logCDP("create", "eventPushWinnerRecall", data_push);
				let params = {
					headers: {
						"Content-type": "application/json",
						token: this.token,
						api_key: this.apiKey,
					},
					url: this.apiUrl,
					method: "POST",
					data: data_send,
				};
				const data_log = params;

				data_log.time = moment().format("YYYY-MM-DD HH:mm:ss");
				helpers.log.writeData(data_log, "push-data-winner-recall", "push-data-winner-recall");
				let result = await helpers.base.http_request(params);
				// let result = {};

				data_log.result = result;
				helpers.log.writeData(data_log, "push-data-winner-recall-response", "push-data-winner-recall-response");
				if (result) {
					utils.logs.logCDPUpdate(id_log, result);
				} else {
					console.log("eventPushWinnerRecall", params);
				}
			}
			return true;
		} catch (error) {
			console.log(error, "eventPushWinnerRecall");
			return (this.token = "");
		}
	}
}

module.exports = ByteTech;
