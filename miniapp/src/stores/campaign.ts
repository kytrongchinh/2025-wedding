import { atom } from "recoil";
import { getCurrentTime } from "@/utils/time";
import storage from "@/utils/storage";
async function initializeAdtimaAtom() {
	const campaignInfo = (await storage.getStorage("campaignInfo")) || null;
	const current = getCurrentTime("YYYY-MM-DD");
	if (window.APP_CONFIG["ADTIMA_ENV_SET"] == "TESTING" || import.meta.env.MODE == "development" || current <= "2024-04-24") {
		return campaignInfo;
	} else {
		return campaignInfo;
	}
}

const campaignAtom = atom({
	key: storage.getKey("campaignInfo"),
	default: initializeAdtimaAtom(),
});

export { campaignAtom };
