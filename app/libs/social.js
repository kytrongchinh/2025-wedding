const querystring = require("querystring");
const { google } = require("googleapis");

const { app_id: FB_APP_ID, secret_key: FB_SECRET_KEY, redirect_uri: FB_REDIRECT_URI, social_api: FB_SOCIAL_API, graph_api: FB_GRAPH_API } = appConfig.fb_app;

const { app_id: ZALO_APP_ID, secret_key: ZALO_SECRET_KEY, redirect_uri: ZALO_REDIRECT_URI, social_api: ZALO_SOCIAL_API, graph_api: ZALO_GRAPH_API } = appConfig.zalo_app;

const { client_id: GG_CLIENT_ID, secret_key: GG_SECRET_KEY, redirect_uri: GG_REDIRECT_URI, social_api: GG_SOCIAL_API, graph_api: GG_GRAPH_API } = appConfig.gg_app;

const social = {};

social.isLogin = (req) => {
	try {
		return req.session.userLogin ? true : false;
	} catch (e) {
		console.log("isLogin", e);
		return false;
	}
};

social.logout = (req) => {
	try {
		req.session.userLogin = null;
	} catch (e) {
		console.log("logout", e);
	}
};

social.setSessionUser = (req, user) => {
	try {
		req.session.userLogin = {
			id: user._id || "",
			zid_by_oa: user.zid_by_oa || "",
			zalo_name: user.zalo_name || "",
		};
		return true;
	} catch (e) {
		console.log("set_session", e);
		return false;
	}
};

social.getSessionUser = (req) => {
	try {
		return req.session.userLogin;
	} catch (e) {
		return false;
	}
};

social.getZaloOAuthUrl = (state = "") => {
	try {
		return `https://oauth.zaloapp.com/v4/permission?app_id=${ZALO_APP_ID}&redirect_uri=${ZALO_REDIRECT_URI}&state=${state}`;
	} catch (error) {
		console.log(error);
		return "";
	}
};

social.getZaloAccessTokenByOauthCode = async (oauth_code) => {
	try {
		let options = {
			url: "https://oauth.zaloapp.com/v4/access_token",
			method: "POST",
			headers: {
				secret_key: ZALO_SECRET_KEY,
				"Content-type": "application/x-www-form-urlencoded",
			},
			data: {
				code: oauth_code,
				app_id: ZALO_APP_ID,
				grant_type: "authorization_code",
			},
		};
		return await helpers.base.http_request(options);
	} catch (e) {
		console.log("getZaloAccessTokenByOauthCode", e);
		return { error: 1, error_name: e.message };
	}
};

social.getZaloAccessTokenByRefreshToken = async (zalo_refresh_token) => {
	try {
		let options = {
			url: "https://oauth.zaloapp.com/v4/access_token",
			method: "POST",
			headers: {
				secret_key: ZALO_SECRET_KEY,
				"Content-type": "application/x-www-form-urlencoded",
			},
			data: {
				refresh_token: zalo_refresh_token,
				app_id: ZALO_APP_ID,
				grant_type: "refresh_token",
			},
		};
		return await helpers.base.http_request(options);
	} catch (e) {
		console.log("getZaloAccessTokenByRefreshToken", e);
		return { error: 1, error_name: e.message };
	}
};

social.getZaloProfileUserByAccessToken = async function (access_token) {
	try {
		let fields = "id,name,gender,picture,birthday,userIdByOA";
		let apiUrl = "https://graph.zalo.me/v2.0/me";
		let query_string = "?access_token=" + access_token + "&fields=" + fields;
		let url = apiUrl + query_string;

		let options = {
			headers: {
				access_token: access_token,
			},
			url: url,
			method: "GET",
		};
		return await helpers.base.http_request(options);
	} catch (e) {
		console.log("getZaloProfileUserByAccessToken", e);
		return { error: 1, error_name: e.message };
	}
};

social.getFacebookOAuthUrl = (state = "") => {
	try {
		let url = `${FB_SOCIAL_API}dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&state=${state}`;
		return url;
	} catch (error) {
		console.log(error);
		return null;
	}
};

