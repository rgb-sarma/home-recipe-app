<script setup lang="ts"></script>

<template lang="pug">
#home-page
	header-bar
	banner-section
	footer-bar
</template>

<style lang="scss" scoped>
#home-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	user-select: none;

	.banner-section {
		flex: 1;
	}
}
</style>
