<script setup lang="ts">
import { getLocalStorageReac } from "./assets/js/helpers";
import { type Ref } from "vue";
import { useDefaultStore } from "./store";

const appMetaTitle = "app-site";
const store = useDefaultStore();

function checkSetAppDarkTheme() {
	const settingReac = getLocalStorageReac(
		"app-color-scheme",
		false,
		"auto",
	) as Ref<any>;
	watch(
		settingReac,
		(isSetting: string) => {
			const prefersDark =
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches;
			if (isSetting === "dark" || (prefersDark && isSetting !== "light")) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		},
		{ immediate: true },
	);
}

watch(
	() => store.isMobileView,
	(val) => {
		if (val) document.body.classList.add("is-mobile");
		else if (!val) document.body.classList.remove("is-mobile");
	},
);

onBeforeMount(() => {
	checkSetAppDarkTheme();
});
</script>

<template lang="pug">
teleport(to="head title")
	| {{ appMetaTitle }}
router-view(:class="{ 'is-mobile': store.isMobileToggled }")
</template>

<style lang="scss">
@import "./assets/css/base.css";

body {
	&.is-mobile {
		overflow-y: hidden;
	}
}

#app {
	width: 100vw;
	height: 100%;
}
</style>
