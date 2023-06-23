import { getSessionStorageReac } from "@/assets/js/helpers";
import axios from "axios";

// Handles DEV and PROD
export const baseURL = import.meta.env.VITE_APP_ROOT_API;
const instance = axios.create({
	baseURL,
});

instance.interceptors.request.use((config) => {
	handleRequestInterceptor(config);

	return config;
});

function handleRequestInterceptor(config: any) {
	try {
		const sid = getSessionStorageReac("sid")?.value;
		if (config.params) {
			config.params.sid = sid;
		} else {
			config.params = {
				sid,
			};
		}
	} catch (err: any) {
		console.error("ERRor", err.message);
	}
}

export { instance as axios };
