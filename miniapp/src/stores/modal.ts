import { atom } from "recoil";

export const modalAtom = atom({
	key: "commonModal",
	default: {
		name: "default",
		open: false,
		modalOA: false,
		content: ``,
		noted: ``,
	},
});
