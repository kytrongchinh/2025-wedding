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
				bride: "Trường Mi",
				groom: "Trọng Chính",
			},
			music: [
				`${_staticUrl}public/frontend/assets/musics/Bruno-Mars-Marry-You.mp3?v=${_versionCache}`,
				`${_staticUrl}public/frontend/assets/musics/I-Wanna-Grow-Old-With-You-Westlife.mp3?v=${_versionCache}`,
				`${_staticUrl}public/frontend/assets/musics/Nothing-Gonna-Change-My-Love-For-You.mp3?v=${_versionCache}`,
				`${_staticUrl}public/frontend/assets/musics/only-you-noona.mp3?v=${_versionCache}`,
				`${_staticUrl}public/frontend/assets/musics/Stephanie-Poetri-I-Love-You-3000.mp3?v=${_versionCache}`,
				`${_staticUrl}public/frontend/assets/musics/Tyler-Shaw-With-You.mp3?v=${_versionCache}`,
			],
			video: {
				file1: `${_staticUrl}public/frontend/assets/images/thumb_share.jpg?v=${_versionCache}`,
				file2: `${_staticUrl}public/frontend/assets/images/thumb_share.jpg?v=${_versionCache}`,
				file3: `${_staticUrl}public/frontend/assets/images/thumb_share.jpg?v=${_versionCache}`,
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
					name: "Trần Xông Pha",
					title: "Anh",
				},
				mother: {
					name: "Lê Thị Đông",
					title: "Dì",
				},
				address: "07 Hoàng Quốc Việt, Đức Lập, Lâm Đồng",
			},

			groom: {
				name: "NHÀ TRAI",
				farther: {
					name: "Kỷ Trọng Văn",
					title: "Ông",
				},
				mother: {
					name: "Huỳnh Thị Hiệp",
					title: "Bà",
				},
				address: "Đội 5, Trà Thung, Phù Mỹ Bắc, Gia Lai",
			},
			time: "10:00",
			at: "SÁNG",
			lunar_date: "Nhầm ngày 06.11 Năm Ất Tỵ",
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
					address: "07 Hoàng Quốc Việt, Đức Lập, Lâm Đồng",
					time: "9:00 21.12.2025",
				},
				party: {
					name: "TIỆC RƯỢU",
					at: "Nhà hàng Tuấn Thảo",
					address: "Đường ven Hồ Tây, Đăk Mil",
					time: "11:00 21.12.2025",
				},
			},

			groom: {
				ancestral_ceremony: {
					name: "LỄ GIA TIÊN",
					at: "Tư gia nhà trai",
					address: "Đội 5, Trà Thung, Phù Mỹ Bắc, Gia Lai",
					time: "10:00 25.12.2025",
				},
				party: {
					name: "TIỆC RƯỢU",
					at: "Nhà hàng Thanh Hường",
					address: "37 Nguyễn Du, Bình Dương, Gia Lai",
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

info.get("/contact", async function (req, res) {
	try {
		let show_bank = await helpers.setting.get_value_setting("show_bank");
		const data = {
			bride: {
				name: "Mi Mie",
				phone: "033 628 69 81",
				zalo_qr: `${_staticUrl}public/frontend/assets/images/zalo_qr_bride.jpg?v=${_versionCache}`,
				bank: show_bank == 1 ? `${_staticUrl}public/frontend/assets/images/zalo_qr_bride.jpg?v=${_versionCache}` : "",
				restaurance: "Nhà hàng Tuấn Thảo",
				address: "Đường ven Hồ Tây, Đăk Mil",
				time: "11:00 21.12.2025",
				map: "https://maps.app.goo.gl/eG4QuwV7UrU8kkBk6",
			},

			groom: {
				name: "Ky Chin",
				phone: "097 256 90 49",
				zalo_qr: `${_staticUrl}public/frontend/assets/images/zalo_qr_groom.jpg?v=${_versionCache}`,
				bank: show_bank == 1 ? `${_staticUrl}public/frontend/assets/images/zalo_qr_bride.jpg?v=${_versionCache}` : "",
				restaurance: "Nhà hàng Thanh Hường",
				address: "37 Nguyễn Du, Bình Dương, Gia Lai",
				time: "11:30 25.12.2025",
				map: "https://maps.app.goo.gl/yryk3Pdm1xTJcJ2cA",
			},

			wedding_party: {
				name: "TIỆC BÁO HỶ",
				restaurance: "Én Restaurant & Event Space",
				address: "Robot Tower, 308C Điện Biên Phủ, Phường 4, Quận 3, Thành phố Hồ Chí Minh",
				time: "19h 08.01.2026",
				map: "https://maps.app.goo.gl/k33FBJKtkLEx6v6w5",
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
