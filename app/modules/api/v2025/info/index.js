const express = require("express");
const info = express.Router();
const {
	REDIS: { GIFTS },
} = require("../../../../configs/constants");
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
		const name = "NGÀY CHUNG ĐÔI";
		const data = {
			checkTime,
			startDate: date_live,
			endDate: date_end,
			name: name,
			tag: " MILO_TET_",
			wedding: {
				bride: "Mi Mie",
				groom: "Ky Chin",
			},
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

info.get("/wedding", async function (req, res) {
	try {
		const data = {
			name: "LỄ THÀNH HÔN",
			bride: {
				name: "NHÀ GÁI",
				farther: {
					name: "Nguyễn Văn Bảy",
					title: "Anh",
				},
				mother: {
					name: "Nguyễn Thị Hường",
					title: "Chị",
				},
				address: "07 Trần Hưng Đạo, Phường Lê Lợi, Lâm Đồng",
			},

			groom: {
				name: "NHÀ TRAI",
				farther: {
					name: "Nguyễn Văn Ba",
					title: "Anh",
				},
				mother: {
					name: "Nguyễn Thị Năm",
					title: "Chị",
				},
				address: "07 Trần Thủ Độ, Phường Lê Lợi, Lâm Đồng",
			},
			time: "9:00",
			at: "SÁNG",
			lunar_date: "Nhầm ngày 02.11 Năm Ất Tỵ",
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

info.get("/timeline", async function (req, res) {
	try {
		const data = {
			bride: {
				ancestral_ceremony: {
					name: "LỄ GIA TIÊN",
					at: "Tư gia nhà gái",
					address: "07 Trần Hưng Đạo, Phường Lê Lợi, Lâm Đồng",
					time: "9:00 21.12.2025",
				},
				party: {
					name: "TIỆC RƯỢU",
					at: "Nhà hàng Tuấn Thảo",
					address: "07 Trần Hưng Đạo, Phường Lê Lợi, Lâm Đồng",
					time: "11:00 21.12.2025",
				},
			},

			groom: {
				ancestral_ceremony: {
					name: "LỄ GIA TIÊN",
					at: "Tư gia nhà trai",
					address: "07 Trần Thủ Độ, Phường Lê Lợi, Lâm Đồng",
					time: "10:00 25.12.2025",
				},
				party: {
					name: "TIỆC RƯỢU",
					at: "Nhà hàng Thanh Hường",
					address: "07 Trần Thủ Độ, Phường Lê Lợi, Lâm Đồng",
					time: "11:30 25.12.2025",
				},
			},

			wedding_party: {
				name: "TIỆC BÁO HỶ",
				at: "Én Restaurant & Event Space",
				address: "Robot Tower, 308C Điện Biên Phủ, Phường 4, Quận 3, Thành phố Hồ Chí Minh",
				time: "19h 08.01.2026",
			},
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

module.exports = info;
