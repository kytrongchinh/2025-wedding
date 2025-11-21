import { useState, useEffect } from "react";

import _ from "lodash";

const useBrowser = () => {
	const [browser, setBrowser] = useState("Unknown Browser");

	useEffect(() => {
		const userAgent = window.navigator.userAgent;
		const test = (regexp: RegExp) => regexp.test(userAgent);

		if (test(/zalo/i)) setBrowser("Zalo Browser");
		else if (test(/opr\//i)) setBrowser("Opera");
		else if (test(/edg/i)) setBrowser("Microsoft Edge");
		else if (test(/chrome|chromium|crios/i)) setBrowser("Google Chrome");
		else if (test(/firefox|fxios/i)) setBrowser("Mozilla Firefox");
		else if (test(/safari/i) && !test(/chrome|chromium|crios/i)) setBrowser("Apple Safari");
		else if (test(/trident/i)) setBrowser("Microsoft Internet Explorer");
		else if (test(/ucbrowser/i)) setBrowser("UC Browser");
		else if (test(/samsungbrowser/i)) setBrowser("Samsung Browser");
	}, []);

	return browser;
};

export default useBrowser;
