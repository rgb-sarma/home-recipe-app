import { beforeEach, expect, test } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import HeaderBar from "../src/components/TEST/HeaderBar.vue";

test("mount component", async () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	expect(HeaderBar).toBeTruthy();

	const wrapper = mount(HeaderBar, {
		global: {
			plugins: [createTestingPinia()],
		},
		props: {
			count: 4,
		},
	});

	expect(wrapper.find(".test-count").text()).toContain("3 x 2 = 6");
	expect(wrapper.html()).toMatchSnapshot();

	await wrapper.find(".test-btn").trigger("click");

	expect(wrapper.find(".test-count").text()).toContain("3 x 3 = 9");

	await wrapper.find(".test-btn").trigger("click");

	expect(wrapper.find(".test-count").text()).toContain("3 x 4 = 12");
});
