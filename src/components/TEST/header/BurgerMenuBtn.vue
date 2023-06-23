<script setup lang="ts">
defineProps<{
	isMobileHeaderToggled: boolean;
}>();

const emit = defineEmits(["toggle-burger"]);
</script>

<template lang="pug">
.burger-menu(
	:class="{ active: isMobileHeaderToggled }",
	@click="emit('toggle-burger')"
)
	.line.line1
	.line.line2
	.line.line3
</template>

<style lang="scss" scoped>
.burger-menu {
	height: 26px;
	width: 32px;
	z-index: 2;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-self: center;
	cursor: pointer;

	.line {
		display: block;
		height: 4px;
		width: 100%;
		border-radius: 10px;
		background: var(--color-text);
	}

	.line1 {
		transform-origin: 0% 0%;
		transition: transform 0.3s ease-in-out;
	}

	.line2 {
		transition: transform 0.1s ease-in-out;
	}

	.line3 {
		transform-origin: 0% 100%;
		transition: transform 0.3s ease-in-out;
	}

	&.active {
		.line1 {
			transform: rotate(45deg);
		}

		.line2 {
			transform: scaleY(0);
		}

		.line3 {
			transform: rotate(-45deg);
		}
	}

	&:hover {
		.line {
			filter: brightness(1.2);
		}
	}
}
</style>
