import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import { createPinia } from "pinia";
const pinia = createPinia();

const app = createApp(App).use(pinia).use(router).use(i18n);

router
	.isReady()
	.then(() => app.mount("#app"))
	.catch((e: Error) => {
		console.log(e);
	});
