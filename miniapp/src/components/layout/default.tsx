import React, { FC, useEffect } from "react";
import { Outlet } from "react-router-dom";
import HeaderSection from "./header";
import { Helmet } from "react-helmet-async";

import { useRecoilValue, useRecoilState } from "recoil";
import { seoAtom } from "@/stores/seo";
import useCheckExpiredTime from "@/hooks/useCheckExpiredTime";
import useLoadProfile from "@/hooks/useLoadProfile";
import useLoadParams from "@/hooks/useLoadParams";
import useCampaign from "@/hooks/useCampaign";
import useCheckSystem from "@/hooks/useCheckSystem";
import CommonModal from "../modals/common";
import { useNavigate } from "react-router-dom";
import { modalAtom } from "@/stores/modal";
import { MODAL_NAME } from "@/types/enums";
import zaloApi from "@/services/miniapp/zalo";
import adtimabox from "@/services/adtimabox";
import { adtimaAtom } from "@/stores/adtima";
import storage from "@/utils/storage";
import userApi from "@/services/miniapp/user";
import { userAtom } from "@/stores/user";
import _ from "lodash";
import { ROUTERS } from "@/types/contants";
import { zaloAtom } from "@/stores/zalo";
import Menu from "./menu";
import "./default.scss";

const DefaultLayout: FC = () => {
	const navigate = useNavigate();
	const seo = useRecoilValue(seoAtom);
	useCheckSystem();
	useLoadParams();
	useCheckExpiredTime();
	useLoadProfile();
	useCampaign();
	const [com_modal, setComModal] = useRecoilState(modalAtom);
	const adtima = useRecoilValue(adtimaAtom);
	const [user, setUser] = useRecoilState(userAtom);
	const zalo = useRecoilValue(zaloAtom);
	useEffect(() => {
		console.log("Load Layout");
	}, []);

	const hanldeCloseModalCommon = async () => {
		if (com_modal?.name == MODAL_NAME.FOLLOW) {
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
		} else if (com_modal?.name == MODAL_NAME.UPDATE_ZALO) {
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
			await zaloApi.requestUpdateZalo();
		} else {
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
		}
	};

	const handleModalActionClick = async () => {
		if (com_modal?.name == MODAL_NAME.FOLLOW) {
			let follow = await zalo.followOA();
			if (import.meta.env.MODE == "development") {
				follow = true;
			}
			if (follow) {
				const up_user = await adtimabox.updateProfile(adtima?.accessToken, { isFollow: true });
				if (_.isObject(up_user)) {
					await storage.setStorage("userInfo", up_user);
					setUser(up_user);
				}
			} else {
				navigate(ROUTERS.FORM, { replace: true });
			}
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
		} else if (com_modal?.name == MODAL_NAME.PHONE_PERMISSION) {
			const phone_token = await userApi.getPhoneNumber();
			if (phone_token?.token) {
				// call server get phone
				const phone: any = await adtimabox.myLocationPhone(adtima?.accessToken, zalo, phone_token?.token);
				if (phone?.number && phone?.existPhone == 0) {
					const number = phone?.number;
					const phone_v = number.replace(/^84/, "0");
					let up_user = { ...user };
					up_user.phone = phone_v;
					await storage.setStorage("userInfo", up_user);
					setUser(up_user);
				}
			}
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
		} else if (com_modal?.name == MODAL_NAME.UPDATE_ZALO) {
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
			await zaloApi.requestUpdateZalo();
		} else {
			setComModal((prevState) => ({ ...prevState, name: MODAL_NAME.DEFAULT, open: false, modalOA: false, content: ``, noted: `` }));
		}
	};

	return (
		<>
			<HeaderSection title={seo?.title || "ADTIMA"} />
			<Helmet>
				<meta charSet="utf-8" />
				<title>{seo?.title ? `${seo?.title.toUpperCase()}` : "ADTIMA"}</title>

				<meta name="description" content={seo?.description || "ADTIMA"}></meta>

				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" viewport-fit="cover"></meta>

				<meta property="og:title" content={seo?.title ? `${seo?.title.toUpperCase()}` : "ADTIMA"} />
				<meta property="og:description" content={seo?.description || "ADTIMA"} />

				<meta property="og:image" content={seo?.thumb} />
				<meta property="og:image:alt" content={seo?.thumb} />
				<meta property="og:type" content={seo?.type} />
			</Helmet>
			<CommonModal
				modalIsOpen={com_modal.open}
				name={com_modal?.name}
				onClose={hanldeCloseModalCommon}
				handleModalActionClick={handleModalActionClick}
				content={com_modal?.content}
				noted={com_modal?.noted}
			/>
			<div className={`LayoutStructure`}>
				<div className="container  h-screen overflow-y-auto ">
					<div className="page-content App">
						<div className="body-content px-5 pt-2">
							<main>
								<Outlet />
							</main>
						</div>
					</div>
				</div>
			</div>
			<Menu handleOnClickLogin={() => {}} />
		</>
	);
};

export default DefaultLayout;
