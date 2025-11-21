const URL_ZNS_TEMPLATE = "https://business.openapi.zalo.me/message/template";
const URL_GET_STATUS_ZNS = "https://business.openapi.zalo.me/message/status";

class ZaloApi {
	/** Init token
	 *
	 * @param oaId
	 */
	constructor() {
		this.accessToken = "";
		this.apiUrl = "https://openapi.zalo.me/v2.0/oa/";
		this.apiUrlV3 = "https://openapi.zalo.me/v3.0/oa/";
		this.apiAccessToken = "https://oauth.zaloapp.com/v4/oa/access_token";
		this.appId = appConfig.zalo_app.app_id;
	}

	// set accessToken
	async setAccessToken() {
		try {
			let access_token = await helpers.setting.get_value_setting("oa_access_token");
			// console.log("access_token", access_token);
			if (access_token) {
				this.accessToken = access_token;
				return;
			}

			if (appConfig.env !== "production") {
				clog("Please set oa_access_token");
				return;
			}

			// get access_token by refresh_token
			let refresh_token = await helpers.setting.get_value_setting("oa_refresh_token");
			let params = {
				headers: {
					secret_key: appConfig.zalo_app.secret_key,
					"Content-type": "application/x-www-form-urlencoded",
				},
				url: this.apiAccessToken,
				method: "POST",
				data: {
					refresh_token: refresh_token,
					app_id: this.appId,
					grant_type: "refresh_token",
				},
			};
			let result = await helpers.base.http_request(params);
			if (result) {
				if (typeof result.access_token != "undefined" && typeof result.refresh_token != "undefined") {
					this.accessToken = result.access_token;
					libs.redis.set("setting_oa_access_token", result.access_token, 3600 * 24);
					await helpers.setting.set_value_setting("oa_refresh_token", result.refresh_token, 3600 * 24 * 3 * 28);
				} else {
					console.log("error_refresh_token", result);
				}
			} else {
				console.log("error_refresh_token", params);
			}
		} catch (error) {
			console.log(error, "error");
			return (this.accessToken = "");
		}
	}

