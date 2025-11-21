import React, { FC, useEffect } from "react";
import HeaderSection from "./header";
import { MainSectionProps } from "@/types/interface";
const MainSection: FC<MainSectionProps> = ({ title = "", description = "", children, bodyClass = "" }) => {
	useEffect(() => {}, []);

	return (
		<>
			<HeaderSection title={title} />
			<meta charSet="utf-8" />
			<title>{title ? `${title.toUpperCase()}` : "ADTIMA"}</title>

			<meta name="description" content={description || "ADTIMA"}></meta>

			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" viewport-fit="cover"></meta>

			<meta property="og:title" content={title ? `${title.toUpperCase()}` : "ADTIMA"} />
			<meta property="og:description" content={description || "ADTIMA"} />

			<meta property="og:image" content={""} />
			<meta property="og:image:alt" content={""} />
			<meta property="og:type" content="campaign" />

			<div className={`LayoutStructure ${bodyClass}`}>
				<div className="container  ">
					<div className="page-content App">
						<div className="body-content">{children}</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MainSection;
