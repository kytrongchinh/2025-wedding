import { atom } from "recoil";
import storage from "@/utils/storage";
let zaloInfo = (async function () {
	if (import.meta.env.MODE == "development") {
		return import.meta.env.VITE_USER_TOKEN || "";
	} else {
		return null;
	}
})();

export const zaloAtom = atom({
	key: storage.getKey("zaloInfo"),
	default: zaloInfo,
});
