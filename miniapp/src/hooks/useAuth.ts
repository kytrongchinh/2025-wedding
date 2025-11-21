import { useCallback, useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userAtom } from "@/stores/user";
import { zaloAtom } from "@/stores/zalo";
import { adtimaAtom } from "@/stores/adtima";
import { paramsAtom } from "@/stores/params";
import storage from "@/utils/storage";
import auth from "@/services/auth";
import _ from "lodash";
import { checkListUrlRedirect, checkListUrlRedirectCustom } from "@/utils/base";
import { MY_ROUTERS } from "@/types/enums";


interface MParams {
	[key: string]: any;
}

const useAuth = () => {
	const navigate = useNavigate();
	const [user, setUser] = useRecoilState(userAtom);
	const [, setZalo] = useRecoilState(zaloAtom);
	const [, setAdtima] = useRecoilState(adtimaAtom);
	const [mparams, setMParams] = useRecoilState<MParams>(paramsAtom);
	const [isProcessing, setIsProcessing] = useState(false);

	const location = useLocation();

	const my_path = `${location.state?.from?.pathname}${location.state?.from?.search}`;

	/** Memoized function to update processing state */
	const setLoadProcess = useCallback((stateValue = false) => {
		setIsProcessing(stateValue);
	}, []);

	/** Memoized user authentication handler */
	const handleLogin = useCallback(
		async (to: string = "") => {
			if (isProcessing) return;
			try {
				setLoadProcess(true);

				const dataFromStorage = await storage.getStorage("adtimaInfo");
				const userAuth = await auth.getAuthenticationInfo(dataFromStorage || null);
				if (!userAuth) throw new Error("Authentication failed");

				// Store authentication tokens
				setAdtima(userAuth.token);
				setUser(userAuth.infor);
				setZalo(userAuth.zmpToken);
				await storage.setStorage("adtimaInfo", userAuth.token);
				await storage.setStorage("userInfo", userAuth.infor);
				console.log(`my_path==>`, my_path);
				if (my_path) {
					return navigate(my_path, { replace: true });
				}
				// Determine the redirect route
				let redirectTo = to || MY_ROUTERS.HOME; // Default redirect
				if (mparams?.redirect) {
					if (checkListUrlRedirectCustom(mparams.redirect)) {
						setMParams((prev) => ({ ...prev, redirect: null }));
						redirectTo = mparams.redirect;
					} else if (checkListUrlRedirect(mparams.redirect)) {
						redirectTo = `/${mparams.redirect}`;
					}
				} else {
					redirectTo = auth.getRouteByUserInfo(userAuth.infor);
				}

				navigate(redirectTo, { replace: true });
			} catch (error) {
				console.error("handleLogin error:", error);

				// Reset authentication states
				setAdtima(null);
				setUser(null);
				setZalo(null);
				await storage.removeStorage("adtimaInfo");
				await storage.removeStorage("userInfo");
				await storage.clearAll();
			} finally {
				setLoadProcess(false);
			}
		},
		[isProcessing, setUser, setAdtima, setZalo, setMParams, navigate]
	);

	/** Memoized logout handler */
	const handleLogout = useCallback(async () => {
		try {
			setAdtima(null);
			setUser(null);
			setZalo(null);

			await storage.removeStorage("adtimaInfo");
			await storage.removeStorage("userInfo");
			await storage.clearAll();

			navigate(MY_ROUTERS.HOME, { replace: true });
		} catch (error) {
			console.error("handleLogout error:", error);
		}
	}, [setAdtima, setUser, setZalo, navigate]);

	/** Memoize the user data to prevent unnecessary re-renders */
	const memoizedUser = useMemo(() => user, [user]);

	return { handleLogin, handleLogout, isProcessing, user: memoizedUser };
};

export default useAuth;
