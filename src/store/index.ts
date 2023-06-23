import { defineStore } from "pinia";
import { useWindowSize } from "@vueuse/core";

export const useDefaultStore = defineStore("main", () => {
	const { width } = useWindowSize();
	const counter = ref(0);
	const isMobileToggled = ref(false);

	const isMobileSize = computed(() => width.value < 768);
	const isMobileView = computed(
		() => isMobileSize.value && isMobileToggled.value,
	);

	watch(isMobileSize, (val) => {
		if (!val) {
			isMobileToggled.value = false;
		}
	});

	function incrementStore() {
		return ++counter.value;
	}

	return {
		counter,
		incrementStore,
		isMobileToggled,
		isMobileView,
	};
});
