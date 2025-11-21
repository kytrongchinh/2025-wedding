import React, { FC, useEffect, useState } from "react";
import { Icon } from "zmp-ui";
import { useLocation, useNavigate } from "react-router-dom";
import "./header.scss";
import { LIST_ROUTER_DISABLE, LIST_ROUTER_GO_BACK, LIST_ROUTER_TO_HOME, LIST_ROUTER_TO_ROUTER, ROUTERS } from "@/types/contants";
import { modalAtom } from "@/stores/modal";

import { useRecoilState } from "recoil";
import { MESSAGE_TEMPLATES } from "@/types/messages";
import { HeaderSectionProps } from "@/types/interface";


const HeaderSection: FC<HeaderSectionProps> = (props) => {
	const { title = "" } = props;
	const location = useLocation();
	const navigate = useNavigate();
	const [head, setHead] = useState("");
	const [, setComModal] = useRecoilState(modalAtom);

	const handleBack = () => {
		try {
			const listRouterGoback: string[] = LIST_ROUTER_GO_BACK;
			const listDisabledRouter: string[] = LIST_ROUTER_DISABLE;
			const listRouterTo: string[] = LIST_ROUTER_TO_ROUTER;
			if (listRouterGoback.includes(location?.pathname)) {
				navigate(-1);
				return;
			}
			if (listRouterTo.includes(location.pathname)) {
				navigate(ROUTERS.PERSONAL, { replace: true });
				return;
			} else if (listDisabledRouter.includes(location.pathname)) {
				setHead("");
			}
			return navigate(ROUTERS.HOME);
		} catch (error) {
			return navigate(ROUTERS.HOME);
		}
	};
	const handleHome = () => {
		try {
			const listRouter: string[] = LIST_ROUTER_TO_HOME;
			if (listRouter.includes(location.pathname)) {
				setComModal((prevState) => ({
					...prevState,
					name: "confirmed-exit",
					open: true,
					modalOA: false,
					content: MESSAGE_TEMPLATES.BACK_TO_HOME,
					noted: ``,
					buttonName: "Đồng ý",
				}));
			} else {
				return navigate(ROUTERS.HOME, { replace: true });
			}
		} catch (error) {
			return navigate(ROUTERS.HOME, { replace: true });
		}
	};

	useEffect(() => {
		const listRouterTo: string[] = LIST_ROUTER_TO_ROUTER;
		const listDisabledRouter: string[] = LIST_ROUTER_DISABLE;
		const listRouterGoback: string[] = LIST_ROUTER_GO_BACK;
		if (listRouterTo.includes(location.pathname)) {
			setHead("back"); // back header for upload and detail-shirt pages
		} else if (listDisabledRouter.includes(location.pathname)) {
			setHead("");
		} else if (listRouterGoback.includes(location.pathname)) {
			setHead("back");
		} else {
			setHead("home"); // default home header for other pages other than template and detail-shirt
		}
		if (location.pathname.indexOf("detail-image/") != -1 || location.pathname.indexOf("detail-video/") != -1 || location.pathname.indexOf("detail-shirt/") != -1) {
			setHead("back"); // back header for upload and detail-shirt pages
		}
	}, [location.pathname]);

	return (
		<>
			<div className="my-header">
				{head == "back" && (
					<div className="my-header-back" onClick={handleBack}>
						<div className="my-header-back-btn my-btn" id="left-buttons">
							<Icon icon="zi-chevron-left-header" />
						</div>
					</div>
				)}
				{head == "home" && (
					<div className="my-header-back" onClick={handleHome}>
						<div className="my-header-back-btn my-btn" id="left-buttons">
							<Icon icon="zi-home" />
						</div>
					</div>
				)}
				<div className="my-header-title uppercase">{title}</div>
			</div>
		</>
	);
};

export default HeaderSection;
