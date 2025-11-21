import { dataConsent } from "./../types/interface";
import { useCallback } from "react";
import config from "@/configs";
import cmpService from "@/services/cmp/index";
import { HTTP_STATUS_CODE } from "@/types/enums";
import _ from "lodash";
import useOS from "./useOs";
import useBrowser from "./useBrowser";

const useCMPData = () => {
	const platform = useOS(); // Move inside the hook body
	const browser = useBrowser(); // Move inside the hook body

	const loadCMPData = useCallback(
		async (user_id: string) => {
			try {
				const cmpOptions = {
					organization_id: config.CMP_ORGANIZATION_ID,
					term_id: config.CMP_TERM_ID,
					extend_app_id: config.CAMPAIGN_ID,
					extend_app_name: config.CAMPAIGN_NAME,
					extend_id: user_id,
					platform: platform,
					browser: browser,
				};
				const cmpResult = await cmpService.getCmpTerms(cmpOptions);
				if (cmpResult?.statusCode !== HTTP_STATUS_CODE.OK) throw new Error("CMP Error");

				const applicationTerm: any = cmpResult.data;
				const termList = applicationTerm?.term?.record[0]?.term_properties;
				if (!_.isArray(termList)) throw new Error("CMP Error");

				const applicationCmp = {
					mappingKey: applicationTerm?.data_obs,
					termListIds: termList.map((term) => term._id),
					termList: [...termList],
					termCheckList: {},
					requestData: cmpOptions,
				};

				termList.forEach((term) => {
					applicationCmp["termCheckList"][term._id] = {
						property_id: term._id,
						property_value: false,
						property_type: term.type,
						property_name: term.name,
					};
				});

				return applicationCmp;
			} catch (error) {
				console.error("CMP Data Load Error:", error);
				return null;
			}
		},
		[platform, browser]
	); // Add dependencies for consistency

	const postConsents = useCallback(async (cmpData: dataConsent) => {
		try {
			const convertData = {
				organization_id: cmpData.organization_id,
				mapping_key: cmpData.mapping_key,
				extend_app_id: cmpData.extend_app_id,
				extend_app_name: cmpData.extend_app_name,
				extend_uid: cmpData.extend_uid,
				term_id: cmpData.term_id,
				property_last_data: cmpData.property_last_data,
				last_platform: cmpData.last_platform,
				last_browser: cmpData.last_browser,
			};
			const adtimaResponse = await cmpService.sendConsent(convertData);
			return !!adtimaResponse;
		} catch (error) {
			console.error("Consent Submission Error:", error);
			return false;
		}
	}, []);

	return { loadCMPData, postConsents };
};

export default useCMPData;
