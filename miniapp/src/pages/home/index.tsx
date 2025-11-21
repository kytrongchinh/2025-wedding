import React, { FC } from "react";
import useSeo from "@/hooks/useSeo";
import { CommonProps } from "@/types/interface";
import useAuth from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { MY_ROUTERS } from "@/types/enums";
import useDynamicRecoil from "@/hooks/useDynamicRecoil";

const HomePage: FC<CommonProps> = ({ handleOnClickLogin, handleLogout }) => {
	const { user } = useAuth();
	const { setRecoil } = useDynamicRecoil();
	setRecoil("seo", { title: "Trang chủ", description: "Welcome to the Home Page of My App!" });
	// useSeo({ title: "Trang chủ", description: "Welcome to the Home Page of My App!" });
	return (
		<>
			<h2 className="font-bold  text-2xl text-emerald-700 ">Home page</h2>
			<p className="pb-6 text-justify">
				It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that
				it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop
				publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their
				infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
			</p>

			<div className="text-center justify-center">
				{!user && (
					<div
						className="flex w-10/12 m-auto items-center justify-center text-lg font-medium text-blue-800 bg-gray-100 rounded-md shadow-md p-2"
						onClick={() => handleOnClickLogin()}
					>
						Tham gia ngay
					</div>
				)}
				{user && (
					<div className="flex  items-center justify-center text-lg font-medium text-white bg-green-600 uppercase rounded-md shadow-md p-2">
						<Link to={MY_ROUTERS.FORM} title="Điền thông tin">
							Điền thông tin
						</Link>
					</div>
				)}
			</div>
		</>
	);
};

export default HomePage;
