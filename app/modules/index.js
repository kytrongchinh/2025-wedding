const express = require("express");
const router = express();
const adminModel = require("./admin/models");
const mongoose = require("../configs/connect_mongodb");

const rateLimit = require("express-rate-limit");

//============================= LOAD ROLES ===================================//
adminModel.findAll("adminRoles", { role: { $ne: "root" } }, "", {}, function (roles) {
	if (roles && roles.length > 0) {
		//get role in db and set variable global
		appConfig.role_systems = [];
		for (let i = 0; i < roles.length; i++) {
			let field = roles[i];
			appConfig.role_systems.push(field.role);
		}
		// clog(appConfig.role_systems)
	}
});

//============================= LOAD MODULES ===================================//
adminModel.findAll("adminModules", { status: true }, "-_id name route", {}, function (result) {
	//clog(result)
	if (result && result.length > 0) {
		appConfig.modules_systems = {};
		for (let i = 0; i < result.length; i++) {
			let modules = result[i];
			router.use(`${appConfig.prefix}/${modules.route}`, rateLimit(appConfig.rateLimiter), require(`./${modules.name}`));

			//set global admin router
			if (modules.name === "admin") {
				appConfig.adminRouter = modules.route;
				global._adminUrl = `${_baseUrl}${modules.route}`;
			}
			//get role in db and set variable global
			appConfig.modules_systems[modules.route] = modules.name;
		}
		//clog(appConfig.modules_systems)
	}

	//route frontend
	router.use(
		`${appConfig.prefix}/`,
		//helpers.base.sanitizersQuery,
		require("./frontend")
	);

	//route api
	router.use(
		`${appConfig.prefix}/api`,
		// rateLimit(appConfig.rateLimiter),
		// helpers.base.sanitizersQuery,
		require("./api")
	);
});
//============================= END MODULES ===================================//

module.exports = router;
