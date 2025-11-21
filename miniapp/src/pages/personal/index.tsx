import useAuth from "@/hooks/useAuth";
import useSeo from "@/hooks/useSeo";
import { MY_ROUTERS } from "@/types/enums";
import { convertDate } from "@/utils/base";
import React, { FC } from "react";
import { Link } from "react-router-dom";

const Personal: FC = () => {
	useSeo({ title: "Cá nhân" });
	const { user, handleLogout } = useAuth();
	return (
		<>
			<div className="p-4 bg-white shadow-md rounded-lg max-w-sm mx-auto mb-5">
				<div className="flex flex-col items-center space-y-4">
					<img src={user?.avatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg" />
					<p className="text-lg font-medium text-gray-700">ID: {user?.aId}</p>
					<p className="text-lg font-medium text-gray-700">Name: {user?.name}</p>
					<p className="text-sm text-gray-500">Created: {convertDate(user?.createdAt, "DD/MM/YYYY HH:mm")}</p>
					<div className="text-black-1000">
						<div className="text-red-800" onClick={() => handleLogout()}>
							Thoát
						</div>
					</div>
				</div>
			</div>
			<div className="flex  items-center justify-center text-lg font-medium text-white bg-green-600 uppercase rounded-md shadow-md p-2">
				<Link to={MY_ROUTERS.LUCKYDRAW} title="Quay số may mắn">
					Quay số may mắn
				</Link>
			</div>
		</>
	);
};

export default Personal;
