const helper = {};
const path = require("path");
const model = require("../modules/admin/models");
const pagination = require("pagination");

/* Check blacklist
 * true: in blacklist
 * false: not in blacklist
 */
helper.checkBlackList = function (phone) {
	if (!phone) return true;
	if (appConfig.campaign.check_blacklist == 1) return _blackList.indexOf(phone) != -1;
	return false;
};

/* Check time
 * true: in whitelist
 * false: not in whitelist
 */
helper.checkWhiteList = async function (zid) {
	try {
		let zid_test = await helpers.setting.get_value_setting("zid_test");
		zid_test = String(zid_test);
		return zid_test.indexOf(zid) !== -1;
	} catch (e) {
		clog(e.message);
		return false;
	}
};

/* Check time
 * 0: countdown
 * 1: running
 * 2: end
 * Exp: campaign_time {"start":"2023-12-12 00:00:00","end":"2023-31-12 23:59:59"}
 */
helper.checkTime = async function (zid) {
	try {
		if (zid) {
			const check_white_list = await this.checkWhiteList(zid);
			if (check_white_list) return 1;
		}

		let date_live = await helpers.setting.get_value_setting("date_live");
		if (!date_live) {
			date_live = "2023-11-01 00:00:00";
		}

		let date_end = await helpers.setting.get_value_setting("date_end");
		if (!date_end) {
			date_end = "2024-02-03 23:59:59";
		}

		const timeCurrent = helpers.date.getCurrentTime("x");
		const timeStart = helpers.date.format(date_live, "x");
		const timeEnd = helpers.date.format(date_end, "x");

		return timeCurrent < timeStart ? 0 : timeCurrent > timeEnd ? 2 : 1;
	} catch (e) {
		clog(e);
		return 0;
	}
};

helper.getLinkOpenInApp = function (req) {
	try {
		return `${appConfig.zalo_oa.url}?src=NonZaloBrowser&redirect_url=${encodeURI(path.join(_baseUrl, req.url))}`;
	} catch (e) {
		return `${appConfig.zalo_oa.url}?src=NonZaloBrowser&redirect_url=${encodeURI(_baseUrl)}`;
	}
};

/* Get template message
 * Exp: data_replace : {code:'E9W3EG76DC',phone:'0938611262',amount:'9.999',date_luckydraw:'2020-12-12'}
 */
helper.get_error_message = function (key, replaces) {
	var arr = {
		error: "Thật đáng tiếc có lỗi hệ thống xảy ra, vui lòng thử lại trong chốc lát",
		error_blocking:
			"Bạn đã nhập sai mã 5 lần liên tiếp.<br>Tài khoản sẽ bị khóa trong vòng 3 tiếng. Vui lòng quay lại sau.<br>Nếu bạn nhập mã sai 10 lần liên tiếp sẽ bị khóa tài khoản trong vòng 8 tiếng đấy! <br>Hãy kiểm tra mã cẩn thận nhé!",
		error_blocking_2:
			"Bạn đã nhập sai mã 10 lần liên tiếp.<br>Tài khoản sẽ bị khóa trong vòng 8 tiếng, vui lòng quay lại sau.<br>Nếu bạn nhập mã sai 15 lần liên tiếp sẽ bị khóa tài khoản trong vòng 8 tiếng đấy! <br>Hãy kiểm tra mã cẩn thận nhé!",
		error_blocking_forever:
			'Tài khoản của bạn đã bị khóa vĩnh viễn vui lòng liên hệ hotline <span class="text-hight">' + appConfig.campaign.hotline + "</span> để được hỗ trợ.",
		error_blacklist:
			'Cảm ơn bạn đã tham gia chương trình. Rất tiếc bạn không đủ điều kiện để tham gia chương trình này. Vui lòng tham khảo <a class="base" href="' +
			_baseUrl +
			'the-le"> Điều khoản chương trình.</a>',
		qr_exist:
			'Mã tích điểm không hợp lệ hoặc đã sử dụng rồi bạn ơi. Vui lòng scan lại hoặc gọi ngay hotline <span class="text-hight">' +
			appConfig.campaign.hotline +
			"</span> để tụi mình tư vấn nhé!",
		qr_not_found:
			'Mã tích điểm không hợp lệ hoặc đã sử dụng rồi bạn ơi. Vui lòng scan lại hoặc gọi ngay hotline <span class="text-hight">' +
			appConfig.campaign.hotline +
			"</span> để tụi mình tư vấn nhé!",
		qr_batch_not_active:
			'Mã tích điểm không hợp lệ hoặc đã sử dụng rồi bạn ơi. Vui lòng scan lại hoặc gọi ngay hotline <span class="text-hight">' +
			appConfig.campaign.hotline +
			"</span> để tụi mình tư vấn nhé!",
		campaign_no_start: 'Chương trình chưa bắt đầu. Chi tiết liên hệ <span class="text-hight">' + appConfig.campaign.hotline + "</span>.",
		not_in_location: "Không thể tìm thấy tín hiệu của bạn trong địa bàn",
	};
	var mess = arr[key];

	var escapeFunc = function (string) {
		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	};
	for (const prop in replaces) {
		var regex = new RegExp(escapeFunc("{" + prop + "}"), "g");
		mess = mess.replace(regex, replaces[prop]);
	}
	return mess;
};

