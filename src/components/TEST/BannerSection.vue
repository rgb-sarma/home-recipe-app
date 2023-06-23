<script setup lang="ts">
// @ts-ignore
import { DateInstance } from "@/assets/js/dateHelper";
import { getSessionStorageReac } from "@/assets/js/helpers";
import { $t } from "@/i18n";

const text = `
- Vue 3
- Vue Router 4
- Typescript 5
- Pinia (state management)
- Axios
- Vue-i18n 9 (yaml)
- Sass
- Pug
- Vite 4`;

const form = ref({
	hello: "World Input",
});

const localStorageKey = getSessionStorageReac("helloWorld", false, "Change me");
const currentDate = ref<string | null>(null);

setCurrentDateTime();

setInterval(() => {
	setCurrentDateTime();
}, 1000);

function setCurrentDateTime() {
	currentDate.value = DateInstance.getFormattedDate(
		"",
		"DD.MM.YYYY HH:mm:ss",
		false,
	);
}
</script>

<template lang="pug">
.banner-section
	.banner
		pre.bottom {{ text }}
	.some-test
		.icon-test
			span Icon test: &nbsp;
			i-fa-file
		input(v-model="form.hello", type="text")
		span.translation i18n: {{ $t("app.hello") }}
		span Current time is &nbsp;
			strong {{ currentDate }}
		.storage-test
			span Browser storage test &nbsp;
			input(v-model="localStorageKey", title="Reload the page after changing me")
</template>

<style lang="scss" scoped>
.banner-section {
	display: flex;
	gap: 20px;
	background-color: rgb(18 27 98 / 30%);
	padding: 10px;
	min-height: 300px;
	align-items: center;
	justify-content: center;
	flex-direction: column;

	@media screen and (width >= 768px) {
		flex-direction: row;
	}

	.some-test {
		display: flex;
		gap: 5px;
		flex-direction: column;
	}
}
</style>
