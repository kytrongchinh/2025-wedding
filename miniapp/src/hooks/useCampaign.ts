// src/hooks/useCampaign.ts
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userAtom } from "@/stores/user";
import adtimabox from "@/services/adtimabox";
import storage from "@/utils/storage";
import { formatTime } from "@/utils/time";
import {
	ROUTERS,
	ROUTRERS_NEED_AUTH,
	ROUTRERS_NEED_FOLLOW_OA,
	ROUTRERS_USER_CANNOT_ACCESS_AFTER_CAMPAIGN_END,
	ROUTRERS_USER_CANNOT_ACCESS_BEFORE_CAMPAIGN_START,
} from "@/types/contants";
import { campaignAtom } from "@/stores/campaign";
import { paramsAtom } from "@/stores/params";
import { modalAtom } from "@/stores/modal";
import { MODAL_NAME, MY_ROUTERS } from "@/types/enums";
import { loadMyMessage, MESSAGE_TEMPLATES } from "@/types/messages";

const useCampaign = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [user, setUser] = useRecoilState(userAtom);

	const [campaign, setCampaign] = useRecoilState(campaignAtom);
	const [, setComModal] = useRecoilState(modalAtom);
	const [, setMParams] = useRecoilState(paramsAtom);

	useEffect(() => {
		const initialCampaign = async () => {
			if (!campaign) {
				const m_campaign = await adtimabox.getCampaignDetail();
				let campaignInfo = {};
				if (m_campaign?.data && m_campaign.statusCode === 200) {
					campaignInfo = m_campaign?.data;
					await storage.setStorage("campaignInfo", campaignInfo);
					setCampaign(campaignInfo);
					checkCampaign(campaignInfo);
				}
			} else {
				checkCampaign(campaign);
			}
		};

		const checkCampaign = async (campaign: any) => {
			// console.log(`campaign==>`, campaign);
			if (campaign) {
				const startDate = campaign?.startDateTimestamp || formatTime(campaign?.startDate || "2025-02-02", "x");
				const endDate = campaign?.endDateTimestamp || formatTime(campaign?.endDate || "2025-02-28", "x");
				const current = formatTime(Date.now(), "x");
				if (ROUTRERS_USER_CANNOT_ACCESS_BEFORE_CAMPAIGN_START.includes(location.pathname as MY_ROUTERS)) {
					if (current < startDate) {
						setComModal((prevState) => ({
							...prevState,
							open: true,
							name: MODAL_NAME.NOTI,
							content: loadMyMessage(MESSAGE_TEMPLATES.START_END_CAMPAIGN, {
								startDate: formatTime(campaign?.startDate || "2025-02-02", "DD/MM/YYYY"),
								endDate: formatTime(campaign?.endDate || "2025-02-02", "DD/MM/YYYY"),
							}),
						}));
						await storage.removeStorage("campaignInfo");
						setCampaign(null);
						return navigate(ROUTERS.TNC, { replace: true });
					}
				}

				if (ROUTRERS_USER_CANNOT_ACCESS_AFTER_CAMPAIGN_END.includes(location.pathname as MY_ROUTERS)) {
					if (current > endDate) {
						// console.log(`==>22222`);
						setComModal((prevState) => ({
							...prevState,
							open: true,
							name: MODAL_NAME.NOTI,
							content: loadMyMessage(MESSAGE_TEMPLATES.START_END_CAMPAIGN, {
								startDate: formatTime(campaign?.startDate || "2025-02-02", "DD/MM/YYYY"),
								endDate: formatTime(campaign?.endDate || "2025-02-02", "DD/MM/YYYY"),
							}),
						}));
						return navigate(ROUTERS.TNC, { replace: true });
					}
				}

				if (ROUTRERS_NEED_AUTH.includes(location.pathname as MY_ROUTERS)) {
					if (!user) {
						setMParams((preParams) => ({
							...preParams,
							redirect: location.pathname,
						}));
						return navigate(ROUTERS.HOME, { replace: true });
					}

					if (user?.isCheat && user?.levelBlock !== 0) {
						return navigate(ROUTERS.TNC, { replace: true });
					}
				}

				if (ROUTRERS_NEED_FOLLOW_OA.includes(location.pathname as MY_ROUTERS)) {
					if (user && user?.doneForm === 1) {
						if (!user?.uId || !user?.isFollow) {
							setComModal((prevState) => ({
								...prevState,
								open: true,
								name: MODAL_NAME.FOLLOW,
								content: MESSAGE_TEMPLATES.FOLLOW_OA,
							}));
							return navigate(ROUTERS.HOME);
						}
					}
				}
			} else {
				setCampaign(null);
				return navigate(ROUTERS.HOME, { replace: true });
			}
		};

		initialCampaign();
	}, [location.pathname]);
};

export default useCampaign;
