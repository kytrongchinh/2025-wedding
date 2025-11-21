import { atom } from "recoil";

export const langAtom = atom({
	key: "langAtom",
	default: "vn",
});

export const loadingAtom = atom({
	key: "loadingAtom",
	default: false,
});

export const articlesAtom = atom({
	key: "articlesAtom",
	default: [],
});