social.getFacebookUserAccessToken = async (code = "") => {
	try {
		let url = `${FB_GRAPH_API}oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&client_secret=${FB_SECRET_KEY}&code=${code}`;
		let params = {
			url: url,
			method: "GET",
		};
		//console.log('params',params)
		let result = await helpers.base.http_request(params);
		//console.log('getFacebookUserAccessToken',result)
		return typeof result === "object" ? result : JSON.parse(result);
	} catch (error) {
		console.log(error);
		return null;
	}
};

social.getFacebookProfileUserByAccessToken = async (psid, access_token = "") => {
	try {
		let fields = "id,name,email";
		let url = `${FB_GRAPH_API}${psid}?access_token=${querystring.escape(access_token)}&fields=${fields}`;
		//console.log('getFacebookProfileUserByAccessToken_url',url)
		let params = {
			url: url,
			method: "GET",
		};
		let result = await helpers.base.http_request(params);
		//console.log('getFacebookProfileUserByAccessToken_result',result)
		return typeof result === "object" ? result : JSON.parse(result);
	} catch (error) {
		console.log("err_", error);
		return null;
	}
};

social.getFacebookUserAvatar = (psid) => {
	return `https://graph.facebook.com/${psid}/picture?type=normal`;
};

const HttpsProxyAgent = require("https-proxy-agent");
if (appConfig.env == "pro") {
	google.options({
		agent: new HttpsProxyAgent("https://10.30.46.99:3128"),
	});
}

const oauth2Client = new google.auth.OAuth2(GG_CLIENT_ID, GG_SECRET_KEY, GG_REDIRECT_URI);

social.getGoogleOAuthUrl = (state = "") => {
	try {
		const scopes = [
			"https://www.googleapis.com/auth/userinfo.profile", // get user info
		];
		// Generate a url that asks permissions for the Drive activity scope
		const authorizationUrl = oauth2Client.generateAuthUrl({
			// 'online' (default) or 'offline' (gets refresh_token)
			access_type: "offline",
			/** Pass in the scopes array defined above.
			 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
			scope: scopes,
			state: state,
			// Enable incremental authorization. Recommended as a best practice.
			include_granted_scopes: true,
		});
		return authorizationUrl;
		//https://accounts.google.com/o/oauth2/v2/auth
		//let url = `${GG_SOCIAL_API}?client_id=${GG_CLIENT_ID}&redirect_uri=${GG_REDIRECT_URI}&scope=https://www.googleapis.com/auth/drive.metadata.readonly&response_type=token&state=${state}`;
		//return url;
	} catch (e) {
		console.log("getGoogleOAuthUrl", e);
		return null;
	}
};

social.getGoogleAccessTokenByOauthCode = async (code) => {
	try {
		//console.log('getGoogleAccessTokenByOauthCode',code);
		let options = {
			url: "https://oauth2.googleapis.com/token",
			method: "POST",
			headers: {
				"Content-type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			data: {
				code: code,
				client_id: GG_CLIENT_ID,
				client_secret: GG_SECRET_KEY,
				redirect_uri: GG_REDIRECT_URI,
				grant_type: "authorization_code",
			},
		};
		let tokens = await helpers.base.http_request(options);
		return tokens;
	} catch (e) {
		console.log("getGoogleAccessTokenByOauthCode", e);
		return null;
	}
};

social.getGoogleProfileUser = async (access_token) => {
	try {
		//let { tokens } = await oauth2Client.getToken(code);
		//console.log('getGoogleProfileUser_tokens',tokens);
		//oauth2Client.setCredentials(tokens);
		oauth2Client.setCredentials({ access_token: access_token });
		let oauth2 = google.oauth2({
			auth: oauth2Client,
			version: "v2",
		});
		let { data } = await oauth2.userinfo.get(); // get user info
		return data;
	} catch (e) {
		console.log("getGoogleProfileUser_error", e);
		return null;
	}
};

module.exports = social;
