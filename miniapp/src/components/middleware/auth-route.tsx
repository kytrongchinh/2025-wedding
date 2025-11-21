import React, { FC } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthRouteProps {
	user: any;
	children: JSX.Element;
}

const AuthRoute: FC<AuthRouteProps> = ({ user, children }) => {
	const location = useLocation();

	if (!user) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}
	return children;
};

export default AuthRoute;
