import { axios } from "./config.js";

export default {
	// Auth
	loginApi: (params: any) => axios.post("login", params),
	logoutApi: (sid: string) => axios.post("logout", { sid }),
};
