import { atom } from "recoil";
import { getCurrentTime } from "@/utils/time";
import storage from "@/utils/storage";
async function initializeAdtimaAtom() {
	const authorizeInfo = (await storage.getStorage("authorizeInfo")) || null;
	const current = getCurrentTime("YYYY-MM-DD");
	if (window.APP_CONFIG["ADTIMA_ENV_SET"] == "TESTING" || import.meta.env.MODE == "development" || current < "2024-02-05") {
		return authorizeInfo;
	} else {
		return authorizeInfo;
	}
}

export const authorizeAtom = atom({
	key: storage.getKey("authorizeInfo"),
	default: initializeAdtimaAtom(),
});
