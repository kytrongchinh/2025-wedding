// src/hooks/useSeo.ts
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { seoAtom } from "@/stores/seo";

type UseSeoProps = {
	title?: string;
	description?: string;
	key_word?: string;
	type?: string;
	thumb?: string;
};

const useSeo = (data: UseSeoProps) => {
	const setSeo = useSetRecoilState(seoAtom);
	useEffect(() => {
		setSeo((prev) => ({ ...prev, ...data }));
	}, [data, setSeo]);
};

export default useSeo;