	/** Get profile user by uid or phone
	 *
	 * @param uid | phone
	 * @returns object | null
	 */
	async getProfileUserV2(uid) {
		await this.setAccessToken();
		try {
			var action = "getprofile";
			var data = { user_id: uid };

			data = JSON.stringify(data);
			var query_string = "data=" + encodeURIComponent(data);
			var apiUrl = this.apiUrl + action + "?" + query_string;

			var params = {
				url: apiUrl,
				method: "GET",
				headers: {
					access_token: this.accessToken,
					"Content-Type": "application/json",
				},
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	async getProfileUser(uid) {
		await this.setAccessToken();
		try {
			var action = "user/detail";
			var data = { user_id: uid };

			data = JSON.stringify(data);
			var query_string = "data=" + encodeURIComponent(data);
			var apiUrl = this.apiUrlV3 + action + "?" + query_string;

			var params = {
				url: apiUrl,
				method: "GET",
				headers: {
					access_token: this.accessToken,
					"Content-Type": "application/json",
				},
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send text message to UID
	 * @param zoaid: zalo id by OA or user ID
	 * @param message
	 * @returns object | false
	 */
	async sendTextMessage(zoaid, message) {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					text: message,
				},
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, data: e.message };
		}
	}

	/** Send text and image by url message to UID
	 * @param zoaid: zalo id by OA or user ID
	 * @param message | null
	 * @param imageURL: url of image
	 * @returns object | false
	 */
	async sendImageMessageByURL(zoaid, imageURL, message = "") {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {};
			if (imageURL) {
				data = {
					recipient: {
						user_id: zoaid,
					},
					message: {
						text: message,
						attachment: {
							type: "template",
							payload: {
								template_type: "media",
								elements: [
									{
										media_type: "image",
										url: imageURL,
									},
								],
							},
						},
					},
				};
			}
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send text and image by ID message to UID
	 * @param zoaid: zalo id by OA or user ID
	 * @param message | null
	 * @param imageID: ID of image when upload
	 * @returns object | null
	 */
	async sendImageMessageByID(zoaid, imageID, message = "") {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					text: message,
					attachment: {
						type: "template",
						payload: {
							template_type: "media",
							elements: [
								{
									media_type: "image",
									attachment_id: imageID,
								},
							],
						},
					},
				},
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send GIF image by ID message to UID
	 * @param zoaid: zalo id by OA or user ID
	 * @param width
	 * @param height
	 * @param imageID: ID of image when upload
	 * @returns object | null
	 */
	async sendGIFImageMessageByID(zoaid, imageID, width, height) {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					attachment: {
						type: "template",
						payload: {
							template_type: "media",
							elements: [
								{
									media_type: "gif",
									attachment_id: imageID,
									width: width,
									height: height,
								},
							],
						},
					},
				},
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send text and file message to UID
	 * @param zoaid: zalo id by OA or user ID
	 * @param message | null
	 * @param fileToken: token of file when upload
	 * @returns object | null
	 */
	async sendFileMessage(zoaid, fileToken, message = "") {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					text: message,
					attachment: {
						type: "file",
						payload: {
							token: fileToken,
						},
					},
				},
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send List message to UID
     * @param zoaid: zalo id by OA or user ID
     * @param dataLinks: array contain element objects
     * element object include:{
            "title": "your title",
            "subtitle": "your subtitle",
            "image_url": "your image_url",
            "default_action": {
                "type": "oa.open.url",
                "url": "https://developers.zalo.me/"
            }
        }
     * @returns object | null
     */
	async sendListMessage(zoaid, dataLinks) {
		await this.setAccessToken();
		try {
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					attachment: {
						type: "template",
						payload: {
							template_type: "list",
							elements: dataLinks,
						},
					},
				},
			};

			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send Buttons message to UID
     * @param zoaid: zalo id by OA or user ID
     * @param message
     * @param dataButtons: array contain button objects
     * button object include:{
            "title": "your title",
            "type": "action type execute when user click: oa.open.url | oa.query.show | oa.query.hide | oa.open.sms | oa.open.phone",
            "payload": "data of action",
        }

     * @returns object | null
     */
	async sendButtonMessage(zoaid, message, dataButtons) {
		await this.setAccessToken();
		try {
			// array exists and is not empty
			var action = "message";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				recipient: {
					user_id: zoaid,
				},
				message: {
					text: message,
					attachment: {
						type: "template",
						payload: {
							template_type: "",
							buttons: dataButtons,
						},
					},
				},
			};

			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Upload image
	 * @param pathImage: Path to the file which will be uploaded
	 * @param typeImage: image|gif
	 * @returns imageID | false
	 */
	async uploadImage(pathImage, typeImage) {
		await this.setAccessToken();
		try {
			var action = "upload/" + typeImage;
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			const fs = require("fs");
			var imageData = fs.readFileSync(pathImage);
			if (!imageData) {
				console.log("cant read img");
				return false;
			}
			var params = {};
			if (typeImage == "gif") {
				params = {
					url: apiUrl,
					method: "POST",
					contentType: "image/gif",
					data: imageData,
				};
			} else if (typeImage == "image") {
				params = {
					url: apiUrl,
					method: "POST",
					contentType: "image/jpeg",
					data: imageData,
				};
			}

			var result = await helpers.base.http_file_request(params);
			if (result && result.error == 0) {
				return result.data.attachment_id;
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Upload file PDF
	 * @param pathFile: Path to the file which will be uploaded
	 * @returns token of file | null
	 */
	async uploadFile(pathFile) {
		await this.setAccessToken();
		try {
			var action = "upload/file";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			const fs = require("fs");
			var fileData = fs.readFileSync(pathFile);
			if (!fileData) {
				return false;
			}
			var params = {
				url: apiUrl,
				method: "POST",
				contentType: "application/pdf",
				data: fileData,
			};
			var result = await helpers.base.http_file_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data.token };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Get oa info
	 *
	 * @returns object | null
	 */
	async getOAInfo() {
		await this.setAccessToken();
		try {
			var action = "getoa";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};

			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Get followers
	 *
	 * @param offset
	 * @param count
	 * @returns object | null
	 */
	async getFollowers(offset, count) {
		await this.setAccessToken();
		try {
			var action = "getfollowers";
			var data = { offset: offset, count: count };
			data = JSON.stringify(data);

			var query_string = "access_token=" + encodeURI(this.accessToken) + "&data=" + encodeURIComponent(data);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};

			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Get list recent chat with OA
	 *
	 * @param offset
	 * @param count
	 * @returns object | null
	 */
	async getRecentChat(offset, count) {
		await this.setAccessToken();
		try {
			var action = "listrecentchat";
			var data = { offset: offset, count: count };
			data = JSON.stringify(data);

			var query_string = "access_token=" + encodeURI(this.accessToken) + "&data=" + encodeURIComponent(data);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};

			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
	/** Get list recent chat of user with OA
	 * @param uid
	 * @param offset
	 * @param count
	 * @returns object | null
	 */
	async getConversation(uid, offset, count) {
		await this.setAccessToken();
		try {
			var action = "conversation";
			var data = { user_id: uid, offset: 0, count: 5 };
			data = JSON.stringify(data);
			var query_string = "access_token=" + encodeURI(this.accessToken) + "&data=" + encodeURIComponent(data);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
	/** Get tags
	 *
	 * @returns object | null
	 */
	async getTags() {
		await this.setAccessToken();
		try {
			var action = "tag/gettagsofoa";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
	/** Tag Follower
	 * @param zuid: zalo uid
	 * @param tagName
	 * @returns object | null
	 */
	async tagFollower(zuid, tagName) {
		await this.setAccessToken();
		try {
			var action = "tag/tagfollower";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				user_id: zuid,
				tag_name: tagName,
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.message };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
	/** Remove tag of follower
	 * @param zuid: zalo uid
	 * @param tagName
	 * @returns object | null
	 */
	async removeTagOfFollower(zuid, tagName) {
		await this.setAccessToken();
		try {
			var action = "tag/rmfollowerfromtag";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				user_id: zuid,
				tag_name: tagName,
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.message };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}
	/** Remove tag
	 * @param tagName
	 * @returns object | null
	 */
	async removeTag(tagName) {
		await this.setAccessToken();
		try {
			var action = "tag/rmtag";
			var query_string = "access_token=" + encodeURI(this.accessToken);
			var apiUrl = this.apiUrl + action + "?" + query_string;
			var data = {
				tag_name: tagName,
			};
			var params = {
				url: apiUrl,
				method: "POST",
				data: data,
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.message };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	/** Send sendZNSMessage
	 * @param phone: phone user
	 * @param template_id : id template create on ZBA
	 * @param template_data : content template create on ZBA
	 * @returns object | false
	 */
	async sendZNSMessage(phone, template_id, template_data, tracking_id, dev = null) {
		try {
			await this.setAccessToken();
			//const apiUrl = URL_ZNS_TEMPLATE + `?access_token=${this.accessToken}`;
			const apiUrl = URL_ZNS_TEMPLATE;
			const data = {
				phone,
				template_id,
				template_data,
				tracking_id,
			};
			//set mode development
			if (dev || appConfig.env == "develop") data.mode = "development";

			var params = {
				baseURL: "https://business.openapi.zalo.me",
				url: apiUrl,
				headers: {
					access_token: `${this.accessToken}`,
				},
				data: data,
			};
			clog(params);
			const result = await helpers.base.http_post_axios(params);
			return result;
		} catch (e) {
			console.log("sendZNSMessage", e);
			return { error: -999, message: e.message };
		}
	}

	/** Get getStatusZNS
	 * @param phone: phone user
	 * @param message_id : id message need to check status
	 * @returns object | null
	 */
	async getStatusZNS(phone, message_id) {
		try {
			await this.setAccessToken();
			var query_string = "access_token=" + encodeURI(this.accessToken) + "&message_id=" + encodeURIComponent(message_id) + "&phone=" + encodeURIComponent(phone);

			var apiUrl = URL_GET_STATUS_ZNS + "?" + query_string;
			var params = {
				url: apiUrl,
				method: "GET",
			};
			var result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return { error: 0, data: result.data };
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e.message };
		}
	}

	async getProfileUserByAccessToken(accessToken) {
		try {
			const fields = "id,name,gender,picture,birthday,userIdByOA";
			const apiUrl = "https://graph.zalo.me/v2.0/me";
			const query_string = "?fields=" + fields;
			const url = apiUrl + query_string;
			const options = {
				headers: {
					access_token: accessToken,
				},
				url: url,
				method: "GET",
			};
			return await helpers.base.http_request(options);
		} catch (e) {
			console.log("getZaloProfileUserByAccessToken", e);
			return { error: 1, error_name: e.message };
		}
	}

	async sendTransactionMessage(data_send_msg, language = "VI") {
		await this.setAccessToken();
		let { zoaid, category, dataElements, dataButtons = [], template_type } = data_send_msg;
		console.log(zoaid, "zoaid");
		console.log(category, "category");
		console.log(dataElements, "dataElements");
		console.log(dataButtons, "dataButtons");
		dataElements = dataElements.filter((element) => element.content != "");

		// console.log(dataElements, "dataElements");
		// console.log(dataButtons, "dataButtons");
		try {
			const apiUrl = "https://openapi.zalo.me/v3.0/oa/" + `message/${category}`;
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
					access_token: `${this.accessToken}`,
					"Content-Type": "application/json",
				},
			};

			const result = await helpers.base.http_request(params);
			if (result && result.error == 0) {
				return result;
			} else {
				return result;
			}
		} catch (e) {
			return { error: -1, message: e };
		}
	}
}

module.exports = new ZaloApi();
