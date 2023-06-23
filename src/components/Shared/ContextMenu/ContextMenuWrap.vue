<script setup lang="ts">
import type { PropType } from "vue";

export interface ContextMenuitemsType {
	label: string;
	name?: string;
	disabled?: boolean;
	hidden?: boolean;
	onClick: (a?: any, payload?: any) => void;
	onShiftKeyClick?: (a?: any, payload?: any) => void;
}

const props = defineProps({
	items: {
		// Array of objects
		type: Array as PropType<ContextMenuitemsType[]>,
		required: true,
		default: () => [],
		validator: (val: ContextMenuitemsType[]) => {
			if (val.length === 0) {
				console.error("Context menu should have a list of items");
				return false;
			}
			return true;
		},
	},
	evt: {
		type: MouseEvent,
		required: true,
	},
	payload: {
		type: Object,
		default: () => {},
	},
});

const emit = defineEmits(["close-context-menu"]);

const contextMenuRef = ref<HTMLElement | null>(null);

function setupContextMenuPos() {
	const evt = props.evt;
	if (!evt) {
		console.log("No mouse event", props);

		return;
	}

	const calcPageAxis = (
		axis: typeof axisObj,
		offsetNum = 0,
	): typeof axisObj => {
		const tempAxis = { ...axis };

		const el = contextMenuRef.value;
		if (!el) {
			console.error("No element found", contextMenuRef.value);

			return { x: 0, y: 0 };
		}

		const contextHeight = el.offsetHeight;
		const contextWidth = el.offsetWidth;

		const clientCoor = {
			w: window.innerWidth,
			h: window.innerHeight,
		};

		const overlapX = clientCoor.w - contextWidth - axis.x;
		const overlapY = clientCoor.h - contextHeight - axis.y;

		// Revert context side
		if (overlapX < 0) {
			tempAxis.x = axis.x - contextWidth - offsetNum;
		} else {
			tempAxis.x = axis.x + offsetNum;
		}

		if (overlapY < 0) {
			if (contextHeight < axis.y) {
				// Inverse
				tempAxis.y = axis.y - contextHeight - offsetNum;
			} else {
				// If context menu overlaps window, move it to the center
				tempAxis.y = clientCoor.h / 2 - contextHeight / 2;
			}
		} else {
			tempAxis.y = axis.y + offsetNum;
		}
		// console.warn(
		//   `overlap Y > Axis: ${axis.y} | ContextHeight: ${contextHeight} | tempAxisY: ${tempAxis.y}`
		// );

		return tempAxis;
	};

	let axisObj = {
		x: evt.clientX,
		y: evt.clientY,
	};

	axisObj = calcPageAxis(axisObj, 5);
	if (!axisObj.x && !axisObj.y) {
		console.log("Invalid calculation for axis", axisObj);

		return;
	}

	contextMenuStylePos.value = { left: `${axisObj.x}px`, top: `${axisObj.y}px` };
}

function calcContextMenuStyle() {
	nextTick(() => {
		setupContextMenuPos();
	});
}

function displayName(item: ContextMenuitemsType) {
	return item.label || item.name;
}

function onMouseDownEvent(evt: MouseEvent) {
	const el = evt.target as HTMLVideoElement;
	const isElementWithin = el.closest(".context-menu");
	if (!isElementWithin) {
		closeContextMenu();
	}
}

function onMouseUpListEvent(evt: MouseEvent, item: ContextMenuitemsType) {
	const isRightClick = evt.button === 2;
	if (item.disabled || isRightClick) {
		return;
	}

	closeContextMenu();

	setTimeout(() => {
		// Used so modal & popups can be focused
		if (evt.shiftKey && item.onShiftKeyClick) {
			item.onShiftKeyClick(item, props.payload);
		} else if (item.onClick) {
			item.onClick(item, props.payload);
		} else {
			console.warn("No click handler added");
		}
	}, 10);
}

function closeContextMenu() {
	emit("close-context-menu");
}

function onKeyDownContextMenu(evt: KeyboardEvent) {
	if (evt.key === "Escape") {
		closeContextMenu();
	}
}

interface ContextMenuStyles {
	[key: string]: string;
}

const contextMenuStylePos = ref<ContextMenuStyles>({
	visibility: "hidden",
});

const filteredItems = computed(() =>
	props.items.filter((item: ContextMenuitemsType) => !item.hidden),
);

watchEffect(() => {
	if (props.evt) {
		calcContextMenuStyle();
	}
});

onMounted(() => {
	calcContextMenuStyle();
	document.addEventListener("mousedown", onMouseDownEvent);
	document.addEventListener("keydown", onKeyDownContextMenu);
});

onUnmounted(() => {
	document.removeEventListener("mousedown", onMouseDownEvent);
	document.removeEventListener("keydown", onKeyDownContextMenu);
});
</script>

<template lang="pug">
teleport(to="#context-menu")
	ul.context-menu(ref="contextMenuRef", :style="contextMenuStylePos")
		li(
			v-for="(item, index) in filteredItems",
			:key="index",
			:class="{ disabled: item.disabled }",
			@contextmenu.self.prevent="",
			@mouseup="onMouseUpListEvent($event, item)"
		)
			slot(name="item", :props="item")
				span {{ displayName(item) }}
</template>

<style lang="scss" scoped>
.context-menu {
	$dark-gray: #1d1d1f;
	$back: lighten(
		$color: $dark-gray,
		$amount: 8,
	);
	$front: rgb(243 243 243);

	position: fixed;

	// position: absolute; // Don't use this
	list-style-type: none;
	margin: 0;
	width: auto;
	display: flex;
	flex-direction: column;
	background: $back;
	color: $front;
	user-select: none;
	z-index: 200;
	padding: 5px 0;
	border: 1px solid lighten($color: $back, $amount: 3);

	> li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
		gap: 10px;
		padding: 3px 10px;
		width: 100%;
		color: gray;
		overflow: hidden;
		border-bottom: 1px solid rgb(74 74 74);

		&.disabled {
			color: gray;
		}

		&:last-child {
			border-bottom: none;
		}

		&:not(.disabled) {
			cursor: pointer;
			color: inherit;

			&:hover {
				background: lighten($color: $dark-gray, $amount: 15);
			}
		}
	}
}
</style>
