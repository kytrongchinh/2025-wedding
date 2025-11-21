import { atom, selector } from "recoil";
import storage from "@/utils/storage";
async function initializeAdtimaAtom() {
	const userInfo = (await storage.getStorage("userInfo")) || null;
	return userInfo;
}

const userAtom = atom({
	key: storage.getKey("userInfo"),
	default: initializeAdtimaAtom(),
});

export { userAtom };
