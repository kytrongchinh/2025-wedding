/** Loading configs by environment (defaul develop)
 */
const env = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" ? process.env.NODE_ENV : "develop";
const dotenv = require("dotenv");

//Get configs in environment file
let envConfigs = dotenv.config({ path: `.env.${env}` }).parsed;
if (!envConfigs || Object.keys(envConfigs).length <= 0) {
	console.log(`\x1b[31m[ERROR]\x1b[0m`, `Missing params envConfigs`);
	process.exit(1);
}

console.log(env, "env");

//Assign to appConfig
const appConfig = {
	campaignName: `${envConfigs.CAMPAIGNNAME}-${envConfigs.ENV}`,
	env: envConfigs.ENV,
	port: envConfigs.PORT,
	baseUrl: envConfigs.BASE_URL,
	prefix: envConfigs.PREFIX,
	staticUrl: envConfigs.STATIC_URL,
	grid_limit: 20,
	export_limit: 500,
	http_proxy: envConfigs.HTTP_PROXY,
	perm_default: ["view", "detail", "add", "edit", "delete", "import", "export", "report"],
	adminRouter: "admin",
	whiteListDomain: [envConfigs.BASE_URL],
	csrfIgnore: [`${envConfigs.PREFIX}/api/zalo_service/receive_notify`], // /<module>/<route>/<method>
	sanitizersIgnore: [`import`],
	//Content Security Policy
	csp: {
		"default-src": "'self' *.zdn.vn *.zing.vn",
		"script-src":
			"'self' 'unsafe-inline' 'unsafe-eval' *.zdn.vn *.zalo.me *.google.com *.gstatic.com cdn.jsdelivr.net adminlte.io *.zsl.zdn.vn *.googletagmanager.com connect.facebook.net",
		"style-src": "'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com *.jsdelivr.net adminlte.io *.cloudflare.com *.zsl.zdn.vn *.zdn.vn",
		"connect-src": "'self' *.zdn.vn *.zing.vn *.zalo.me *.google-analytics.com *.facebook.com",
		"img-src": "'self' *.zdn.vn data: *.zingcdn.me *.zing.vn *.zadn.vn *.zalo.me *.zsl.zdn.vn opencollective.com",
		"font-src": "'self' *.zdn.vn 'unsafe-inline' *.googleapis.com *.gstatic.com data: *.zing.vn",
		"frame-src": "'self' *.zdn.vn *.google.com *.zing.vn *.zalo.me",
		"frame-ancestors": "'self' *.zdn.vn *.zing.vn",
		"object-src": "'self' *.zdn.vn *.zing.vn",
		"media-src": "'self' *.zdn.vn *.zing.vn",
	},
	cors: {
		origin: function (origin, callback) {
			//clog(typeof origin,origin)
			if (appConfig.whiteListDomain.includes(origin) || !origin || origin == "null") {
				//allow
				callback(null, true);
			} else if (!appConfig.whiteListDomain.includes(origin)) {
				//reject
				return callback(new Error(`Not allowed by CORS ${origin}`));
			}
		},
		methods: "POST",
		optionsSuccessStatus: 200,
		preflightContinue: false,
		credentials: true,
		exposedHeaders: ["Retry-After"],
	},
	redis: {
		host: envConfigs.REDIS_HOST,
		port: envConfigs.REDIS_PORT,
		username: envConfigs.REDIS_USER,
		password: envConfigs.REDIS_PASS,
		prefix: envConfigs.REDIS_PREFIX,
		ttl: envConfigs.REDIS_TTL,
		db: envConfigs.REDIS_DB,
		options: {},
	},
	secret: {
		session: envConfigs.SECRET_SESSION,
		session_name: envConfigs.SECRET_SESSION_NAME,
		password: envConfigs.SECRET_PASSWORD,
		token_name: envConfigs.SECRET_TOKEN_NAME,
		file: envConfigs.SECRET_FILE,
	},
	captcha: {
		textLength: 5,
		decoy: false,
		backgroundColor: "rgba(255,255,255, 0.8)",
	},
	recaptcha: {
		site_key: "6Lff4t4UAAAAALUNJRLWEZceX4V_6m85BFwgf00b",
		secret_key: "6Lff4t4UAAAAAGMaiOB8R0mdpRmqqoCIdOmbcmbl",
	},
	rateLimiter: {
		windowMs: 1 * 60 * 1000, // 1 minutes
		max: 2000,
		standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: true, // Disable the `X-RateLimit-*` headers,
		// xForwardedForHeader: false,
	},
	helmet: {
		contentSecurityPolicy: false,
		hidePoweredBy: true,
		xssFilter: true,
		crossOriginEmbedderPolicy: false,
		// crossOriginResourcePolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
	},
	zalo_oa: {
		id: envConfigs.ZALO_OA_ID,
		url: envConfigs.ZALO_OA_URL,
		secret_key: envConfigs.ZALO_OA_SECRET_KEY,
	},
	zalo_app: {
		app_id: envConfigs.ZALO_APP_ID,
		secret_key: envConfigs.ZALO_APP_SECRET_KEY,
		social_api: envConfigs.ZALO_APP_SOCIAL_API,
		secret_key_oa: envConfigs.ZALO_APP_SECRET_KEY_OA,
		redirect_uri: `${envConfigs.BASE_URL}/social/login/zalo`,
	},
	fb_app: {
		app_id: "442392342879730",
		secret_key: "dafa60593c3fe24e5d7bc0bba6927135",
		social_api: "https://www.facebook.com/v13.0/",
		graph_api: "https://graph.facebook.com/v9.0/",
		redirect_uri: `${envConfigs.BASE_URL}/social/login/facebook`,
	},
	//gg_app: {
		
	//},
	login: {
		incorrect: 10, //blocking after 10 times invalid
		block_time: 3600000, //1 hour
	},
	file: {
		thumbnail_maximum: 1048576 * 5, //5MB
		thumbnail_mimetype: ["image/png", "image/jpg", "image/jpeg"],
		maximum_photo: 1048576 * 10, //10MB
	},
	VTDD: {
		USERNAME: envConfigs.GAPIT_USERNAME,
		PASSWORD: envConfigs.GAPIT_PASSWORD,
		TELCO: {
			Viettel: "VTL",
			Mobifone: "VMS",
			Vinaphone: "VNP",
			Vietnamobile: "VNB",
			Gmobile: "GTEL",
		},
	},
	GAPIT: {
		CPID: envConfigs.GAPIT_CPID,
		USERNAME: envConfigs.GAPIT_USERNAME,
		PASSWORD: envConfigs.GAPIT_PASSWORD,
		TELCO: {
			Viettel: "VTT",
			Vinaphone: "VNP",
			Mobifone: "VMS",
			Vietnamobile: "VNM",
			Beeline: "BEE",
		},
	},
	ACTIVE_LOG: {
		SQL: true,
		DEBUG: true,
		MON: true,
		HTTP: true,
	},
	AUTHENTICATION: {
		ACCESS_TOKEN_SECRET: envConfigs.ACCESS_TOKEN_SECRET,
		REFRESH_TOKEN_SECRET: envConfigs.REFRESH_TOKEN_SECRET,
	},

	BYTETECH: {
		USERNAME: envConfigs.BYTETECH_USERNAME,
		API_KEY: envConfigs.BYTETECH_API_KEY,
		CDP_GKEY: envConfigs.BYTETECH_CDP_GKEY,
	},

	JWT: {
		PRIVATE_KEY: envConfigs.JWT_PRIVATE_KEY,
		EXPIRED_TIME: envConfigs.JWT_EXPIRED_TIME,
	},
	MINIAPP_TOKEN_VERIFY: envConfigs.MINIAPP_TOKEN_VERIFY,
};

//clog('appConfig',appConfig);

//let merged = { ...envConfigs, ...appConfig }
//console.log('merged',merged);
//process.exit(1);
module.exports = appConfig;
