import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import storage from "@/utils/storage";
import { formatTime } from "@/utils/time";
import { adtimaAtom } from "@/stores/adtima";
import { userAtom } from "@/stores/user";
import { zaloAtom } from "@/stores/zalo";
import { authorizeAtom } from "@/stores/authorize";
import { useRecoilState } from "recoil";

const useCheckExpiredTime = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [user, setUser] = useRecoilState(userAtom);
	const [zalo, setZalo] = useRecoilState(zaloAtom);
	const [adtima, setAdtima] = useRecoilState(adtimaAtom);
	const [authorize, setAuthorize] = useRecoilState(authorizeAtom);

	useEffect(() => {
		console.log("path to =>> ", location.pathname);
		// console.log("adtima to =>> ", adtima);
		const checkExpiredTime = async () => {
			if (adtima) {
				const current = Number(formatTime(Date.now(), "x")) / 1000;

				if (adtima?.expiredTime < current) {
					// clear cache
					await storage.removeStorage("zaloInfo");
					setZalo(null);
					await storage.removeStorage("adtimaInfo");
					setAdtima(null);
					await storage.removeStorage("userInfo");
					setUser(null);
					await storage.removeStorage("authorizeInfo");
					setAuthorize(null);
					await storage.clearAll();
					// Điều hướng về trang chủ
					navigate("/", { replace: true });
				}
			}
		};

		checkExpiredTime();
	}, [location.pathname]);
	// Chạy lại khi `location.pathname` thay đổi
};

export default useCheckExpiredTime;
