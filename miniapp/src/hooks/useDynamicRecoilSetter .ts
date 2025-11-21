import { useRecoilValue, useRecoilState, RecoilState } from "recoil";
import { userAtom } from "@/stores/user";
import { adtimaAtom } from "@/stores/adtima";
import { campaignAtom } from "@/stores/campaign";
import { modalAtom } from "@/stores/modal";
import { paramsAtom } from "@/stores/params";
import { seoAtom } from "@/stores/seo";
import { zaloAtom } from "@/stores/zalo";
import { useEffect } from "react";

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

const useDynamicRecoilSetter = <T>(atomName: AtomKeys, value: T) => {
	const [, setAtom] = useRecoilState(atoms[atomName]);
	useEffect(() => {
		setAtom(value);
	}, []);
};

export default useDynamicRecoilSetter;