helper.add_whitelist_phone_test = async function (phone) {
	try {
		if (phone) {
			let re =
				/^(096|097|098|086|032|033|034|035|036|037|038|039|094|091|081|082|083|084|085|088|093|090|089|070|076|077|078|079|092|052|056|058|059|099|019|095|087)+([0-9]{7})\b$/;
			if (!re.test(phone)) return false;
			let phone_test = await helpers.setting.get_value_setting("phone_test");
			if (phone_test == undefined || phone_test == null) return false;
			if (phone_test.indexOf(phone) == -1) {
				phone_test += phone_test != "" ? `,${phone}` : phone;
				await helpers.setting.set_value_setting("phone_test", phone_test);
			}
			return true;
		}
		return false;
	} catch (e) {
		clog(e, "add_whitelist_phone_test");
		return false;
	}
};

helper.add_whitelist_test_fromuid = async function (zms_data) {
	helpers.log.writeError(zms_data, "request_whitelist", "request_whitelist");
	//return true;
	var zid_test = await helpers.setting.get_value_setting("zid_test");
	zid_test = String(zid_test);
	if (zid_test.indexOf(zms_data.fromuid) == -1) {
		zid_test += zid_test != "" ? "," + zms_data.fromuid : zms_data.fromuid;
		await helpers.setting.set_value_setting("zid_test", zid_test);
	}
	return true;
};

/**
 * Get operator mobile phone number
 * @param {String} phone
 * @return {String}
 */
helper.getMobilePhoneOperator = function (phone) {
	try {
		const prefix_codes = {
			"096": "Viettel", // Viettel
			"097": "Viettel",
			"098": "Viettel",
			"086": "Viettel",
			"032": "Viettel",
			"033": "Viettel",
			"034": "Viettel",
			"035": "Viettel",
			"036": "Viettel",
			"037": "Viettel",
			"038": "Viettel",
			"039": "Viettel",
			"094": "Vinaphone", // Vinaphone
			"091": "Vinaphone",
			"081": "Vinaphone",
			"082": "Vinaphone",
			"083": "Vinaphone",
			"084": "Vinaphone",
			"085": "Vinaphone",
			"088": "Vinaphone",
			"093": "Mobifone",
			"090": "Mobifone",
			"089": "Mobifone",
			"070": "Mobifone", // Mobifone
			"076": "Mobifone",
			"077": "Mobifone",
			"078": "Mobifone",
			"079": "Mobifone",
			"092": "Vietnamobile", // Vietnamobile
			"052": "Vietnamobile",
			"056": "Vietnamobile",
			"058": "Vietnamobile",
			"059": "Gmobile", // Gmobile
			"099": "Gmobile",
			"019": "Gmobile",
			"095": "Sfone",
			"087": "ITelecom",
		};
		const prefix_3 = phone.substr(0, 3);
		return prefix_codes[prefix_3] ? prefix_codes[prefix_3] : null;
	} catch (error) {
		return null;
	}
};

