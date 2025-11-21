"use strict";

const Queue = require("bull");
const moment = require("moment");
const _ = require("lodash");
// const miloModel = require("../../milo/models");
const { PROCESS_STATUS, COLLECTIONS } = require("../../../../app/configs/constants");
const appConfig = require("../../../configs");
const zaloApi = require("../../../libs/zalo");
const GapitAPI = require("../../../libs/gapit");
const Gapit = new GapitAPI();

const { REDIS_CONFIG } = require("../../../configs/redis.constant");

const options = { removeOnSuccess: true, removeOnComplete: true, removeOnFailure: true, timeout: 20000 };

const config_bull = {
	redis: { ...REDIS_CONFIG, enableReadyCheck: false },
	defaultJobOptions: { ...options },
	prefix: REDIS_CONFIG.keyPrefix,
};

if (appConfig.env != "develop") {
	config_bull.settings = {
		// Enable trustProxy to handle X-Forwarded-For header
		trustProxy: true,
	};
}

global.callProcessSendZNS = new Queue("callProcessSendZNSBud25__" + appConfig.env, config_bull);
callProcessSendZNS.setMaxListeners(0);
callProcessSendZNS.process(async (job) => {
	try {
		const { user, gift } = job.data;

		let message = null;
		if (gift?.my_gift?.gift_type == "card") {
			message = await miloModel.findOne(COLLECTIONS.MESSAGE, { status: 1, slug_name: "qua-10k" });
		}
		if (gift?.my_gift?.gift_type == "voucher") {
			message = await miloModel.findOne(COLLECTIONS.MESSAGE, { status: 1, slug_name: "qua-voucher" });
		}

		if (gift?.my_gift?.gift_type == "item") {
			message = await miloModel.findOne(COLLECTIONS.MESSAGE, { status: 1, slug_name: "qua-hien-vat" });
		}
		if (!message) {
			throw new Error("Message not found!");
		}
		// console.log(gift?.my_gift, "gift?.my_gift?");
		const content = {
			zoaid: user?.user_id,
			category: message?.category,
			dataElements: message?.content?.elements,
			dataButtons: message?.content?.buttons,
			template_type: message?.template_type,
		};
		if (gift?.my_gift?.gift_type == "card") {
			let dataElements = JSON.stringify(message?.content?.elements)
				.replace(/<<FULLNAME>>/g, user?.fullname)
				.replace(/<<TIME>>/g, helpers.date.format(gift?.my_gift?.createdAt, "DD-MM-YYYY HH:mm:ss"));
			content.dataElements = JSON.parse(dataElements);
		}

		if (gift?.my_gift?.gift_type == "voucher") {
			let dataElements = JSON.stringify(message?.content?.elements)
				.replace(/<<FULLNAME>>/g, user?.fullname)
				.replace(/<<TIME>>/g, helpers.date.format(gift?.my_gift?.createdAt, "DD-MM-YYYY HH:mm:ss"))
				.replace(/<<CODE>>/g, gift?.my_gift?.voucher_info?.code)
				.replace(/<<PIN>>/g, gift?.my_gift?.voucher_info?.pin);
			content.dataElements = JSON.parse(dataElements);
		}

		if (gift?.my_gift?.gift_type == "item") {
			let dataElements = JSON.stringify(message?.content?.elements)
				.replace(/<<FULLNAME>>/g, user?.fullname)
				.replace(/<<TIME>>/g, helpers.date.format(gift?.my_gift?.createdAt, "DD-MM-YYYY HH:mm:ss"))
				.replace(/<<GIFT_NAME>>/g, gift?.my_gift?.gift_name)
				.replace(/<<GIFT_VALUE>>/g, gift?.my_gift?.gift_value);
			content.dataElements = JSON.parse(dataElements);
		}

		const send_zns = await zaloApi.sendTransactionMessage(content);
		const data_zns = {
			user: user?._id,
			uid: user?._id,
			user_id: user?.user_id,
			msg_id: message?._id,
			status: send_zns?.error == 0 ? 1 : 0,
			type: message?.type,
			response: send_zns,
			message: send_zns?.message,
			content: content,
		};
		miloModel.create(COLLECTIONS.ZNS, data_zns);

		return true;
	} catch (error) {
		console.log(error, "error");
		return false;
	}
});

global.callProcessTopup = new Queue("callProcessTopupBud25__" + appConfig.env, config_bull);
callProcessTopup.setMaxListeners(0);
callProcessTopup.process(async (job) => {
	try {
		const { card_id } = job.data;
		const card = await miloModel.findOne(COLLECTIONS.CARD, { _id: card_id, status: 0 });
		console.log(card, "card");
		const data_request = {
			request_id: card?._id.toString(),
			phone: card?.phone,
			amount: 10000,
		};
		const send_request = Gapit.sendTopUp(card_id, card?.phone, 10000);
		const code = 0;
		const message = "request topup";
		let step = 1;

		const data_update = { data_request: data_request, status: 1, step, code, message };
		await miloModel.updateOne(COLLECTIONS.CARD, { _id: card?._id }, data_update);

		return true;
	} catch (error) {
		console.log(error, "error");
		return false;
	}
});

class gift_worker {
	constructor() {}

	async send_zns(data) {
		const job = await callProcessSendZNS.add(data, { delay: 5000 });

		return new Promise((res, rej) => {
			callProcessSendZNS.on("completed", (jobjob, result) => {
				if (job?.id == jobjob?.id) {
					console.log(jobjob?.id, "jobjob?.id");
					job.remove();
					res(result);
				}
			});
			callProcessSendZNS.on("error", (err) => {
				console.log("data", err);
				rej(err);
			});
			callProcessSendZNS.on("failed", (err) => {
				console.log("data", err);
				rej(err);
			});
		});
	}
	async topup(data) {
		const job = await callProcessTopup.add(data);

		return new Promise((res, rej) => {
			callProcessTopup.on("completed", (jobjob, result) => {
				if (job?.id == jobjob?.id) {
					console.log(jobjob?.id, "jobjob?.id");
					job.remove();
					res(result);
				}
			});
			callProcessTopup.on("error", (err) => {
				console.log("data", err);
				rej(err);
			});
			callProcessTopup.on("failed", (err) => {
				console.log("data", err);
				rej(err);
			});
		});
	}
}

module.exports = new gift_worker();
