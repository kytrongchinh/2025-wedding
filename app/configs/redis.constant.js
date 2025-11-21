const getRedisConfig = () => {
	const connectType = process.env.REDIS_CONNECT_TYPE;
	switch (connectType) {
		case "SINGLE":
			return {
				host: process.env.REDIS_HOST,
				port: process.env.REDIS_PORT,
				keyPrefix: `${process.env.REDIS_PREFIX}_${process.env.ENV}_`,
				username: process.env.REDIS_USER,
				password: process.env.REDIS_PASS,
				ttl: process.env.REDIS_TTL,
				db: process.env.REDIS_DB,
				options: {},
			};
		case "SENTINEL":
			const sentinels = process.env.REDIS_HOST.split(",").map((host) => ({ host: host, port: process.env.REDIS_SENTINEL_PORT }));
			return {
				sentinels,
				name: process.env.REDIS_SENTINEL,
				username: process.env.REDIS_USER,
				password: process.env.REDIS_PASS,
				sentinelPassword: process.env.REDIS_SENTINEL_PASS,
				db: process.env.REDIS_DB,
				keyPrefix: `${process.env.REDIS_PREFIX}_${process.env.ENV}_`,
			};
	}
};

module.exports = {
	REDIS_CONFIG: getRedisConfig(),
};
