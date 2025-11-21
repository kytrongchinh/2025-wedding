const express = require("express");
const info = express.Router();
const {
	COLLECTIONS,
	STATUS,
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
const miloModal = require("../../../milo/models");
const _ = require("lodash");
info.get("/", async function (req, res) {
	try {
		const checkTime = await helpers.campaign.checkTime();
		let date_live = await helpers.setting.get_value_setting("date_live");
		if (!date_live) {
			date_live = "2023-11-01 00:00:00";
		}

		let date_end = await helpers.setting.get_value_setting("date_end");
		if (!date_end) {
			date_end = "2024-02-03 23:59:59";
		}
		const name = "MILO TẾT 2025";
		const data = {
			checkTime,
			startDate: date_live,
			endDate: date_end,
			name: name,
			tag: " MILO_TET_",
		};
		const result = {
			error: 0,
			message: "Success",
			data: data,
		};

		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: -1,
			message: "Error: " + error.message,
			data: null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

info.get("/gifts", async function (req, res) {
	try {
		let gifts = await libs.redis.get(GIFTS.KEY + "ALL_SECOND");
		if (!_.isEmpty(gifts)) {
			// console.log("final redis");

			gifts = JSON.parse(gifts);
		} else {
			gifts = await miloModal.findAll(
				COLLECTIONS.GIFT,
				{ status: STATUS.Valid.ID, group: "second", slug_name: { $ne: "momo-voucher" } },
				"name slug_name thumb  total current",
				{
					weight: 1,
				}
			);
			await libs.redis.set(GIFTS.KEY + "ALL_SECOND", JSON.stringify(gifts), 1800);
		}

		// total join
		let challenge_medal = await libs.redis.get("TOTAL_USER_HAS_MEDAL_CHALLENGE");
		if (!_.isEmpty(challenge_medal)) {
			// console.log("join redis");
			challenge_medal = challenge_medal;
		} else {
			// challenge_medal = await miloModal.count(COLLECTIONS.USER, { status: STATUS.Valid.ID, phone: { $ne: "" }, birthdate: { $ne: "" } });
			let query = [{ $match: { status: 1, medal: "bronze" } }, { $group: { _id: "$uid", count: { $sum: 1 } } }];
			const challenge = await miloModal.aggregateCustom("ml_certificates", query);
			challenge_medal = challenge?.[0]?.count || 0;
			console.log("challenge_medal", challenge_medal);
			await libs.redis.set("TOTAL_USER_HAS_MEDAL_CHALLENGE", challenge_medal || 0, 1800);
		}

		let intelligence_medal = await libs.redis.get("TOTAL_USER_HAS_MEDAL_INTELLIGENCE");
		if (!_.isEmpty(intelligence_medal)) {
			intelligence_medal = intelligence_medal;
		} else {
			// intelligence_medal = await miloModal.count(COLLECTIONS.CERTIFICATE, { status: STATUS.Valid.ID, level: 7 });
			let query = [{ $match: { status: 1, medal: "intelligence" } }, { $group: { _id: "$uid", count: { $sum: 1 } } }];
			const intelligence = await miloModal.aggregateCustom("ml_certificates", query);
			intelligence_medal = intelligence?.[0]?.count || 0;
			console.log("intelligence_medal", intelligence_medal);
			await libs.redis.set("TOTAL_USER_HAS_MEDAL_INTELLIGENCE", intelligence_medal || 0, 1800);
		}

		const result = {
			error: 0,
			message: "Success",
			data: {
				gifts,
				challenge_medal,
				intelligence_medal,
			},
		};
		return utils.common.response(req, res, result);
	} catch (error) {
		const result = {
			error: -1,
			message: error.message,
			data: null,
		};
		return utils.common.response(req, res, result, 400);
	}
});

module.exports = info;
