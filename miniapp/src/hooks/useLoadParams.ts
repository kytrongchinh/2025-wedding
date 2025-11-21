import { useEffect, useState } from "react";
import _ from "lodash";
import RoutingApi from "@/services/miniapp/routing";
import { paramsAtom } from "@/stores/params";
import { useRecoilState } from "recoil";
const useLoadParams = () => {
	const [mparams, setMParams] = useRecoilState(paramsAtom);
	useEffect(() => {
		const fetchParams = async () => {
			let params: any = await RoutingApi.getRouteParams();
			if (import.meta.env.MODE === "development") {
				if (_.isEmpty(params)) {
					params = {
						version: "zdev-72b7d865",
						transid: "66a38a7d4e84f1ec212c7bf0",
						// redirect: "quiz-start"
					};
				}
			}
			if (!_.isEmpty(params)) {
				setMParams(params);
			}
			if (params && params?.env) {
				window.APP_CONFIG["ADTIMA_ENV_SET"] = params?.env;
			}
			// Uncomment this block if you want to handle redirection
			// if (params && params?.redirect) {
			//   if (my_campaign.checkListUrlRedirect(params?.redirect)) {
			//     navigate(`/${params?.redirect}`, { replace: true });
			//   }
			// }
		};
		fetchParams();
		// console.log(`==>Load params: ${JSON.stringify(mparams)}`);
	}, []); // Empty dependency array to run only on mount

	return mparams;
};

export default useLoadParams;
