import { useEffect } from "react";
import _ from "lodash";
import BasicApi from "@/services/miniapp/basic";
import { useRecoilState } from "recoil";
import { modalAtom } from "@/stores/modal";
import { MESSAGE_TEMPLATES } from "@/types/messages";
import { MODAL_NAME } from "@/types/enums";
const useCheckSystem = () => {
	const [, setComModal] = useRecoilState(modalAtom);
	useEffect(() => {
		const fetchParams = async () => {
			const system_info: boolean | any = await BasicApi.getSystemInfo();
			// console.log(`system_info==>`, system_info);
			if (system_info) {
				const { version, apiVersion, zaloVersion, platform, language } = system_info;

				if (platform == "iOS" && zaloVersion) {
					if (zaloVersion < 644) {
						setComModal((prevState) => ({
							...prevState,
							open: true,
							name: MODAL_NAME.UPDATE_ZALO,
							content: MESSAGE_TEMPLATES.NOT_SUPPORT_ZALO_VERSION,
						}));
					}
				}
				if (platform == "android" && zaloVersion) {
					if (zaloVersion < 724) {
						setComModal((prevState) => ({
							...prevState,
							open: true,
							name: MODAL_NAME.UPDATE_ZALO,
							content: MESSAGE_TEMPLATES.NOT_SUPPORT_ZALO_VERSION,
						}));
					}
				}
			}
		};
		fetchParams();
	}, []); // Empty dependency array to run only on mount
};

export default useCheckSystem;
