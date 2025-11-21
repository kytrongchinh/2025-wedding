import { atom } from "recoil";

export const seoAtom = atom({
	key: "SEO",
	default: {
		title: "MY MINIAPP",
		description: "ADTIMA",
		key_word: "ADTIMA",
		type: `campaign`,
		thumb: ``,
	},
});
