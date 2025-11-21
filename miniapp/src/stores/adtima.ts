import { atom } from "recoil";
import storage from "@/utils/storage";
async function initializeAdtimaAtom() {
	const adtimaInfo = (await storage.getStorage("adtimaInfo")) || null;
	return adtimaInfo;
}

const adtimaAtom = atom({
	key: storage.getKey("adtimaInfo"),
	default: initializeAdtimaAtom(),
});

// If you need to use the adtimaAtom elsewhere, you can export it:
export { adtimaAtom };
