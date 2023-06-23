<script setup lang="ts">
import { $t } from "@/i18n";
import { useDefaultStore } from "@/store";

const store = useDefaultStore();

const navList = computed(() => {
	return [
		{
			name: $t("app.homepage"),
		},
		{
			name: $t("app.other"),
		},
		{
			name: $t("app.contact"),
		},
	];
});

function onAuth() {
	console.log("Login logic...");
}
function onClickedMenuItem(item: (typeof navList.value)[0]) {
	console.log("CLICKED", item.name);
	store.isMobileToggled = false;
}
</script>

<template lang="pug">
.header-bar
	.left-side
		router-link(to="/", draggable="false")
			img(src="@/assets/image/logo.svg", draggable="false")
		.menu
			span(v-for="navItem in navList", :key="navItem.name")
				| {{ navItem.name }}
	.right-side
		button(@click="onAuth")
			span {{ $t("app.login") }}
	.mobile-menu-wrap
		burger-menu-btn(
			:isMobileHeaderToggled="store.isMobileToggled",
			@toggle-burger="store.isMobileToggled = !store.isMobileToggled"
		)
		transition(name="slide-fade")
			header-mobile(
				v-if="store.isMobileToggled",
				:navList="navList",
				@click-menu-item="onClickedMenuItem"
			)
</template>

<style lang="scss" scoped>
.header-bar {
	display: flex;
	gap: 10px;
	background: rgb(var(--color-background) 20);
	height: $nav-top-bar;
	min-height: $nav-top-bar;
	padding: 0 50px;
	position: sticky;
	top: 0;
	z-index: 10;
	border-bottom: 1px solid rgb(128 128 128 / 10%);
	box-sizing: content-box; // Because of the border-bottom

	&::before {
		content: "";
		backdrop-filter: blur(5px);
		position: absolute;
		inset: 0;
	}

	.left-side,
	.right-side {
		flex: 1;
		padding: 10px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.right-side {
		display: none;
		justify-content: flex-end;
	}

	.menu {
		display: none;
		gap: 5px;
	}

	.mobile-menu-wrap {
		display: flex;
	}

	.slide-fade-enter-active,
	.slide-fade-leave-active {
		transition: all 0.3s ease;
	}

	.slide-fade-enter,
	.slide-fade-enter-from,
	.slide-fade-leave-to {
		transform: translateY(10px);
		opacity: 0;
	}

	@media screen and (width >= 768px) {
		.menu {
			display: flex;
		}

		.right-side {
			display: flex;
		}

		.mobile-menu-wrap {
			display: none;
		}
	}
}
</style>
