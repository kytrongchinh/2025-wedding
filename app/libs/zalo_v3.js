class zalo_v3 {
	/** Init token
	 *
	 * @param oaId
	 */
	constructor() {
		this.apiUrlV3 = "https://openapi.zalo.me/v3.0/oa/";
	}

	async sendTransactionMessage(accessToken, data_send_msg, language = "VI") {
		if (appConfig.env === "development") {
			accessToken =
				"4KYVBIh6rYKGHvyX8CNT9H96dIWethzYI5gz71sfd6niQ9iV1uUUPJHseIfjyA526ZEW4M-qvrG-Py0kKfg8V6L9bHGHfPT3LM6tCHJZhqbWRR4-5RptU4DTw34afTH3LLtEHYAUrbTfPE49EEFzG74F-3KXoxvCMZwNI3t-fKPoCBWG7i6yRYqWYZPnfPbp85kC81U1prfmUz4d6ApmGqj3zWa_nT5mJZVr2txAz7OQI_u-RxNCH5ffoXyJiuf1TbEFK1cTo1LHO_H1VvlJFWfzsdDxZy1sCMRlAqgFpY8GKznuHQB-2pnLm5LBfVzG7N_t6Yg4j6D-UBqBDBY-05uZaLqsyeinTt2eE2wPdqLdUhKh2ltyKa4gxLSgx_864MxLI5EonZSyIuL6M9USCWeLWK1cOWEsS3mcqDuc";
		}
		let { zoaid, category, dataElements, dataButtons = [], template_type } = data_send_msg;
		// console.log(zoaid, "zoaid");
		// console.log(category, "category");
		// console.log(dataElements, "dataElements");
		// console.log(dataButtons, "dataButtons");
		dataElements = dataElements.filter((element) => element.content != "");
		dataButtons = dataButtons.map((button) => {
			if (button?.default_action?.type == "url") {
				return {
					title: button?.title,
					image_icon: button?.image_url,
					type: "oa.open.url",
					payload: {
						url: button?.default_action?.value,
					},
				};
			}
			if (button?.default_action?.type == "phone") {
				return {
					title: button?.title,
					image_icon: button?.image_url,
					type: "oa.open.phone",
					payload: {
						phone_code: "1900969674",
					},
				};
			}
		});
		// console.log(dataElements, "dataElements");
		// console.log(dataButtons, "dataButtons");
		try {
			const apiUrl = this.apiUrlV3 + `message/${category}`;
			const data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					attachment: {
						type: "template",
						payload: {
							template_type: template_type,
							language: language,
							elements: dataElements,
							buttons: dataButtons,
						},
					},
				},
			};
			const params = {
				url: apiUrl,
				method: "POST",
				data: data,
				headers: {
					access_token: accessToken,
					"Content-Type": "application/json",
				},
			};

			const result = await helpers.base.http_request(params);
			// console.log(result, "result");
			if (result && result.error == 0) {
				// return { error: 0, data: result.data };
				return result;
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
}

module.exports = new zalo_v3();
