import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import storage from "@/utils/storage";
import adtimabox from "@/services/adtimabox";

// // Định nghĩa kiểu dữ liệu cho adtima
// interface Adtima {
// 	expiredTime: number;
// 	[key: string]: any; // Để cho phép các thuộc tính khác nếu cần
// }
// interface User {
// 	[key: string]: any; // Để cho phép các thuộc tính khác nếu cần
// }

// // Định nghĩa props cho hook
// interface UseCheckExpiredTimeProps {
// 	adtima: Adtima | null;
// 	user: User | null;
// 	setZalo: React.Dispatch<React.SetStateAction<any>>;
// 	setAdtima: React.Dispatch<React.SetStateAction<Adtima | null>>;
// 	setUser: React.Dispatch<React.SetStateAction<any>>;
// 	setAuthorize: React.Dispatch<React.SetStateAction<any>>;
// }
import { adtimaAtom } from "@/stores/adtima";
import { userAtom } from "@/stores/user";
import { zaloAtom } from "@/stores/zalo";
import { authorizeAtom } from "@/stores/authorize";
import { useRecoilState } from "recoil";
const useLoadProfile = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [user, setUser] = useRecoilState(userAtom);
	const [, setZalo] = useRecoilState(zaloAtom);
	const [adtima, setAdtima] = useRecoilState(adtimaAtom);
	const [, setAuthorize] = useRecoilState(authorizeAtom);

	useEffect(() => {
		const loadProfile = async () => {
			if (adtima && user) {
				const my_user = await adtimabox.getMe(adtima?.accessToken);
				if (!my_user) {
					await storage.removeStorage("zaloInfo");
					setZalo(null);
					await storage.removeStorage("adtimaInfo");
					setAdtima(null);
					await storage.removeStorage("userInfo");
					setUser(null);
					await storage.removeStorage("authorizeInfo");
					setAuthorize(null);
					return navigate("/", { replace: true });
				}

				await storage.setStorage("userInfo", my_user?.data);
				setUser(my_user?.data);
			}
		};
		loadProfile();
	}, []);
	// chỉ chạy lần đầu
};

export default useLoadProfile;
