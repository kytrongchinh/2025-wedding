let envConfigs = {
	DATABASE_USER: process.env.DATABASE_USER,
	DATABASE_PASS: process.env.DATABASE_PASS,
	DATABASE_HOST: process.env.DATABASE_HOST,
	DATABASE_PORT: process.env.DATABASE_PORT,
	DATABASE_NAME: process.env.DATABASE_NAME,
	DATABASE_REPLICASET: process.env.DATABASE_REPLICASET,
};

//connect mongoDB
let connectionString = `mongodb://${envConfigs.DATABASE_USER}:${envConfigs.DATABASE_PASS}@${envConfigs.DATABASE_HOST}:${envConfigs.DATABASE_PORT}/${envConfigs.DATABASE_NAME}`;
if (envConfigs.DATABASE_REPLICASET) {
	connectionString = `mongodb://${envConfigs.DATABASE_USER}:${envConfigs.DATABASE_PASS}@${envConfigs.DATABASE_REPLICASET}/${envConfigs.DATABASE_NAME}`;
}

module.exports = {
	MongoURL: connectionString,
	PROCESS_STATUS: {
		WAITING: "waiting",
		PROCESSING: "processing",
		SUCCEEDED: "success",
		FAILED: "fail",
	},
	REDIS: {
		ZALO_OA: {
			ACCESS_TOKEN: { KEY: "ACCESS_TOKEN:", TTL: 3600 },
			REFRESH_TOKEN: { KEY: "REFRESH_TOKEN:", TTL: 3 * 30 * 86400 },
		},
		SETTINGS: { KEY: "SETTINGS:", TTL: 86400 },
		USER: { KEY: "USER:", TTL: 3600 },
		TURN: { KEY: "TURN:", TTL: 3600 },
		GIFTS: { KEY: "GIFTS:", TTL: 3600 },
		REMAINING_PLAY_TURNS: { KEY: "PLAY_TURNS:", TTL: 3600 },
		SHOW_MODAL_DAILY: { KEY: "SHOW_MODAL_DAILY:", TTL: 86400 },
		EXCERCISES: { KEY: "EXCERCISES:", TTL: 86400 },
		EXCERCISE_DETAIL: { KEY: "EXCERCISE_DETAIL:", TTL: 86400 },
		EXCERCISE_GROUP: { KEY: "EXCERCISE_GROUP:", TTL: 86400 },
	},
	STATUS: {
		Invalid: { ID: -1, Label: "danger" },
		Pending: { ID: 0, Label: "primary" },
		Valid: { ID: 1, Label: "success" },
	},
	STEPS: {
		CREATE: 1,
		DONE: 5,
	},
	ERRORS: {
		SERVER: "SERVER",
		CAMPAIGN_INVALID: "CAMPAIGN_INVALID",
		CAMPAIGN_NOT_ACTIVE: "CAMPAIGN_NOT_ACTIVE",
		CAMPAIGN_NO_START: "CAMPAIGN_NO_START",
		CAMPAIGN_END: "CAMPAIGN_END",

		MISSING_DATA: "MISSING_DATA",
		INVALID_DATA: "INVALID_DATA",
		NOT_FOUND: "NOT_FOUND",

		DUPLICATE_DATA: "DUPLICATE_DATA",
		NOT_AUTHORIZED: "NOT_AUTHORIZED",
		BLOCK_USER: "BLOCK_USER",

		NOT_IN_LOCATION: "NOT_IN_LOCATION",
		NOT_ENOUGH_POINTS: "NOT_ENOUGH_POINTS",

		CREATE_USER: "CREATE_USER",
		VERIFY_TOKEN: "VERIFY_TOKEN",
		FOLLOWER_USER: "FOLLOWER_USER",
		PHONE_USED: "PHONE_USED",
		UPDATE_USER_FAIL: "UPDATE_USER_FAIL",
		INVALID_TOKEN: "INVALID_TOKEN",

		CREATE_DATA: "CREATE_DATA",
		UPDATE_DATA: "UPDATE_DATA",
		DELETE_DATA: "DELETE_DATA",
		UPDATE_DATA_FAIL: "UPDATE_DATA_FAIL",
		DELETE_DATA_FAIL: "DELETE_DATA_FAIL",
		CREATE_DATA_FAIL: "CREATE_DATA_FAIL",

		CERTIFICATE_NOT_EXIST: "CERTIFICATE_NOT_EXIST",
		CHALLENGE_NOT_EXIST: "CHALLENGE_NOT_EXIST",
		SHARE_LIMIT: "SHARE_LIMIT",

		OPEN_GIFT: "OPEN_GIFT",
		SURVEY_EXIST: "SURVEY_EXIST",
		OVER_QUOTA: "OVER_QUOTA",
		COMPLETED: "COMPLETED",
	},
	MESSAGES: {
		SERVER: { CODE: -101, MSG: "Lỗi hệ thống. Vui lòng thử lại trong ít phút" },
		CAMPAIGN_INVALID: { CODE: -102, MSG: "Chương trình không hợp lệ" },
		CAMPAIGN_NOT_ACTIVE: { CODE: -103, MSG: "Chương trình chưa bắt đầu" },
		CAMPAIGN_NO_START: { CODE: -104, MSG: "Chương trình chưa bắt đầu" },
		CAMPAIGN_END: { CODE: -140, MSG: "Chương trình kết thúc" },

		MISSING_DATA: { CODE: -105, MSG: "Dữ liệu không hợp lệ" },
		INVALID_DATA: { CODE: -106, MSG: "Dữ liệu không hợp lệ" },
		NOT_FOUND: { CODE: -107, MSG: "Không tìm thấy dữ liệu" },

		DUPLICATE_DATA: { CODE: -108, MSG: "Dữ liệu đã tồn tại" },
		NOT_AUTHORIZED: { CODE: -109, MSG: "Bạn không có quyền thực hiện chức năng này" },
		BLOCK_USER: { CODE: -110, MSG: "Người dùng tạm thời bị khóa" },

		NOT_IN_LOCATION: { CODE: -111, MSG: "Không thể tìm thấy tín hiệu của bạn trong địa bàn" },
		NOT_ENOUGH_POINTS: { CODE: -112, MSG: "Bạn không đủ tiền để thực hiện chức năng này" },

		CREATE_USER: { CODE: -113, MSG: "Vui lòng thử lại trong ít phúty" },

		VERIFY_TOKEN: { CODE: -114, MSG: "Vui lòng thử lại trong ít phút" },
		INVALID_TOKEN: { CODE: -115, MSG: "Token không hợp lệ" },
		INVALID_USER: { CODE: -116, MSG: "Tài khoản không hợp lệ" },
		INVALID_PASSWORD: { CODE: -117, MSG: "Mật khẩu không hợp lệ" },
		FOLLOWER_USER: { CODE: -118, MSG: "User chưa follow OA" },
		PHONE_USED: { CODE: -119, MSG: "Số điện thoại đã được sử dụng" },
		UPDATE_USER_FAIL: { CODE: -120, MSG: "Cập nhật thông tin thất bại" },

		UPDATE_DATA_FAIL: { CODE: -124, MSG: "Cập nhật dữ liệu thất bại" },
		DELETE_DATA_FAIL: { CODE: -125, MSG: "Xóa dữ liệu thất bại" },
		CREATE_DATA_FAIL: { CODE: -126, MSG: "Thêm dữ liệu thất bại" },
		CERTIFICATE_NOT_EXIST: { CODE: -127, MSG: "Không tìm thấy dữ liệu phù hợp" },
		SHARE_LIMIT: { CODE: -128, MSG: "Bạn đã vượt số lượng share cho phép" },

		OPEN_GIFT: { CODE: -129, MSG: "Bạn không thể mở gói" },
		CHALLENGE_NOT_EXIST: { CODE: -130, MSG: "Không tìm thấy dữ liệu phù hợp" },
		SURVEY_EXIST: { CODE: -131, MSG: "Dữ liệu đã tồn tại" },
		OVER_QUOTA: { CODE: -132, MSG: "Số lượt tham gia không hợp lệ" },
		COMPLETED: { CODE: -133, MSG: "Bạn đã hoàn thành" },
	},
	COLLECTIONS: {
		INVITEE: "wd_invitees",
		ALBUM: "wd_albums",
		PHOTO: "wd_photos",
		MESSAGE: "wd_messages",
	},
	REGISTER_FORM_FIELDS: [
		{
			id: "fullname",
			placeholder: "Họ tên Bố/Mẹ",
			required: true,
			empty_error: "Vui lòng nhập họ tên Bố/Mẹ",
		},

		{
			id: "phone",
			placeholder: "Số điện thoại(*)",
			required: true,
			empty_error: "Số điện thoại không được bỏ trống",
			format_error: "Số điện thoại không hợp lệ",
		},
		{
			id: "birthdate",
			placeholder: "Ngày tháng năm sinh của Bố/Mẹ",
			required: true,
			empty_error: "Vui lòng chọn ngày tháng năm sinh của Bố/Mẹ",
		},
		{
			id: "birthdate_child",
			placeholder: "Ngày tháng năm sinh của con",
			required: true,
			empty_error: "Vui lòng chọn ngày tháng năm sinh của con",
		},
		{
			id: "fullname_child",
			required: true,
			empty_error: "Vui lòng nhập tên của bé",
		},
	],

	UPDATE_USER_FORM_FIELDS: [
		{
			id: "fullname",
			placeholder: "Họ tên Bố/Mẹ",
			required: true,
			empty_error: "Vui lòng nhập họ tên Bố/Mẹ",
		},
		{
			id: "birthdate",
			placeholder: "Ngày tháng năm sinh của Bố/Mẹ",
			required: true,
			empty_error: "Vui lòng chọn ngày tháng năm sinh của Bố/Mẹ",
		},
		{
			id: "birthdate_child",
			placeholder: "Ngày tháng năm sinh của con",
			required: true,
			empty_error: "Vui lòng chọn ngày tháng năm sinh của con",
		},
		{
			id: "fullname_child",
			required: true,
			empty_error: "Vui lòng nhập tên của bé",
		},
		{
			id: "address",
			required: true,
			empty_error: "Vui lòng nhập địa chỉ",
		},
	],

	PRACTICE_LOG: [
		{
			id: "exercise_id",
			required: true,
			empty_error: "Bài tập không hợp lệ",
		},

		{
			id: "time",
			required: true,
			empty_error: "Thời gian thử thách không hợp lệ",
		},
		// {
		// 	id: "point",
		// 	required: true,
		// 	empty_error: "Điểm thử thách không hợp lệ",
		// },
	],
	SURVEY_LOG: [
		{
			id: "type",
			required: true,
			empty_error: "Type không hợp lệ",
		},

		// {
		// 	id: "answers",
		// 	required: true,
		// 	empty_error: "answers không hợp lệ",
		// },
		// {
		// 	id: "point",
		// 	required: true,
		// 	empty_error: "Điểm thử thách không hợp lệ",
		// },
	],
	QUIZ_LOG: [
		{
			id: "quiz_log_id",
			required: true,
			empty_error: "ID không hợp lệ",
		},

		// {
		// 	id: "answers",
		// 	required: true,
		// 	empty_error: "answers không hợp lệ",
		// },
		// {
		// 	id: "point",
		// 	required: true,
		// 	empty_error: "Điểm thử thách không hợp lệ",
		// },
	],

	DELIVERY: [
		{
			id: "winner_id",
			required: true,
			empty_error: "Id không hợp lệ",
		},

		{
			id: "province",
			required: true,
			empty_error: "Tỉnh/ thành phố không hợp lệ",
		},
		{
			id: "district",
			required: true,
			empty_error: "Quận/ huyện không hợp lệ",
		},
		{
			id: "ward",
			required: true,
			empty_error: "Xã/ phường không hợp lệ",
		},
		{
			id: "address",
			required: true,
			empty_error: "Địa chỉ không hợp lệ",
		},
	],

	USER_DELIVERY: [
		{
			id: "delivery_name",
			required: true,
			empty_error: "Họ và tên không hợp lệ",
		},
		{
			id: "delivery_phone",
			required: true,
			empty_error: "Số điện thoại không hợp lệ",
		},
		{
			id: "delivery_idcard",
			required: true,
			empty_error: "IDcard không hợp lệ",
		},
		{
			id: "delivery_address",
			required: true,
			empty_error: "Địa chỉ không hợp lệ",
		},
	],
	PHONE_CARRIERS: [
		"035",
		"036",
		"079",
		"056",
		"070",
		"092",
		"039",
		"094",
		"098",
		"078",
		"083",
		"097",
		"038",
		"086",
		"084",
		"089",
		"034",
		"093",
		"088",
		"058",
		"080",
		"059",
		"091",
		"037",
		"090",
		"082",
		"081",
		"033",
		"099",
		"077",
		"085",
		"076",
		"032",
		"096",
		"087",
		"055",
		"095",
	],

	ACD: {
		oa_opt_in: "oa_opt_in",
		campaign_opt_in: "campaign_opt_in",
		campaign_register: "campaign_register",
		campaign_login: "campaign_login",
		physical_exercises_complete: "physical_exercises_complete",
		physical_exercises_reward: "physical_exercises_reward",
		physical_exercises_reward_sytem: "physical_exercises_reward_sytem",
		physical_exercises_advance: "physical_exercises_advance",
		edu_quiz_complete: "edu_quiz_complete",
		edu_quiz_reward: "edu_quiz_reward",
		edu_quiz_rewarded_medal: "edu_quiz_rewarded_medal",
		edu_quiz_advance: "edu_quiz_advance",
		survey_complete: "survey_complete",
		survey_reward: "survey_reward",
		referral_single_complete: "referral_single_complete",
		referral_multi_complete: "referral_multi_complete",
		referral_reward: "referral_reward",
		leaderboard_opt_in: "leaderboard_opt_in",
		leaderboard_complete: "leaderboard_complete",
		leaderboard_complete_2: "leaderboard_complete_2",
		leaderboard_advance: "leaderboard_advance",
		wrap_up_receive: "wrap_up_receive",
	},
};
