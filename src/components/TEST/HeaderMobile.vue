<script setup lang="ts">
defineProps<{
	navList: { name: string }[];
}>();

const emit = defineEmits(["click-menu-item"]);
</script>

<template lang="pug">
.header-mobile
	.menu
		.item(
			v-for="navItem in navList",
			:key="navItem.name",
			@click="emit('click-menu-item', navItem)"
		)
			| {{ navItem.name }}
</template>

<style lang="scss" scoped>
.header-mobile {
	display: flex;
	gap: 10px;
	position: fixed;
	inset: 0;
	top: $nav-top-bar;
	background-color: var(--color-background);
	color: var(--color-text);
	padding: 20px;
	justify-content: center;
	z-index: 100;

	.menu {
		display: flex;
		flex-direction: column;
		text-align: center;
		align-items: center;

		.item {
			cursor: pointer;

			&:hover {
				filter: brightness(1.5);
			}
		}
	}
}
</style>
