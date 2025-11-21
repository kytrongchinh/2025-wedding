import { useState, useEffect } from "react";

import _ from "lodash";

const useOS = () => {
	const [os, setOS] = useState("Unknown");

	useEffect(() => {
		const userAgent = window.navigator.userAgent;
		const platform = (window.navigator as any)?.userAgentData?.platform || window.navigator.platform;
		const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
		const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
		const iosPlatforms = ["iPhone", "iPad", "iPod"];

		if (macosPlatforms.includes(platform)) setOS("MacOS");
		else if (iosPlatforms.includes(platform)) setOS("iOS");
		else if (windowsPlatforms.includes(platform)) setOS("Windows");
		else if (/Android/.test(userAgent)) setOS("Android");
		else if (/Linux/.test(platform)) setOS("Linux");
	}, []);

	return os;
};
export default useOS;
