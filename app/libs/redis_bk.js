// /** Guide
//  * 1. using : libs.redis.set(<key>,<value>);
//  */
// const IoRedis = require("ioredis");

// // const redisConfig = {
// //     host: process.env.REDIS_HOST,
// //     port: process.env.REDIS_PORT,
// //     prefix: `${process.env.REDIS_PREFIX}_${process.env.ENV}_`,
// //     username: process.env.REDIS_USER,
// //     password: process.env.REDIS_PASS,
// //     ttl: process.env.REDIS_TTL,
// //     db: process.env.REDIS_DB,
// //     options: {}
// // }
// //clog('redisConfig',redisConfig)
// const { REDIS_CONFIG } = require("../configs/redis.constant");

// class Redis {
// 	/**
// 	 *
// 	 * @param {Object} options
// 	 */
// 	// constructor({ host, port, password, prefix, username }) {
// 	constructor() {
// 		//console.log(host, port, password, prefix, username, "dddd");
// 		this.prefix = REDIS_CONFIG.keyPrefix;
// 		this.client = new IoRedis({
// 			...REDIS_CONFIG,
// 			// keyPrefix: prefix,
// 			// port: port,
// 			// host: host,
// 			// username: username,
// 			// password: password,
// 			enableReadyCheck: false,
// 			showFriendlyErrorStack: true, // set true on production
// 			maxRetriesPerRequest: null,
// 			retryStrategy(times) {
// 				const delay = Math.min(times * 50, 2000);
// 				return delay;
// 			},
// 			reconnectOnError(err) {
// 				const targetError = "READONLY";
// 				if (err.message.includes(targetError)) {
// 					// Only reconnect when the error contains "READONLY"
// 					return true; // or `return 1;`
// 				}
// 				if (err.message.includes("WRONGPASS")) {
// 					// Only reconnect when the error contains "READONLY"
// 					return true; // or `return 1;`
// 				}
// 				if (err.message.includes("ECONNRESET")) {
// 					// Only reconnect when the error contains "READONLY"
// 					return true; // or `return 1;`
// 				}
// 			},
// 		})
// 			.on("connect", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Client connected...");
// 			})
// 			.on("ready", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Client connected and ready to use...");
// 			})
// 			.on("error", (err) => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Error: " + err);
// 				// this.client.quit();
// 			})
// 			.on("close", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Redis server connection has closed");
// 				// this.client.quit();
// 			})
// 			.on("reconnecting", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Client reconnecting...");
// 			})
// 			.on("end", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Client end");
// 			})
// 			.on("wait", () => {
// 				console.log("\x1b[35m[REDIS]\x1b[0m Client wait connecting");
// 			});
// 	}

// 	/**
// 	 * Log
// 	 * @param {Error} error
// 	 * @param {Object|Any} data
// 	 * @param {Boolean} notify false
// 	 */
// 	_log(error, data = "", notify = false) {
// 		// 0 is func itself, 1 is caller of func
// 		console.log("error", error);
// 	}

// 	/**
// 	 * Get redis server info
// 	 * @returns {string}
// 	 */
// 	status() {
// 		return new Promise((resolve) => {
// 			const info = this.client.status;
// 			return resolve(info);
// 		});
// 	}

// 	/**
// 	 * Retrieve and return a key.
// 	 *
// 	 * @param {string} key
// 	 * @param {Function} cb
// 	 * @return {Promise}
// 	 */
// 	get(key, cb) {
// 		return new Promise((resolve, reject) => {
// 			this.client.get(key, (err, reply) => {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * Save a key.
// 	 *
// 	 * @param {string} key
// 	 * @param {string} value Only strings, dates and buffers are accepted
// 	 * @param {int} seconds
// 	 * @param {Function} cb
// 	 * @return {Promise}
// 	 */
// 	set(key, value, seconds = 3600, cb = null) {
// 		return new Promise((resolve, reject) => {
// 			if (seconds > 0) {
// 				return this.client.set(key, value, "EX", seconds, (err, reply) => {
// 					err && this._log(err, { key, value, seconds });
// 					const v = err === null;
// 					return typeof cb === "function" ? cb(v) : resolve(v);
// 				});
// 			} else {
// 				return this.client.set(key, value, (err, reply) => {
// 					err && this._log(err, { key, value });
// 					const v = err === null;
// 					return typeof cb === "function" ? cb(v) : resolve(v);
// 				});
// 			}
// 		});
// 	}

