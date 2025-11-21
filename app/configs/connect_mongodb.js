const mongoose = require("mongoose");
const constants = require("./constants");
let envConfigs = {
	DATABASE_USER: process.env.DATABASE_USER,
	DATABASE_PASS: process.env.DATABASE_PASS,
	DATABASE_HOST: process.env.DATABASE_HOST,
	DATABASE_PORT: process.env.DATABASE_PORT,
	DATABASE_NAME: process.env.DATABASE_NAME,
	DATABASE_REPLICASET: process.env.DATABASE_REPLICASET,
};
const options = {
	readPreference: "secondaryPreferred", // https://docs.mongodb.com/manual/core/read-preference/#secondaryPreferred
	maxStalenessSeconds: 120, // Min: 120 // https://docs.mongodb.com/manual/core/read-preference-staleness/#replica-set-read-preference-max-staleness
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoIndex: false, // Don't build indexes
	family: 4, // Use IPv4, skip trying IPv6
	serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

let connectionString = `mongodb://${envConfigs.DATABASE_USER}:${envConfigs.DATABASE_PASS}@${envConfigs.DATABASE_HOST}:${envConfigs.DATABASE_PORT}/${envConfigs.DATABASE_NAME}`;
if (envConfigs.DATABASE_REPLICASET) {
	connectionString = `mongodb://${envConfigs.DATABASE_USER}:${envConfigs.DATABASE_PASS}@${envConfigs.DATABASE_REPLICASET}/${envConfigs.DATABASE_NAME}`;
}
// console.log(connectionString, "connectionString");
// mongodb://127.0.0.1:27017/warrior_utc_code
mongoose.set("strictQuery", false);
mongoose
	.connect(encodeURI(connectionString), options)
	.then(() => {
		console.log("\x1b[35m[MongoDB]\x1b[0m MongoDB connected and ready to use...");
	})
	.catch((err) => {
		// if error we will be here
		console.log("\x1b[35m[MongoDB]\x1b[0m Connect MongoDB failed with error:", err.stack);
		process.exit(1);
	});
mongoose.connection.on("error", console.error.bind(console, "connection error:"));

if (appConfig.env == "develop") {
	mongoose.set("debug", true);
}
module.exports = mongoose;
