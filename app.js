/** Custom console.log
 * l:label
 * Example: clog(<variable>) || clog(<label>,<variable>)
 */
const onClog = true;
const showLineNumber = true;
const showTime = false;
global.clog = function () {
	if (!onClog) return;
	if (showLineNumber || showTime) {
		try {
			let str = "";
			if (showTime) {
				let d = new Date();
				d.setTime(d.getTime() + 7 * 3600 * 1000);
				str += `\x1b[33m[${d.toISOString().replace("T", " ").split(".").shift()}]\x1b[0m`;
			}
			if (showLineNumber) {
				let e = new Error();
				let frame = e.stack.split("\n")[2];
				let position = frame.split(" ").pop().replace(__dirname, "");
				str += `\x1b[45mat ${position}\x1b[0m`;
			}
			console.log(str);
		} catch (e) {
			console.log(e);
		}
	}

	if (arguments.length == 1) return console.log(arguments[0]);
	if (arguments.length == 2) return console.log(`\x1b[36m${arguments[0]}\x1b[0m`, arguments[1]);
};

/** Custom typeof
 *
 * @param {*} data
 * @returns string | object,null,array,date,set,map,number,NaN,boolean,undefined,function,bigint,symbol
 */
global.ctypeof = function (data) {
	const t = typeof data;
	if (t === "object") {
		return data === null ? "null" : data instanceof Array ? "array" : data instanceof Date ? "date" : data instanceof Set ? "set" : data instanceof Map ? "map" : t;
	} else if (t === "number") {
		return isNaN(data) ? "NaN" : "number";
	}
	return t;
};

const express = require("express");
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const csrf = require("csrf");

const env = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" ? process.env.NODE_ENV : "develop"; //default

/*** Load config variable***/
global.appConfig = require("./app/configs");

global._basepath = __dirname + "/";
global._baseUrl = appConfig.prefix == "" ? appConfig.baseUrl + "/" : appConfig.baseUrl + appConfig.prefix + "/";
global._staticUrl = appConfig.staticUrl ? appConfig.staticUrl + "/" : _baseUrl;
global._adminUrl = _baseUrl + "admin";
global._versionCache = new Date().getTime();

//load all library and helpers
global.helpers = require("./app/helpers");
global.libs = require("./app/libs");
global.utils = require("./app/utils");

const app = express();
// app.use(function (req, res, next) {
// 	res.setHeader("X-Powered-By", "None");
// 	res.setHeader("X-XSS-Protection", 0);
// 	res.setHeader("Content-Security-Policy", helpers.base.getCSP());
// 	return next();
// });

const cors = require("cors");

const allowlist = [
	"http://localhost:3035",
	"http://localhost:4036",
	"http://localhost:3035",
	"https://thiephong.online",
	"https://www.googletagmanager.com",
	"https://zalo.me",
	"https://h5.zadn.vn",
	"https://h5.zdn.vn",
	"zbrowser://h5.zdn.vn",
	"code@zbrowser://h5.zdn.vn",
	"c@https://h5.zadn.vn",
	"u@https://h5.zadn.vn",
	"p@https://h5.zadn.vn",
	"value@https://h5.zadn.vn",
	"@https://h5.zadn.vn",
];

const corsOptionsDelegate = (req, callback) => {
	let corsOptions;
	// console.log(req.header("Origin"), "<<<<<<==Origin");
	let isDomainAllowed = allowlist.indexOf(req.header("Origin")) !== -1;

	if (isDomainAllowed) {
		corsOptions = {
			origin: true,
			methods: "GET, POST", // Allow only GET method
			// allowedHeaders: "X-Requested-With, Content-Type, Authorization", // Specify allowed headers
			optionsSuccessStatus: 200, // Success status for OPTIONS preflight requests
			preflightContinue: false, // Do not continue after preflight
			credentials: true, // Allow credentials
			exposedHeaders: ["Retry-After"], // Expose Retry-After header
		};
	} else {
		corsOptions = { origin: false };
	}
	callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));

app.use(helmet(appConfig.helmet));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

if (env !== "develop") {
	app.set("trust proxy", 1);
	// app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
}

const redisStore = require("connect-redis").default;

const session_config = {
	name: appConfig.secret.session_name,
	secret: appConfig.secret.session,
	resave: false,
	saveUninitialized: true,
	proxy: true,
	cookie: {
		path: "/",
		sameSite: "strict",
		secure: true,
		maxAge: 3600000, //60 minutes
	},
	store: new redisStore({ client: libs.redis.client }),
};

if (env === "dev" || env === "develop") {
	session_config.proxy = false;
	session_config.cookie.secure = false;
	session_config.cookie.path = appConfig.prefix;
}

//Set config session
app.use(session(session_config));

/**
 * Languages middleware
 * i18n init parses req for language headers, cookies, etc.
 */
const i18n = require("./app/configs/i18n.config");
app.use(i18n.init);

