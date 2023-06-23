<script setup lang="ts">
export interface AppMenuBarItem {
	id?: string;
	label: string;
	title?: string;
	rightLabel?: string;
	isChecked?: boolean;
	isDisabled?: boolean;
	isHidden?: boolean;
	isBreakpoint?: boolean;
	isExpand?: boolean;
	children?: any;
	onClick?: (payload?: any) => void;
	onRightClick?: (payload?: any) => void;
	onShiftKeyClick?: (a?: any, payload?: any) => void;
}

const props = withDefaults(
	defineProps<{
		items: AppMenuBarItem[];
	}>(),
	{ items: () => [] },
);

const emit = defineEmits([
	"left-click-top-menu-item",
	"right-click-top-menu-item",
	"left-click-sub-menu-item",
	"right-click-sub-menu-item",
	"shift-click-sub-menu-item",
]);

const activeExpandedMenuItem = ref<number | null>(null);
const subMenuActiveMenuItem = ref<number | null>(null);

function filterHiddenItems(items: AppMenuBarItem[]) {
	if (Array.isArray(items)) {
		return items.filter((item) => !item.isHidden);
	}
	return items;
}
function onMouseUpTopAction(
	evt: MouseEvent,
	action: AppMenuBarItem,
	index: number,
) {
	if (action.isDisabled) {
		return;
	}

	const isLeftClick = evt.button === 0;
	const isRightClick = evt.button === 2;
	if (isLeftClick) {
		leftClickTopMenu(evt, action, index);
	} else if (isRightClick) {
		rightClickTopMenu(evt, action, index);
	} else {
		console.log("Blocked", evt.button);
	}
}
function onMouseUpSubAction(
	evt: MouseEvent,
	action: AppMenuBarItem,
	index: number,
) {
	if (action.isDisabled) {
		return;
	}

	const isLeftClick = evt.button === 0;
	const isRightClick = evt.button === 2;
	if (isLeftClick) {
		leftClickSubMenu(evt, action, index);
	} else if (isRightClick) {
		rightClickSubMenu(evt, action, index);
	} else if (evt.shiftKey && action.onShiftKeyClick) {
		shiftClickSubMenu(evt, action, index);
	} else {
		console.log("Blocked", evt.button);
	}
}
function leftClickTopMenu(
	evt: MouseEvent,
	action: AppMenuBarItem,
	index: number,
) {
	const payload = {
		action,
		index,
		evt: MouseEvent,
	};
	emit("left-click-top-menu-item", payload);

	if (action.isExpand) {
		activeExpandedMenuItem.value =
			activeExpandedMenuItem.value === index ? null : index;
	}

	if (!action.onClick || typeof action.onClick !== "function") {
		if (!action.isExpand) {
			console.warn("Invalid onClick handler, please add it", action);
		}
		return;
	}
	action.onClick(payload);
}
function rightClickTopMenu(evt: Event, action: AppMenuBarItem, index: number) {
	const payload = {
		action,
		index,
		evt: Event,
	};
	emit("right-click-top-menu-item", payload);
	action.onRightClick?.(payload);
}
function shiftClickSubMenu(evt: Event, action: AppMenuBarItem, index: number) {
	const payload = {
		action,
		index,
		evt: Event,
	};
	emit("shift-click-sub-menu-item", payload);

	// Click handler
	if (!action.onShiftKeyClick || typeof action.onShiftKeyClick !== "function") {
		console.warn("Invalid onShiftKeyClick handler, please add it", action);
		return;
	}
	action.onShiftKeyClick(payload);

	// Closes expanded and doesn't work with more expanded
	activeExpandedMenuItem.value = null;

	subMenuActiveMenuItem.value =
		subMenuActiveMenuItem.value === index ? null : index;
}
function leftClickSubMenu(evt: Event, action: AppMenuBarItem, index: number) {
	const payload = {
		action,
		index,
		evt: Event,
	};
	emit("left-click-sub-menu-item", payload);

	// Click handler
	if (!action.onClick || typeof action.onClick !== "function") {
		console.warn("Invalid onClick handler, please add it", action);
		return;
	}
	action.onClick(payload);

	// Closes expanded and doesn't work with more expanded
	activeExpandedMenuItem.value = null;

	subMenuActiveMenuItem.value =
		subMenuActiveMenuItem.value === index ? null : index;
}
function rightClickSubMenu(evt: Event, action: AppMenuBarItem, index: number) {
	const payload = {
		action,
		index,
		evt: Event,
	};
	emit("right-click-sub-menu-item", payload);

	// Click handler
	if (!action.onRightClick || typeof action.onRightClick !== "function") {
		return;
	}
	action.onRightClick(payload);

	// Closes expanded and doesn't work with more expanded
	activeExpandedMenuItem.value = null;

	subMenuActiveMenuItem.value =
		subMenuActiveMenuItem.value === index ? null : index;
}
function onMouseOverTopMenuItem(
	evt: Event,
	action: AppMenuBarItem,
	index: number,
) {
	if (activeExpandedMenuItem.value !== null) {
		activeExpandedMenuItem.value = index;
	}
}
function addOutsideClickEvent(evt: MouseEvent) {
	const closeAppMenuBarEl = (evt.target as HTMLElement)?.closest(
		".app-menu-bar-list",
	);
	if (!closeAppMenuBarEl) {
		activeExpandedMenuItem.value = null;
		subMenuActiveMenuItem.value = null;
	}
}

