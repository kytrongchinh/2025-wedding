// const request = require("request");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const appConfig = require("../configs");

class Gapit {
	/**
	 *
	 * @param {Object} configs
	 */
	constructor() {
		this.urlTopup = "http://topup.gapit.com.vn/topupservice/Service.asmx?wsdl";
		this.user = "TOPUPMILOAWO";
		this.pass = "81hZC4DUKQiM";
		this.serviceID = "TOPUPMILOAWO";
	}

	async sendTopUp(request_id, phone, money = 1000, callback) {
		try {
			const soap = require("soap");

			console.log("top_up_card", appConfig?.env);
			if (appConfig?.env !== "production") {
				const today = helpers.date.getToday();
				console.log(`today==>`, today);
				if (today > "2024-12-25") {
					return { TopupResult: "1" };
				}
			}

			const url = this.urlTopup;

			const args = {
				requestid: request_id,
				msisdn_0: phone,
				money: money,
				parameters: "pin^serial^menhgia",
				serviceID: this.serviceID,
				user: this.user,
				pass: this.pass,
			};
			const log_req = {
				requestid: request_id,
				money: money,
			};

			const axiosOptions = {
				baseURL: url,
				httpsAgent: "undefined",
				timeout: 5000,
				// connection: "keep-alive",
			};
			if (appConfig.http_proxy != "") {
				axiosOptions.httpsAgent = new HttpsProxyAgent(appConfig.http_proxy);
			}

			const axiosClient = axios.create(axiosOptions);

			const soapClientOptions = {
				request: axiosClient,
			};

			try {
				return new Promise(function (resolve, reject) {
					soap.createClient(url, soapClientOptions, function (err, client) {
						if (err) {
							console.log(err);
							reject(err);
						} else {
							// console.log(client);
							helpers.log.debug(JSON.stringify(log_req), "log_request", "gapit_req_log.txt");
							client.Service.ServiceSoap.Topup(
								args,
								function (err, result) {
									if (err) {
										console.log(err, "error2");
										helpers.log.debug(JSON.stringify(err), "log_topup", "gapit_res_log.txt");
										reject(err);
									} else {
										console.log("result", result);
										resolve(result);
										helpers.log.debug(result, "log_topup", "gapit_res_log.txt");
									}
									return;
								},
								{
									timeout: 5000,
								}
							);
						}
					});
				});
			} catch (error) {
				console.log(error, "error1");
				helpers.log.debug(JSON.stringify(error), "log_send_mt", "gapit_log.txt");
				return null;
			}
		} catch (error) {
			console.log(error, "error");
			return null;
		}
	}

	async checkRequestTopup(request_id, callback) {
		try {
			const soap = require("soap");
			if (appConfig?.env == "develop") {
				return { CheckRequestResult: "1" };
			}
			const url = this.urlTopup; //urll api send topup của Gapit

			const args = {
				requestid: request_id,
				user: this.user,
				pass: this.pass,
			};
			let log_req = {
				requestid: request_id,
			};
			const axiosOptions = {
				baseURL: url,
				httpsAgent: "undefined",
				timeout: 5000,
				// connection: "keep-alive",
			};
			if (appConfig.http_proxy != "") {
				axiosOptions.httpsAgent = new HttpsProxyAgent(appConfig.http_proxy);
			}

			const axiosClient = axios.create(axiosOptions);

			const soapClientOptions = {
				request: axiosClient,
			};

			try {
				return new Promise(function (resolve, reject) {
					soap.createClient(url, soapClientOptions, function (err, client) {
						if (err) {
							console.log(err);
							reject(err);
						} else {
							// console.log('client', client);
							helpers.log.debug(JSON.stringify(log_req), "log_request_check", "gapit_req_log.txt");
							client.Service.ServiceSoap.CheckRequest(
								args,
								function (err, result) {
									if (err) {
										helpers.log.debug(JSON.stringify(err), "log_request_check", "gapit_res_log.txt");
										reject(err);
									} else {
										console.log("result", result);
										resolve(result);

										helpers.log.debug(result, "log_request_check", "gapit_res_log.txt");
										// callback(result);
									}
								},
								{
									timeout: 5000,
								}
							);
						}
					});
				});
			} catch (error) {
				helpers.log.debug(JSON.stringify(error), "log_send_mt", "gapit_log.txt");
				return null;
			}
		} catch (error) {
			console.log(error, "error");
			return error;
		}
	}

	getStatusCheckTopUp(status) {
		try {
			switch (status) {
				case 0:
					return "Topup request send success to GAPIT";
				case -1:
					return "Err unknow";
				case 1:
					return "Topup successful for end user";
				case 2:
					return "Get pincode and send to end user success";
				case -13:
					return "Request is pending";
				case 7:
					return "Requested not exists";
				case 400:
					return "Topup or getping false";
				case -4:
					return "PhoneNumber In BlackList";

				default:
					return "Unknown";
			}
		} catch (error) {
			return "Unknown";
		}
	}
	getStatusTopUp(status) {
		try {
			switch (status) {
				case 0:
					return "Topup request send success to GAPIT";
				case 1:
					return "Error login";
				case 2:
					return "Account has been locked";
				case 3:
					return "Out of money in acount";
				case 4:
					return "Denominations don't support";
				case 5:
					return "invalid mobile";
				case 6:
					return "requestid already exists";
				case 7:
					return "Requested not exists";
				case -1:
					return "Err unknow";

				default:
					return "Unknown";
			}
		} catch (error) {
			return "Unknown";
		}
	}
}

module.exports = Gapit;