/*** Static setup ***/
const staticOptions = {
	maxAge: env === "develop" ? 0 : "30d", //Cache to browser on production,staging
	setHeaders: function (res, path, stat) {
		//ignore cache
		let ext = path.split(".").pop();
		if (["html", "htm", "xlsx", "txt"].indexOf(ext) >= 0) {
			res.setHeader("Cache-Control", "public, max-age=0");
		}
	},
};

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Methods", "GET, POST");
	res.header("Access-Control-Allow-Origin", "*");
	// res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
	res.setHeader("X-Powered-By", "None");
	res.setHeader("X-XSS-Protection", 1);
	res.setHeader("Content-Security-Policy", helpers.base.getCSP());
	return next();
});

app.get("/favicon.ico", (req, res) => res.status(204));
/**
 * Static secure middleware media folder
 * only accept access folder uploads, check permission root or have permission import/export on resource
 */
app.use(appConfig.prefix + "/media", function (req, res, next) {
	try {
		//if (env === 'dev') return next()
		const src = req.path.match(/^\/[^/]*/)[0];
		if (["/uploads"].includes(src)) return next();
		const admin_userdata = req.session.admin_userdata;
		if (admin_userdata && admin_userdata.role === "root") return next();

		return res.status(403).send("Permission not allowed");
	} catch (error) {
		clog("access_media", error);
		return res.status(403).send("Permission not allowed");
	}
});

app.use(`${appConfig.prefix}/media`, express.static("media", staticOptions));
app.use(`${appConfig.prefix}/public`, express.static("public", staticOptions));

/*** View engine setup  ***/
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "ejs");

//Set flash data
app.use(flash());
//Middleware CSRF
app.use(function (req, res, next) {
	//ignore token on whitelist route
	if (appConfig.csrfIgnore.indexOf(req.path) != -1) return next();

	const urlCondition = req.path.includes("v2025");
	console.log(req?.headers,"req?.headers")
	const tokenCondition = req?.headers?.verify_token && req.headers.verify_token === appConfig.MINIAPP_TOKEN_VERIFY;

	if (urlCondition) {
		if (!tokenCondition) return res.status(403).send("Forbidden");
		return next();
	}
	//create token and send to client
	const tokens = new csrf({ saltLength: 16, secretLength: 36 });
	if (req.method == "GET") {
		let secret = req.session.csrfSecretToken ? req.session.csrfSecretToken : tokens.secretSync();
		//clog('GET',secret)
		let token = tokens.create(secret);
		req.session.csrfSecretToken = secret;
		res.locals.csrftoken = token;
		return next();
	}

	//check token
	let csrfSecretToken = req.session.csrfSecretToken;
	let postToken = req.body._csrf;
	//clog('POST',postToken)
	if (!csrfSecretToken || !postToken || !tokens.verify(csrfSecretToken, postToken)) {
		return res.status(403).send("Forbidden");
	}
	return next();
});

const mdw = function (req, res, next) {
	res.locals.pageTitle = "Welcome";
	res.locals.pageKeywords = "";
	res.locals.pageDesc = "";

	res.locals.ogTitle = "";
	res.locals.ogDesc = "";
	res.locals.ogImg = `${_staticUrl}public/frontend/assets/images/thumb_share.jpg?v=${_versionCache}`;
	res.locals.ogUrl = _baseUrl;

	res.locals.admin_userdata = req.session?.admin_userdata || "";
	res.locals.admin_menu = req.session?.admin_menu;
	res.locals.adminUrl = _baseUrl + "admin/";
	res.locals.staticUrl = _staticUrl;
	res.locals.publicUrl = `${_staticUrl}public/`;
	res.locals.frontendUrl = `${_staticUrl}public/frontend/`;
	res.locals.mediaUrl = `${_staticUrl}media/`;
	res.locals.faviconUrl = env === "dev" || env === "develop" ? `${_staticUrl}public/ico/${env}.png` : `${_staticUrl}public/ico/favicon.ico`;
	res.locals.body_class = "home";
	res.locals.router = req.route?.path || "";
	res.locals.miloUrl = _staticUrl + "public/frontend/bud25/";

	res.locals.localUser = {};
	res.locals.query_string = req.session?.query_string || "";
	res.locals.language = req.session?.language || "en_US";
	if (req.session?.language) {
		i18n.setLocale(req.session.language);
		res.setLocale(req.session.language);
		res.locals.language = req.session?.language || "en_US";
	}
	res.locals.menu_layout = req.session?.menu_layout ? req.session.menu_layout : "top";
	next();
};

//Load all modules
const modules = require("./app/modules");
app.use("/", mdw, modules);

/*** Catch 404 and forward to error handler ***/
app.use(function (req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
});

/*** Error handler ***/
app.use(function (err, req, res, next) {
	if (err.code == "EBADCSRFTOKEN") {
		return res.status(403).send("Forbidden");
	}

	//hidden err.stack on production
	if (!["dev", "develop", "development"].includes(env)) {
		// clog(err);
		err.stack = null;
		err.message = null;
	}

	res.locals.error = err;
	return req.method == "POST" ? res.status(200).send(err.message) : res.render("error");
});

module.exports = app;
