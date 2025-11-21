import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { ROUTERS } from "@/types/contants";
import clsx from "clsx";
import { userAtom } from "@/stores/user";
import { useRecoilValue } from "recoil";
// import { GAevent, ACTIONS } from "@/libs/zmp_ga";
import { Icon } from "zmp-ui";

const Menu = ({ handleOnClickLogin }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const user = useRecoilValue(userAtom);
	const isActive = (path: string) => {
		const text = JSON.stringify([ROUTERS.HOME, ROUTERS.PERSONAL, ROUTERS.TNC]);
		if (path != text) {
			if (path == ROUTERS.HOME && (location.pathname === ROUTERS.FORM || location.pathname === ROUTERS.HOME)) {
				return true;
			} else {
				return location.pathname === path;
			}
		} else {
			path = JSON.parse(path);
			return path.includes(location.pathname);
		}
	};
	const [activeItem, setActiveItem] = useState(2);

	const handleGoto = (item: { id: string | any; path: string }) => {
		setActiveItem(item?.id);
		try {
			if (user) {
				return navigate(item?.path, { replace: true });
			} else {
				if (item?.path == ROUTERS.PERSONAL) {
					handleOnClickLogin(item?.path);
				} else {
					return navigate(item?.path, { replace: true });
				}
			}
		} catch (error) {
			console.log("handleGoto error :>> ", error);
			navigate(ROUTERS.HOME, { replace: true });
		}
	};

	const list = [
		{
			id: 1,
			// img: profile,
			name: "Cá nhân",
			icon: "zi-user" as const,
			// img_active: profile_active,
			path: ROUTERS.PERSONAL,
		},
		{
			id: 2,
			// img: home,
			name: "Trang chủ",
			icon: "zi-home" as const,
			// img_active: home_active,
			path: ROUTERS.HOME,
		},
		{
			id: 3,
			// img: tnc,
			name: "Thể lệ",
			icon: "zi-file" as const,
			// img_active: tnc_active,
			path: ROUTERS.TNC,
		},
	];

	return (
		// <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
		// 	<div className="flex justify-around items-center py-2">
		// 		{list.map((item, i) => {
		// 			return (
		// 				<a onClick={() => handleGoto(item)} key={item.id} className={clsx({ active: isActive(item.path) }, "item")}>
		// 					{/* {activeItem == item?.id && <img src={item.img_active} alt="" />} */}
		// 					{/* {activeItem != item?.id && <img src={item.img} alt="" />} */}
		// 					{item?.name}
		// 				</a>
		// 			);
		// 		})}
		// 	</div>
		// </div>
		<div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200">
			<div className="flex justify-around items-center py-2">
				{list.map((item) => (
					<button
						key={item.id}
						onClick={() => handleGoto(item)}
						className={clsx({ active: isActive(item.path) }, "flex flex-col items-center px-4 py-2 item")}
						// className={`flex flex-col items-center px-4 py-2 ${activeItem === item.id ? "text-blue-500" : "text-gray-500"}`}
					>
						<Icon icon={item?.icon} className="text-2xl" />
						<span className="text-sm uppercase">{item.name}</span>
					</button>
				))}
			</div>
		</div>
	);
};

export default Menu;