// 	/** DEL key
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns true|false
// 	 */
// 	del(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.del(key, (err) => {
// 				err && this._log(err, { key });
// 				const v = !err;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}
// 	/** DEL all key in BD
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns true|false
// 	 */
// 	flushall(cb) {
// 		return new Promise((resolve) => {
// 			this.client.flushdb((err) => {
// 				const v = !err;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}
// 	/**
// 	 * Expire input key.
// 	 *
// 	 * @param {string} key
// 	 * @param {int} seconds
// 	 * @return {Promise}
// 	 */
// 	expire(key, seconds, cb) {
// 		return new Promise((resolve, reject) => {
// 			this.client.expire(key, seconds, (err, reply) => {
// 				err && this._log(err, { key, seconds });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** Get remaining time of a key
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} seconds | -2 if the key does not exist | -1 if the key exists but has no associated expire
// 	 */
// 	ttl(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.ttl(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** GET type of key
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} type | false
// 	 */
// 	type(key, cb) {
// 		return new Promise((resolve) => {
// 			// create client
// 			this.client.type(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** Appends the value at the end of the string
// 	 *  If key does not exist it is similar to SET
// 	 * @param key
// 	 * @param value
// 	 * @param cb
// 	 * @returns {Promise|any|Promise<T>} value|false
// 	 */
// 	append(key, value, cb) {
// 		return new Promise((resolve) => {
// 			this.client.append(key, value, function (err, reply) {
// 				err && this._log(err, { key, value });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** GET multiple keys
// 	 *
// 	 * @param keys [ key1, key2, key3 ...]
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} replies|false
// 	 */
// 	get_multiple(keys, cb) {
// 		if (typeof keys !== "object") return typeof cb === "function" ? cb(false) : false;
// 		keys = keys.map((k) => k.replace(this.prefix, ""));
// 		return new Promise((resolve) => {
// 			const multi = this.client.multi();
// 			let promise = Promise.resolve();
// 			for (let i = 0; i < keys.length; i++) {
// 				promise = promise
// 					.then((_) => this.type(keys[i]))
// 					.then((ttt) => {
// 						// const ttt = await this.type(keys[i])
// 						if (ttt === "string") {
// 							multi.get(keys[i]);
// 						} else if (ttt === "list") {
// 							multi.lrange(keys[i], 0, -1);
// 						} else if (ttt === "set") {
// 							multi.smembers(keys[i]);
// 						} else if (ttt === "hash") {
// 							multi.hgetall(keys[i]);
// 						}
// 					});
// 			}
// 			promise.then((_) =>
// 				multi.exec(function (err, replies) {
// 					err && this._log(err, { keys });
// 					const v = err ? false : replies;
// 					return typeof cb === "function" ? cb(v) : resolve(v);
// 				})
// 			);
// 		});
// 	}

