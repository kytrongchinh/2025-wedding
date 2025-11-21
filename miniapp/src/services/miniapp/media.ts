import { requestCameraPermission, checkZaloCameraPermission, chooseImage, openMediaPicker, saveImageToGallery, saveVideoToGallery, downloadFile } from "zmp-sdk/apis";
type DataConfig = {
	sourceType?: ("album" | "camera")[];
	cameraType?: "back" | "front";
	count: number;
	type: "video" | "file" | "zcamera" | "zcamera_photo" | "zcamera_video" | "zcamera_scan" | "photo";
	serverUploadUrl: string;
	maxItemSize?: number;
	editView?: {
		enable?: boolean;
		aspectRatio?: string;
	};
	silentRequest?: boolean;
	maxSelectItem?: number;
	imageUrl?: string;
	videoUrl?: string;
};

class MediaApi {
	/*********************************Camera******************************** */

	async requestCameraPermission() {
		try {
			const data = await requestCameraPermission({});
			return data;
		} catch (error) {
			console.log("Error requestCameraPermission :>> ", error);
			return false;
		}
	}
	async checkZaloCameraPermission() {
		try {
			const data = await checkZaloCameraPermission({});
			return data;
		} catch (error) {
			console.log("Error checkZaloCameraPermission :>> ", error);
			return false;
		}
	}
	/*********************************FILE******************************** */

	async chooseImage(dataConfig: DataConfig) {
		try {
			if (typeof dataConfig?.sourceType) {
				const data = await chooseImage(dataConfig);
				return data;
			} else throw new Error("Lỗi");
		} catch (error) {
			console.log("Error chooseImage :>> ", error);
			return false;
		}
	}

	async openMediaPicker(mediaConfig: DataConfig) {
		try {
			const data = await openMediaPicker(mediaConfig);
			return data;
		} catch (error) {
			console.log("Error openMediaPicker :>> ", error);
			return false;
		}
	}

	async saveImageToGallery(mediaConfig: DataConfig) {
		try {
			const data = await saveImageToGallery(mediaConfig);
			return data;
		} catch (error) {
			console.log("Error saveImageToGallery  :>> ", error);
			return false;
		}
	}

	async saveVideoToGallery(url: string) {
		try {
			const data = await saveVideoToGallery({ videoUrl: url });
			return data;
		} catch (error) {
			console.log("Error saveVideoToGallery   :>> ", error);
			return false;
		}
	}

	async downloadFile(url: string) {
		try {
			const data = await downloadFile({ url });
			return data;
		} catch (error) {
			console.log("Error downloadFile   :>> ", error);
			return false;
		}
	}
}
export default new MediaApi();