onMounted(() => {
	document.addEventListener("mousedown", addOutsideClickEvent);
});

onUnmounted(() => {
	document.removeEventListener("mousedown", addOutsideClickEvent);
});
</script>

<template lang="pug">
.app-menu-bar-list
	.top-action(
		v-for="(action, index) in filterHiddenItems(props.items)",
		:key="index"
	)
		.top-menu-item(
			:class="{ active: activeExpandedMenuItem === index, disabled: action.isDisabled }",
			:disabled="action.isDisabled",
			:title="action.title",
			@mouseenter="onMouseOverTopMenuItem($event, action, index)",
			@mouseup.prevent="onMouseUpTopAction($event, action, index)",
			@contextmenu.prevent
		)
			.label {{ action.label }}
		.drop-menu-first-level(
			v-if="activeExpandedMenuItem === index && action.isExpand"
		)
			.drop-menu-action-wrapper(
				v-for="(childItem, childIndex) in filterHiddenItems(action.children)",
				:key="childIndex"
			)
				.drop-menu-item(
					v-if="!childItem.isBreakpoint",
					:class="{ active: subMenuActiveMenuItem === childIndex, disabled: childItem.isDisabled }",
					:disabled="childItem.isDisabled",
					:title="childItem.title",
					@mouseup.prevent.stop="onMouseUpSubAction($event, childItem, childIndex)",
					@contextmenu.prevent
				)
					.left-side
						.icon-holder
							span(v-if="childItem.isChecked")
								| ✔️
						.label {{ childItem.label }}
					.right-side
						span {{ childItem.rightLabel }}
						.icon-holder
				.line-break(v-if="childItem.isBreakpoint")
</template>

<style lang="scss" scoped>
.app-menu-bar-list {
	$top-item: 23px;
	$drop-min-wid: 200px;
	$drop-max-wid: 600px;

	display: flex;
	align-items: center;
	color: #f2f2f2;
	font-size: 12px;
	font-weight: 500;

	.top-action {
		user-select: none;
		position: relative;

		.top-menu-item {
			display: flex;
			align-items: center;
			cursor: pointer;
			padding: 3px 10px;

			&:hover {
				background: #fff1;
			}

			&:not(.disabled) {
				cursor: pointer;
				color: inherit;

				&:hover {
					background: lighten($color: $medium-gray, $amount: 3);
				}
			}

			&.active {
				background: #fff2;
			}
		}

		.drop-menu-first-level {
			position: absolute;
			left: 0;
			top: $top-item;
			min-width: $drop-min-wid;
			max-width: $drop-max-wid;
			background: lighten($color: $medium-gray, $amount: 2);
			z-index: 100;
			padding: 5px 0;
			overflow: hidden;

			.drop-menu-action-wrapper {
				display: flex;
				align-items: center;
				position: relative;
				white-space: nowrap;

				.drop-menu-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 7px;
					padding: 3px 7px;
					width: 100%;
					color: gray;
					overflow: hidden;

					.left-side {
						display: flex;
						align-items: center;
						gap: 7px;
						overflow: hidden;
					}

					.right-side {
						display: flex;
						align-items: center;
						gap: 7px;
						overflow: hidden;
					}

					.icon-holder {
						$size: 10px;

						min-width: $size;
						width: $size;
						font-size: 10px;
						text-shadow: 0 0 0 gray;
						color: transparent;

						img {
							min-width: $size;
							width: $size;
						}
					}

					&:not(.disabled) {
						cursor: pointer;
						color: inherit;

						&:hover {
							background: lighten($color: $medium-gray, $amount: 4);
						}
					}
				}

				.line-break {
					width: 100%;
					height: 1px;
					margin: 3px 7px;
					background: lighten($color: $medium-gray, $amount: 5);
				}
			}
		}
	}
}
</style>