/* Get template message
 * Exp: data_replace : {code:'E9W3EG76DC',phone:'0938611262',amount:'9.999',date_luckydraw:'2020-12-12'}
 */
helper.getZaloTemplate = function (key, replaces) {
	var arr = {
		error: {
			title: "Thật đáng tiếc có lỗi hệ thống xảy ra.",
			content: "Vui lòng thử lại trong chốc lát",
			image_url: "",
			cta_link: "",
		},
		follow_receive_voucher: {
			title: "Ú ÒA! Chúc mừng bạn nhận được Gà rán khi Quan tâm Lotteria trên Zalo nha!",
			content:
				"Cảm ơn bạn đã Quan tâm Zalo OA Lotteria Việt Nam!\nLotteria gửi tặng bạn voucher miễn phí 1 miếng Gà rán.\nMã voucher: {voucher}\nChỉ áp dụng 1 mã cho 1 thiết bị.\nHạn sử dụng: 30/11/2022\nĐể sử dụng voucher, bạn vui lòng đến cửa hàng Lotteria và mở tin nhắn này cho bạn nhân viên ở quầy nhé!",
			image_url: "https://stc-lotteria-brand.zdn.vn/public/frontend/assets/img/lotteria_thumb.jpg",
			cta_link: "https://www.lotteria.vn/stores-accepting-vouchers",
			cta_text: "Đổi quà tại đây",
			cta_icon: "https://stc-lotteria-brand.zdn.vn/public/frontend/assets/img/icon.png",
		},
		register_success: {
			title: "Cảm ơn Mẹ đã đăng ký tham gia chương trình.",
			content:
				'Mã dự thưởng của Mẹ là: {lucky_code} \nHãy bình luận Mã trong buổi chia sẻ diễn ra lúc 19h ngày {day} để có cơ hội rinh quà & nhận ưu đãi mua hàng cực sốc.\n\nĐừng quên "Thích" trang Facebook “BÍ QUYẾT NUÔI CON NĂNG ĐỘNG” và tham gia Nhóm Zalo Xã (liên hệ Hội Phụ Nữ xã) để cập nhật thông tin chương trình Mẹ nhé.',
			image_url: "https://stc-milo-nutrional-brand.zdn.vn/public/frontend/images/{thumb}",
			cta_link: "",
		},
		register_success_group_link: {
			title: "Cảm ơn Mẹ đã đăng ký tham gia chương trình.",
			content:
				'Mã dự thưởng của Mẹ là: {lucky_code} \nHãy bình luận Mã trong buổi chia sẻ diễn ra lúc 19h ngày {day} để có cơ hội rinh quà & nhận ưu đãi mua hàng cực sốc.\n\nĐừng quên "Thích" trang Facebook “BÍ QUYẾT NUÔI CON NĂNG ĐỘNG” và tham gia Nhóm Zalo Xã (liên hệ Hội Phụ Nữ xã) để cập nhật thông tin chương trình Mẹ nhé.',
			image_url: "https://stc-milo-nutrional-brand.zdn.vn/public/frontend/images/{thumb}",
			cta_link: "{zalo_group_link}",
		},
		register_success_sms: {
			title: "Dang ky thanh cong!",
			content:
				"Dang ky thanh cong!\nMa du thuong cua Me: {lucky_code}\nHay su dung ma de binh luan trong buoi chia se va nhan nhieu phan qua may man (Smart Tivi, May giat..)\nTheo doi trang MILO Viet Nam: zalo.me/1947994230037588383 de tham gia chuong trinh luc 19h ngay {day}\nHo tro: 0338007261",
			image_url: "",
			cta_link: "",
		},
		register_success_sms_vina: {
			title: "Dang ky thanh cong!",
			content:
				"Dang ky thanh cong!\nMa tham gia cua Me: {lucky_code}\nHay su dung ma de binh luan trong buoi chia se dien ra luc 19h ngay {day}\nTheo doi trang MILO Viet Nam: zalo.me/1947994230037588383\nTong dai ho tro: 0338007261",
			image_url: "",
			cta_link: "",
		},
	};
	return arr[key] ? this.replace_data(arr[key], replaces) : null;
};

