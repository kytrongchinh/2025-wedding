import {
	openProfile,
	openProfilePicker,
	openChat,
	followOA,
	interactOA,
	unfollowOA,
	openShareSheet,
	openPostFeed,
	createShortcut,
	viewOAQr,
	requestUpdateZalo,
	minimizeApp,
	favoriteApp,
	addRating,
} from "zmp-sdk/apis";
type DataShare =
	| {
			type: "text";
			data: {
				text: string;
				description?: string;
				autoParseLink?: boolean;
			};
	  }
	| {
			type: "image";
			data: {
				imageUrls: string[];
			};
	  }
	| {
			type: "link";
			data: {
				link: string;
				chatOnly?: boolean;
			};
	  }
	| {
			type: "oa";
			data: {
				id: string;
			};
	  }
	| {
			type: "gif";
			data: {
				gifUrl: string;
				imageUrl?: string;
				width?: number;
				height?: number;
			};
	  }
	| {
			type: "video";
			data: {
				videoThumb: string;
				videoUrl: string;
				width?: number;
				height?: number;
			};
	  }
	| {
			type: "zmp" | "zmp_deep_link";
			data: {
				title: string;
				thumbnail: string;
				description?: string;
				path?: string;
			};
	  };

type PostFeed =
	| {
			type: "image";
			data: { imageUrls: string[] };
	  }
	| {
			type: "link";
			data: { link: string; thumb?: string; description?: string; title?: string };
	  }
	| {
			type: "profile";
			data: { id: string };
	  };

class ZaloApi {
	private oa_id: string;
	constructor() {
		this.oa_id = import.meta.env.VITE_ZALO_OA_ID || "";
	}
	async openProfile(type: "user" | "oa" | "aliasOA", id: string) {
		try {
			const data = await openProfile({
				type: type,
				id: id,
			});
			return data;
		} catch (error) {
			console.log("Error openProfile   :>> ", error);
			return false;
		}
	}

	async openProfilePicker(maxProfile: 1) {
		try {
			const data = await openProfilePicker({ maxProfile });
			return data;
		} catch (error) {
			console.log("Error openProfilePicker   :>> ", error);
			return false;
		}
	}

	async openChat(type: "user" | "oa", id: string, message: string) {
		try {
			const data = await openChat({
				type: type,
				id: id,
				message: message || "Xin Chào",
			});
			return data;
		} catch (error) {
			console.log("Error openChat   :>> ", error);
			return false;
		}
	}

	async followOA() {
		try {
			const data = await followOA({ id: this.oa_id });
			return data;
		} catch (error) {
			console.log("Error followOA   :>> ", error);
			return false;
		}
	}
	async interactOA() {
		try {
			const data = await interactOA({ oaId: this.oa_id });
			return data;
		} catch (error) {
			console.log("Error interactOA   :>> ", error);
			return false;
		}
	}

	async unfollowOA() {
		try {
			const data = await unfollowOA({ id: this.oa_id });
			return data;
		} catch (error) {
			console.log("Error unfollowOA    :>> ", error);
			return false;
		}
	}

	async openShareSheet(params: DataShare) {
		try {
			const data = await openShareSheet(params);
			return data;
		} catch (error) {
			console.log("Error openShareSheet   :>> ", error);
			return false;
		}
	}

	async openPostFeed(params: PostFeed) {
		try {
			const data = await openPostFeed(params);
			return data;
		} catch (error) {
			console.log("Error openPostFeed   :>> ", error);
			return false;
		}
	}

	async createShortcut() {
		try {
			const data = await createShortcut({
				params: {
					utm_source: "shortcut",
				},
			});
			return data;
		} catch (error) {
			console.log("Error createShortcut   :>> ", error);
			return false;
		}
	}

	async viewOAQr(displayName: string) {
		try {
			const data = await viewOAQr({ id: this.oa_id, displayName: displayName });
			return data;
		} catch (error) {
			console.log("Error viewOAQr   :>> ", error);
			return false;
		}
	}

	async requestUpdateZalo() {
		try {
			const data = await requestUpdateZalo({});
			return data;
		} catch (error) {
			console.log("Error requestUpdateZalo   :>> ", error);
			return false;
		}
	}

	async minimizeApp() {
		try {
			const data = await minimizeApp({});
			return data;
		} catch (error) {
			console.log("Error minimizeApp   :>> ", error);
			return false;
		}
	}
	async favoriteApp() {
		try {
			const data = await favoriteApp();
			return data;
		} catch (error) {
			console.log("Error favoriteApp   :>> ", error);
			return false;
		}
	}
	async addRating() {
		try {
			const data = await addRating();
			return data;
		} catch (error) {
			console.log("Error addRating   :>> ", error);
			return false;
		}
	}
}
export default new ZaloApi();
