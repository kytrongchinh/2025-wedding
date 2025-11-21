import React from "react";

import { App, SnackbarProvider } from "zmp-ui";
import { RecoilRoot } from "recoil";
import { RouterCustom } from "./router-custom";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
const MyApp = () => {
	if (import.meta.env.MODE == "development") {
		return (
			<RecoilRoot>
				<HelmetProvider>
					<BrowserRouter>
						<App>
							<SnackbarProvider>
								<RouterCustom />
							</SnackbarProvider>
						</App>
					</BrowserRouter>
				</HelmetProvider>
			</RecoilRoot>
		);
	} else {
		return (
			<RecoilRoot>
				<HelmetProvider>
					<BrowserRouter basename="/zapps/1693320389355495688">
						<App>
							<SnackbarProvider>
								<RouterCustom />
							</SnackbarProvider>
						</App>
					</BrowserRouter>
				</HelmetProvider>
			</RecoilRoot>
		);
	}
};
export default MyApp;