/* Render zalopay return_code
 * return status label
 */
helper.render_gift_status = function (status) {
	try {
		var arr = {
			0: { color: "red", text: "Off" },
			1: { color: "green", text: "On" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + "</small>";
	} catch (e) {
		return '<small class="label bg-red">' + status + "</small>";
	}
};

/* Render zalopay return_code
 * return status label
 */
helper.render_log_status = function (status) {
	try {
		var arr = {
			0: { color: "yellow", text: "In Process" },
			1: { color: "green", text: "Valid" },
			"-1": { color: "red", text: "QR Code Used" },
			"-2": { color: "red", text: "QR Code Not Found" },
			"-3": { color: "yellow", text: "QR Code Batch Not Active" },
			"-4": { color: "red", text: "Update Winner false" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + " : " + status + "</small>";
	} catch (e) {
		return '<small class="label bg-red">Unknow: ' + status + "</small>";
	}
};

/* Render zalopay return_code
 * return status label
 */
helper.render_point_type = function (status) {
	try {
		var arr = {
			basic: { color: "green", text: "X1" },
			hot_time: { color: "green", text: "X2" },
			hot_location: { color: "green", text: "x5" },
		};

		if (Object.keys(arr).indexOf(status) == -1) {
			return "";
		}

		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + " : " + status + "</small>";
	} catch (e) {
		return '<small class="label bg-red">Unknow: ' + status + "</small>";
	}
};

/* Render zalopay return_code
 * return status label
 */
helper.render_zalopay_return_code = function (status) {
	try {
		var arr = {
			1: { color: "green", text: "Success" },
			0: { color: "red", text: "Error System" },
			"-1": { color: "red", text: "Token Not Found" },
			"-2": { color: "red", text: "Token Used" },
			"-3": { color: "red", text: "Token Expired" },
			"-4": { color: "red", text: "Info Invalid" },
			"-5": { color: "red", text: "Params Invalid" },
			"-6": { color: "red", text: "Amount Invalid" },
			"-7": { color: "red", text: "Mac Invalid" },
			"-11": { color: "yellow", text: "Not in whitelist" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + "</small>";
	} catch (e) {
		return '<small class="label bg-red">' + status + "</small>";
	}
};

/* Render zalopay return_code
 * return status label
 */
helper.render_winner_status = function (status) {
	try {
		var arr = {
			0: { color: "yellow", text: "In Process" },
			1: { color: "green", text: "Success" },
			"-1": { color: "red", text: "Create Log Zalopay Fail" },
			"-2": { color: "red", text: "ZaloPay Error" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + " : " + status + "</small>";
	} catch (e) {
		return '<small class="label bg-red">' + status + "</small>";
	}
};

/* Render log reward_status
 * return status label
 */
helper.render_reward_status = function (status) {
	try {
		if (!status) return "";
		var arr = {
			SUCCESSFUL: { color: "green", text: "Đã nhận tiền Zalopay" },
			PENDING: { color: "yellow", text: "Khác số điện thoại" },
			FAIL: { color: "red", text: "Error" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + "</small>";
	} catch (e) {
		return '<small class="label bg-red">' + status + "</small>";
	}
};

/* Render zalopay return_code
 * return status label
 */
helper.render_user_status = function (status) {
	try {
		var arr = {
			0: { color: "yellow", text: "New User" },
			1: { color: "green", text: "Valid" },
			2: { color: "red", text: "Blacklist" },
		};
		return '<small class="label bg-' + arr[status].color + '">' + arr[status].text + " : " + status + "</small>";
	} catch (e) {
		return '<small class="label bg-red">Unknow: ' + status + "</small>";
	}
};
helper.pagination = function (link, p_current, totals, limit, pageLinks) {
	return new pagination.TemplatePaginator({
		prelink: link,
		current: p_current,
		rowsPerPage: limit,
		totalResult: totals,
		pageLinks: pageLinks || 5,
		template: function (result) {
			var i, len, prelink;
			var html = "<ul>";
			if (result.pageCount < 2) {
				html += "</ul>";
				return html;
			}
			prelink = this.preparePreLink(result.prelink);
			if (result.previous) {
				html += '<li><a class="p-btn prev" href="' + prelink + result.previous + '"> < </a></li>';
			}
			if (result.range.length) {
				for (i = 0, len = result.range.length; i < len; i++) {
					if (result.range[i] === result.current) {
						html += '<li><a class="active" role="button">' + result.range[i] + "</a></li>";
					} else {
						html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + "</a></li>";
					}
				}
			}
			if (result.next) {
				html += '<li><a class="p-btn next" href="' + prelink + result.next + '" class="paginator-next"> > </a></li>';
			}
			html += "</ul>";
			return html;
		},
	});
};

helper.draw_winner_daily = async function (totday) {
	try {
		const moment = require("moment");
		const mongoose = require("mongoose");
		const ObjectId = mongoose.Types.ObjectId;

		const campaignModel = require("../modules/campaign/models");
		const winnerModel = require("../db2/schema/digital_campaign_winner_rounds");
		const userModel = require("../db2/schema/digital_campaign_users");

		// const winners = await winnerModel.findAll("digital_campaign_winner_rounds", {});
		// const user_ignore = winners.reduce((acc, winner) => {
		// 	acc.push(winner._id);
		// 	return acc;
		// }, []);

		const winners = await campaignModel.findAll("winners", { status: 1 });
		const user_ignore = winners.reduce((acc, winner) => {
			const user_id = new ObjectId(winner?.campaign_user_id);
			acc.push(user_id);
			return acc;
		}, []);
		console.log(totday, "totday");
		const quota = await campaignModel.findOne("quotas", { date: totday });
		if (!quota || !quota?.gift_id) {
			throw "Not set quota gift";
		}

		let location_ignore = [];
		if (quota?.location_ignore) {
			// location_ignore = quota?.location_ignore.split(",");
			location_ignore = quota?.location_ignore;
		}

		const period = quota?.period;
		// load winner
		let query = [
			{
				$match: {
					status: 1,
					digital_campaign_id: new ObjectId(quota?.digital_campaign_id),
					digital_campaign_user_id: { $nin: user_ignore },
					userLocation: { $nin: location_ignore },
					createdAt: { $gte: moment(`${period?.start}`).toDate(), $lt: moment(`${period?.end}`).toDate() },
				},
			},
			{ $sample: { size: 1 } },
		];

		let user_ignore_data = [];
		if (user_ignore.length) {
			user_ignore_data = user_ignore.map((objId) => objId.toString());
		}
		const draws_in = {
			name: quota?.name,
			date: quota?.date,
			period: {
				start: quota?.period?.start,
				end: quota?.period?.end,
			},
			message: "Start",
			is_win: 0,
			code: "",
			quota_info: {
				name: quota?.name,
				date: quota?.date,
				gift_id: quota?.gift_id,
				gift_name: quota?.gift_name,
				location_ignore: quota?.location_ignore,
				id: quota?._id.toString(),
			},
			user_ignore: user_ignore_data,
			location_ignore: location_ignore,
			status: 0,
			type: "auto",
		};
		const draw = await campaignModel.create("draws", draws_in);
		if (draw?.status == false) {
			throw new Error("Lỗi");
		}
		const list_log = await campaignModel.aggregateCustom("utc_code_histories", query);
		//console.log(query, "query");
		//console.log(list_log, "list_log");
		if (list_log.length > 0) {
			const lucky_log = list_log?.[0];
			console.log("lucky_log", lucky_log);
			// add winner to list
			const user_data = await userModel.findOne("digital_campaign_users", { _id: lucky_log?.digital_campaign_user_id });
			if (!user_data) {
				const update_log = {
					message: `Không tìm thấy user trúng thưởng`,
					status: 1,
				};
				await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
				throw new Error("Not found user");
			}
			const user = user_data.toObject();
			const winner_in = {
				name: quota?.name,
				date: quota?.date,
				period: {
					start: quota?.period?.start,
					end: quota?.period?.end,
				},
				digital_campaign_id: lucky_log?.digital_campaign_id,
				digital_campaign_round_id: "",
				campaign_user_id: lucky_log?.digital_campaign_user_id,
				userName: user?.name,
				userAvatar: user?.avatar,
				userPhone: user?.phone,
				userLocation: lucky_log?.userLocation,
				province_name: user?.extraData?.province_name,
				userZaloOAId: lucky_log?.userZaloOAId,
				code: lucky_log?.code,
				digital_campaign_gift_id: new ObjectId(quota?.gift_id),
				giftName: quota?.gift_name,
				extraData: {
					code: lucky_log?.code,
				},
				user_info: {
					userName: user?.name,
					userAvatar: user?.avatar,
					userPhone: user?.phone,
					userLocation: lucky_log?.userLocation,
					userZaloAppId: lucky_log?.userZaloAppId,
					userZaloOAId: lucky_log?.userZaloOAId,
					province_name: user?.extraData?.province_name,
				},
				quota_info: {
					name: quota?.name,
					date: quota?.date,
					gift_id: quota?.gift_id,
					gift_name: quota?.gift_name,
					location_ignore: quota?.location_ignore,
				},
				quota_id: quota?._id,
				log_id: lucky_log?._id,
				status: 1,
				step: 1, // quay thành công
			};
			const add_winner = await campaignModel.create("winners", winner_in);
			if (add_winner?.status == true) {
				const update_log = {
					message: `${user?.name} win ${quota?.gift_name} code ${lucky_log?.code}`,
					winner_id: add_winner?.msg?._id,
					is_win: 1,
					code: lucky_log?.code,
					user_info: {
						userName: user?.name,
						userAvatar: user?.avatar,
						userPhone: user?.phone,
						userLocation: lucky_log?.userLocation,
						userZaloAppId: lucky_log?.userZaloAppId,
						userZaloOAId: lucky_log?.userZaloOAId,
						province_name: user?.extraData?.province_name,
					},
					campaign_info: {
						digital_campaign_id: lucky_log?.digital_campaign_id.toString(),
						digital_campaign_round_id: "",
						campaign_user_id: lucky_log?.digital_campaign_user_id.toString(),
					},
					status: 1,
				};
				await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
			}

			return { status: 200, winner_in };
		} else {
			const update_log = {
				message: `Không tìm thấy winner hợp lệ`,
				status: 1,
			};
			await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
			return { status: 200, list_log };
		}
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};

helper.draw_winner_daily_retry = async function (totday, winner_id) {
	try {
		const moment = require("moment");
		const mongoose = require("mongoose");
		const ObjectId = mongoose.Types.ObjectId;

		const campaignModel = require("../modules/campaign/models");
		const winnerModel = require("../db2/schema/digital_campaign_winner_rounds");
		const userModel = require("../db2/schema/digital_campaign_users");

		// const winners = await winnerModel.findAll("digital_campaign_winner_rounds", {});
		// const user_ignore = winners.reduce((acc, winner) => {
		// 	acc.push(winner._id);
		// 	return acc;
		// }, []);

		// const winners = await campaignModel.findAll("winners", { status: 1, step: 0 });
		const winners = await campaignModel.findAll("winners", { status: 1 });
		const user_ignore = winners.reduce((acc, winner) => {
			const user_id = new ObjectId(winner?.campaign_user_id);
			acc.push(user_id);
			return acc;
		}, []);

		const quota = await campaignModel.findOne("quotas", { date: totday });
		if (!quota || !quota?.gift_id) {
			throw "Not set quota gift";
		}

		let location_ignore = [];
		if (quota?.location_ignore) {
			// location_ignore = quota?.location_ignore.split(",");
			location_ignore = quota?.location_ignore;
		}

		const period = quota?.period;
		// load winner
		let query = [
			{
				$match: {
					status: 1,
					digital_campaign_id: new ObjectId(quota?.digital_campaign_id),
					digital_campaign_user_id: { $nin: user_ignore },
					userLocation: { $nin: location_ignore },
					createdAt: { $gte: moment(`${period?.start}`).toDate(), $lt: moment(`${period?.end}`).toDate() },
				},
			},
			{ $sample: { size: 1 } },
		];

		let user_ignore_data = [];
		if (user_ignore.length) {
			user_ignore_data = user_ignore.map((objId) => objId.toString());
		}
		const draws_in = {
			name: quota?.name,
			date: quota?.date,
			period: {
				start: quota?.period?.start,
				end: quota?.period?.end,
			},
			message: "Start",
			is_win: 0,
			code: "",
			quota_info: {
				name: quota?.name,
				date: quota?.date,
				gift_id: quota?.gift_id,
				gift_name: quota?.gift_name,
				location_ignore: quota?.location_ignore,
				id: quota?._id.toString(),
			},
			user_ignore: user_ignore_data,
			location_ignore: location_ignore,
			status: 0,
			type: "byhand",
		};
		const draw = await campaignModel.create("draws", draws_in);
		if (draw?.status == false) {
			throw new Error("Lỗi");
		}

		const list_log = await campaignModel.aggregateCustom("utc_code_histories", query);
		if (list_log.length > 0) {
			const lucky_log = list_log?.[0];
			console.log("lucky_log", lucky_log);
			// add winner to list
			const user_data = await userModel.findOne("digital_campaign_users", { _id: lucky_log?.digital_campaign_user_id });
			if (!user_data) {
				const update_log = {
					message: `Không tìm thấy user trúng thưởng`,
					status: 1,
				};
				await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
				throw new Error("Not found user");
			}
			const user = user_data.toObject();
			const winner_in = {
				name: quota?.name,
				date: quota?.date,
				period: {
					start: quota?.period?.start,
					end: quota?.period?.end,
				},
				digital_campaign_id: lucky_log?.digital_campaign_id,
				digital_campaign_round_id: "",
				campaign_user_id: lucky_log?.digital_campaign_user_id,
				userName: user?.name,
				userAvatar: user?.avatar,
				userPhone: user?.phone,
				userLocation: lucky_log?.userLocation,
				province_name: user?.extraData?.province_name,
				userZaloOAId: lucky_log?.userZaloOAId,
				code: lucky_log?.code,
				digital_campaign_gift_id: new ObjectId(quota?.gift_id),
				giftName: quota?.gift_name,
				extraData: {
					code: lucky_log?.code,
				},
				user_info: {
					userName: user?.name,
					userAvatar: user?.avatar,
					userPhone: user?.phone,
					userLocation: lucky_log?.userLocation,
					userZaloAppId: lucky_log?.userZaloAppId,
					userZaloOAId: lucky_log?.userZaloOAId,
					province_name: user?.extraData?.province_name,
				},
				quota_info: {
					name: quota?.name,
					date: quota?.date,
					gift_id: quota?.gift_id,
					gift_name: quota?.gift_name,
					location_ignore: quota?.location_ignore,
				},
				quota_id: quota?._id,
				log_id: lucky_log?._id,
				status: 1,
				step: 1, // quay thành công
				$inc: { retry: 1 },
			};
			const up_winner = await campaignModel.updateOne("winners", { _id: winner_id }, winner_in);
			if (up_winner?.status == true) {
				const update_log = {
					message: `${user?.name} win ${quota?.gift_name} code ${lucky_log?.code}`,
					winner_id: up_winner?.msg?._id,
					is_win: 1,
					code: lucky_log?.code,
					user_info: {
						userName: user?.name,
						userAvatar: user?.avatar,
						userPhone: user?.phone,
						userLocation: lucky_log?.userLocation,
						userZaloAppId: lucky_log?.userZaloAppId,
						userZaloOAId: lucky_log?.userZaloOAId,
						province_name: user?.extraData?.province_name,
					},
					campaign_info: {
						digital_campaign_id: lucky_log?.digital_campaign_id.toString(),
						digital_campaign_round_id: "",
						campaign_user_id: lucky_log?.digital_campaign_user_id.toString(),
					},
					status: 1,
				};
				await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
			}
			return true;
		} else {
			const update_log = {
				message: `Không tìm thấy winner hợp lệ`,
				status: 1,
			};
			await campaignModel.updateOne("draws", { _id: draw?.msg?._id }, update_log);
			return false;
		}
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};
module.exports = helper;