// 	/** GET keys list with prefix
// 	 *
// 	 * @param prefix
// 	 * @returns {Promise|any|Promise<T>} false | [ key1, key2, key3 ...]
// 	 * notes : will return key root has prefix
// 	 */
// 	list_keys(pattern, cb) {
// 		return new Promise((resolve) => {
// 			var regex = pattern ? this.prefix + pattern + "*" : this.prefix + "*";
// 			this.client.keys(regex, function (err, replies) {
// 				err && this._log(err, { prefix });
// 				const v = err ? false : replies;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * SCAN iterates the set of keys in the currently selected Redis database.
// 	 *
// 	 * @param prefix
// 	 * @returns {Promise} [ cursor, [ key1, key2, key3 ...] ]
// 	 */
// 	scan(cursor, pattern, cb) {
// 		return new Promise((resolve) => {
// 			this.client.scan(cursor, "MATCH", pattern + "*", "COUNT", "1000", (err, reply) => {
// 				err && this._log(err, { cursor, pattern });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** Check key exists
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} false|reply
// 	 */
// 	exists(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.exists(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** Increment value of key and return the value of key after the increment
// 	 * If the key does not exist, it is set to 0 before performing the operation
// 	 * An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} false|value
// 	 */
// 	incr(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.incr(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} false|value
// 	 */
// 	decr(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.decr(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * Increment value of key and return the value of key after the increment
// 	 * If the key does not exist, it is set to 0 before performing the operation
// 	 * An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer
// 	 *
// 	 * @param key string
// 	 * @param increment int
// 	 * @param expire int in seconds
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} false|value
// 	 */
// 	incrby(key, increment, expire = 3600, cb = null) {
// 		return new Promise((resolve) => {
// 			this.client
// 				.multi()
// 				.incrby(key, increment)
// 				.expire(key, expire)
// 				.exec(function (err, rsp) {
// 					err && this._log(err, { key, increment, expire });
// 					const v = err ? false : rsp;
// 					return typeof cb === "function" ? cb(v) : resolve(v);
// 				});
// 		});
// 	}

// 	/** Flush all keys in DB
// 	 *
// 	 * @param cb
// 	 * @returns {Promise|any|Promise<T>} false|ok
// 	 */
// 	flush(cb) {
// 		return new Promise((resolve) => {
// 			this.client.flushdb(function (err, reply) {
// 				err && this._log(err);
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * LIST
// 	 */

// 	/**
// 	 * Return the elements of input list.
// 	 *
// 	 * @param {string} listName
// 	 * @param {int} start
// 	 * @param {int} end
// 	 * @return {Promise}
// 	 */
// 	lrange(listName, start = 0, end = -1, cb) {
// 		return new Promise((resolve, reject) => {
// 			this.client.lrange(listName, start, end, (err, reply) => {
// 				err && this._log(err, { listName, start, end });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * Insert all the specified values at the head of the list stored at key
// 	 *
// 	 * @param {string} listName
// 	 * @param {string|Array} value
// 	 * @return {Promise}
// 	 */
// 	lpush(listName, value, cb) {
// 		return new Promise((resolve, reject) => {
// 			this.client.lpush(listName, value, (err, reply) => {
// 				err && this._log(err, { listName, value });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * Right insert a value on input list.
// 	 *
// 	 * @param {string} listName
// 	 * @param {string} value
// 	 * @return {Promise}
// 	 */
// 	rpush(listName, value) {
// 		return new Promise((resolve, reject) => {
// 			this.client.rpush(listName, value, (err, reply) => {
// 				err && this._log(err, { listName, value });
// 				if (err) reject(err);
// 				resolve(reply.toString());
// 			});
// 		});
// 	}

// 	/** GET AND REMOVE VALUE FROM LIST (the last element)
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} value | null | false
// 	 */
// 	rpop(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.rpop(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/** GET the length of list
// 	 *
// 	 * @param key string
// 	 * @param cb function
// 	 * @returns {Promise|any|Promise<T>} length | false | 0 if key does not exist
// 	 */
// 	llen(key, cb) {
// 		return new Promise((resolve) => {
// 			this.client.llen(key, function (err, reply) {
// 				err && this._log(err, { key });
// 				const v = err ? false : reply;
// 				return typeof cb === "function" ? cb(v) : resolve(v);
// 			});
// 		});
// 	}

// 	/**
// 	 * SET
// 	 */

