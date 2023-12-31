import messages from "@intlify/unplugin-vue-i18n/messages";
import { createI18n } from "vue-i18n";

// @ts-expect-error
export const i18n = new createI18n({
	locale: import.meta.env.VITE_APP_I18N_LOCALE || "en",
	fallbackLocale: import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE || "en",
	messages,
});

export function $t(key = "", multiCount: any = 0) {
	return multiCount ? i18n.global.t(key, multiCount) : i18n.global.t(key);
}
