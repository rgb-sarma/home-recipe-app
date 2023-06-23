<script setup lang="ts"></script>

<template lang="pug">
.footer-bar
	div 1. Remove / Change TEST folder -> "@/components/TEST"
	div 2. Replace all 'app-site' references with your project name
	div 3. Change *.vue files to alter references to test code
</template>

<style lang="scss" scoped>
.footer-bar {
	height: 300px;
	display: flex;
	background-color: rgb(14 84 14 / 30%);
	padding: 10px;
	min-height: 300px;
	align-items: center;
	flex-direction: column;
}
</style>