// 	/** Add new member into a redis set
// 	 * @param {String} key
// 	 * @param {String|Array<String>} value
// 	 * @param {Number} expire seconds (reset)
// 	 * @returns {Promise|any|Promise<T>} {0|1}
// 	 */
// 	sadd(key, value, expire = 3600) {
// 		return new Promise((resolve) => {
// 			this.client
// 				.multi()
// 				.sadd(key, value)
// 				.expire(key, expire)
// 				.exec(function (err, rsp) {
// 					if (err) {
// 						err && this._log(err, { key, value, expire });
// 						return resolve(0);
// 					}
// 					return resolve(rsp[0]);
// 				});
// 		});
// 	}

// 	/**
// 	 * Remove one or more members from a set.
// 	 * @param {String} key
// 	 * @param {String|Array<String>} value
// 	 * @returns {Promise<Boolean>}
// 	 */
// 	srem(key, value) {
// 		return new Promise((resolve) => {
// 			this.client.srem(key, value, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key, value });
// 					return resolve(false);
// 				}
// 				return resolve(rsp === 1);
// 			});
// 		});
// 	}

// 	/** Get all the members in a set.
// 	 * @param {String} key
// 	 * @returns {Promise|any|Promise<string[]>}
// 	 */
// 	smembers(key) {
// 		return new Promise((resolve) => {
// 			this.client.smembers(key, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key });
// 					return resolve(false);
// 				}
// 				return resolve(rsp);
// 			});
// 		});
// 	}

// 	/**
// 	 * Determine if a given value is a member of a set.
// 	 * @param {String} key
// 	 * @param {String} value
// 	 * @returns {Promise<Boolean>}
// 	 */
// 	sismember(key, value) {
// 		return new Promise((resolve) => {
// 			this.client.sismember(key, value, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key, value });
// 					return resolve(false);
// 				}
// 				return resolve(rsp === 1);
// 			});
// 		});
// 	}

// 	/**
// 	 * HASHES
// 	 */

// 	/**
// 	 * Increments the number stored at field in the hash stored at key by increment
// 	 * If key does not exist, a new key holding a hash is created. If field does not exist the value is set to 0 before the operation is performed.
// 	 * @param {String} key key
// 	 * @param {String} field
// 	 * @param {Number} increment
// 	 * @param {Number} expire in seconds
// 	 * @return {Number} the value at field after the increment operation
// 	 */
// 	hincrby(key, field, increment, expire = 3600) {
// 		return new Promise((resolve) => {
// 			this.client
// 				.multi()
// 				.hincrby(key, field, increment)
// 				.expire(key, expire)
// 				.exec(function (err, rsp) {
// 					if (err) {
// 						err && this._log(err, { key, field, increment, expire });
// 						return resolve(0);
// 					}
// 					return resolve(rsp[0]);
// 				});
// 		});
// 	}

// 	/**
// 	 * Returns the value associated with field in the hash stored at key.
// 	 * @param {String} key key
// 	 * @param {String} field field
// 	 * @return {String}
// 	 */
// 	hget(key, field) {
// 		return new Promise((resolve) => {
// 			this.client.hget(key, field, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key, field });
// 					return resolve(null);
// 				}
// 				return resolve(rsp);
// 			});
// 		});
// 	}

// 	/**
// 	 * Removes the specified fields from the hash stored at key
// 	 * @param {String} key key
// 	 * @param {String|Array} field field
// 	 * @return {Number} 0, 1
// 	 */
// 	hdel(key, field) {
// 		return new Promise((resolve) => {
// 			this.client.hdel(key, field, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key, field });
// 					return resolve(0);
// 				}
// 				return resolve(rsp);
// 			});
// 		});
// 	}

// 	/**
// 	 * Returns all values in the hash stored at key.
// 	 * @param {String} key key
// 	 * @return {Array<String>}
// 	 */
// 	hvals(key) {
// 		return new Promise((resolve) => {
// 			this.client.hvals(key, function (err, rsp) {
// 				if (err) {
// 					err && this._log(err, { key });
// 					return resolve(null);
// 				}
// 				return resolve(rsp);
// 			});
// 		});
// 	}
// }

// // module.exports = new Redis(redisConfig);
// module.exports = new Redis();
