import React, { FC } from "react";
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import HomePage from "pages/home";
import TnC from "pages/tnc";
import DefaultLayout from "@/components/layout/default";

import _ from "lodash";

import { MY_ROUTERS_DEFAULT } from "@/types/enums";
import Personal from "@/pages/personal";
import useAuth from "@/hooks/useAuth";
import Form from "@/pages/form";
import AuthRoute from "./middleware/auth-route";
import Luckydraw from "@/pages/luckydraw";

export const RouterCustom: FC = () => {
	const location = useLocation();
	const { handleLogin, handleLogout, user } = useAuth();

	const routes = useRoutes([
		{
			path: "/",
			element: <DefaultLayout />,
			children: [
				{ path: MY_ROUTERS_DEFAULT.HOME, element: <HomePage handleOnClickLogin={handleLogin} handleLogout={handleLogout} /> },
				{ path: MY_ROUTERS_DEFAULT.TNC, element: <TnC /> },
				{ path: MY_ROUTERS_DEFAULT.PERSONAL, element: <Personal /> },
				// { path: MY_ROUTERS_DEFAULT.LUCKYDRAW, element: <Luckydraw /> },
				{
					path: MY_ROUTERS_DEFAULT.FORM,
					element: (
						<AuthRoute user={user}>
							<Form />
						</AuthRoute>
					),
				},
				{
					path: MY_ROUTERS_DEFAULT.LUCKYDRAW,
					element: (
						<AuthRoute user={user}>
							<Luckydraw />
						</AuthRoute>
					),
				},
			],
		},

		// { path: "/login", element: <TnC /> }, // No layout
		// Nếu route không tồn tại, chuyển về Home
		{ path: "*", element: <Navigate to="/" replace /> },
	]);
	return routes;
};
