export enum MESSAGE_TEMPLATES {
	START_END_CAMPAIGN = `<p>Chương trình áp dụng toàn quốc, diễn ra từ ngày {{startDate}} đến ngày {{endDate}}.</p>`,
	GENERAL = `<p>Chương trình chưa diễn ra.</p>`,
	FOLLOW_OA = `<p>Vui lòng quan tâm OA để tiếp tục.</p>`,
	BACK_TO_HOME = `<p>Bạn có chắc chắn muốn về trang chủ?</p>`,
	NOT_SUPPORT_ZALO_VERSION = `<p>Phiên bản Zalo hiện tại đã cũ</p><p>Bạn vui lòng dành 1 phút để nâng cấp lên phiên bản zalo mới nhất để tiếp tục!</p>`,
}
type MessageParams = {
	[key: string]: any; // Để cho phép các thuộc tính khác nếu cần
};

export const loadMyMessage = (template: MESSAGE_TEMPLATES, params: MessageParams): string => {
	let message: string = template;
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			message = message.replace(`{{${key}}}`, value || "");
		});
	}
	return message;
};
