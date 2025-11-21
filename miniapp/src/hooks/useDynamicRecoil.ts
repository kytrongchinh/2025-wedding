import { useEffect } from "react";
import { useRecoilState, useRecoilValue, RecoilState } from "recoil";
import { userAtom } from "@/stores/user";
import { adtimaAtom } from "@/stores/adtima";
import { campaignAtom } from "@/stores/campaign";
import { modalAtom } from "@/stores/modal";
import { paramsAtom } from "@/stores/params";
import { seoAtom } from "@/stores/seo";
import { zaloAtom } from "@/stores/zalo";

type AtomKeys = "user" | "adtima" | "campaign" | "modal" | "params" | "seo" | "zalo";

const atoms: Record<AtomKeys, RecoilState<any>> = {
	user: userAtom,
	adtima: adtimaAtom,
	campaign: campaignAtom,
	modal: modalAtom,
	params: paramsAtom,
	seo: seoAtom,
	zalo: zaloAtom,
};

const useDynamicRecoil = () => {
	/**
	 * Example: getRecoil("seo");
	 * */
	const getRecoil = <T>(atomName: AtomKeys): T => {
		return useRecoilValue(atoms[atomName]) as T;
	};
	/**
	 * Example: setRecoil("seo", { title: "Trang chủ", description: "Welcome to the Home Page of My App!" });
	 * */
	const setRecoil = <T>(atomName: AtomKeys, value: T) => {
		const [, setAtom] = useRecoilState(atoms[atomName]);
		useEffect(() => {
			setAtom(value);
		}, []);
	};
	/**
	 * Example: const [user, setUser] = useDynamicRecoilState<{ name: string }>("user");
	 * */
	const myDynamicRecoilState = <T>(atomName: AtomKeys): [T, (value: T) => void] => {
		return useRecoilState(atoms[atomName]);
	};

	return { getRecoil, setRecoil };
};

export default useDynamicRecoil;
