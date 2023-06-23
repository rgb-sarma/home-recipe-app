<script setup lang="ts">
// 2023-5
import { focusFirstElement } from "@/assets/js/helpers";
import { useResizeObserver } from "@vueuse/core";

export interface GlobalModal {
	comp: any;
	config?: {
		title: string;
		canCloseModal: boolean;
		isShowCloseBtn: boolean;
		isOverlayClosable: boolean;
		isOverlayTransparent: boolean;
		canResize: boolean;
		hasOverlay: boolean;
		handleEscClose: boolean;
		handleDraggable: boolean;
		handleTabCycle: boolean; // Sometimes unstable
		slotProps: Record<string, any>;
		excludedTags: string[];
	};
	formStyle?: Record<string, any>;
}

defineOptions({
	name: "ModernModal",
	inheritAttrs: false,
});

const props = withDefaults(
	defineProps<{
		config: Partial<GlobalModal["config"]>;
		formStyle: Record<string, any>;
	}>(),
	{
		config: () => ({}),
		formStyle: () => ({}),
	},
);

const emit = defineEmits(["close-modal"]);

const isOverlayActive = ref(false);
const isLoadedModal = ref(false);
const isLoadedShell = ref(false);
const isModalBusy = ref(true);
const isModalClosedInvalid = ref(false);
const endQueueData = ref<any>(null);
const isAddedFocusEvents = ref(false);
const endTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const tabHandlerTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const localShellStyle = ref({
	left: "",
	top: "",
});
const isDragging = ref(false);
const originalDragValues = ref({
	left: 0,
	top: 0,
});
const canActivateResize = ref(false);
const isModalResized = ref(false);
const modalParentRef = ref<HTMLElement | null>(null);
const modalShellWrapRef = ref<HTMLElement | null>(null);
const modalShellRef = ref<HTMLElement | null>(null);

const completeConfig = computed(() => {
	const mergedProps = Object.assign(
		{
			onRerenderModalSize: () => {
				// TODO 3 Add rerender
				console.log("Implement");
			},
		},
		props.config?.slotProps,
	);
	return {
		title: "",
		canCloseModal: true,
		isOverlayClosable: true,
		isOverlayTransparent: false,
		canResize: false,
		hasOverlay: true,
		handleEscClose: true,
		handleDraggable: true,
		handleTabCycle: true, // Sometimes unstable
		excludedTags: ["INPUT", "TEXTAREA"],
		...props.config,
		slotProps: mergedProps,
		isShowCloseBtn:
			"isShowCloseBtn" in props.config
				? props.config.isShowCloseBtn
				: "canCloseModal" in props.config
				? props.config.canCloseModal === true
				: true,
	};
});

const completeShellStyle = computed(() => {
	if (isModalResized.value) {
		return {};
	}
	return props.formStyle;
});
const completeShellWrapStyle = computed(() => {
	return localShellStyle.value;
});
const canResizeShell = computed(() => {
	return (
		completeConfig.value.canResize &&
		isLoadedShell.value &&
		Boolean(modalShellRef.value)
	);
});
const modalParentClass = computed(() => ({
	"can-drag": completeConfig.value.handleDraggable,
	"can-resize": canResizeShell.value,
}));

watch(isModalBusy, (val) => {
	if (!val) {
		// Used to invoke event after transition
		emit("close-modal", endQueueData.value);
		endQueueData.value = null;
	}
});
watch(isLoadedShell, () => {
	setupResizeObs();
});

function onClickClose(evt: MouseEvent | null) {
	if (!completeConfig.value.canCloseModal) {
		return false;
	}

	isLoadedModal.value = false; // This is to trigger transition
	isLoadedShell.value = false;
	isOverlayActive.value = false;
	endQueueData.value = { evt };
	endTimeout.value = setTimeout(() => {
		console.error(
			"Modal instance not cleared, this will block application. [use '@close-modal' event]",
			completeConfig.value,
		);
		isModalClosedInvalid.value = true;
	}, 2000);
}
function onClickOverlay(evt: MouseEvent) {
	if (completeConfig.value.isOverlayClosable) {
		onClickClose(evt);
	}
}
function onLeaveAnimation() {
	isModalBusy.value = false;
}
function onLoadedForm() {
	// Invoked from comps to alert modal that it can process listeners
	console.log(">> Form is loaded");
}
function handleKeyUp(evt: KeyboardEvent) {
	const activeElTag = document.activeElement?.tagName || "";
	const isExcludedTag = completeConfig.value.excludedTags.includes(activeElTag);

	if (
		completeConfig.value.handleEscClose &&
		evt.key === "Escape" &&
		!isExcludedTag
	) {
		onClickClose(null);
	}
}
function handleTabFocusing() {
	// Block focus outside modal
	if (!isAddedFocusEvents.value) {
		const modernModal = modalParentRef.value;
		if (modernModal) {
			setTimeout(() => {
				focusFirstElement(modernModal, true);
			}, 10);
		}
	}
}
function onMouseDownShell(evt: MouseEvent) {
	canActivateResize.value = true;

	const isLeftClick = evt.button === 0;
	if (isLeftClick) {
		const targetEl = evt.target as HTMLElement;
		if (
			completeConfig.value.handleDraggable &&
			targetEl.closest("header") &&
			!targetEl.closest("[data-name='close-action']")
		) {
			isDragging.value = true;
			// const elRect = targetEl.getBoundingClientRect();
			originalDragValues.value = {
				left: evt.clientX,
				top: evt.clientY,
			};
		}
	}
}
function onMouseMoveDoc(evt: MouseEvent) {
	if (completeConfig.value.handleDraggable && isDragging.value) {
		// const modernModal = modalParentRef.value;
		const elShell = modalShellWrapRef.value;
		if (!elShell) return;
		const left = originalDragValues.value.left - evt.clientX;
		const top = originalDragValues.value.top - evt.clientY;
		originalDragValues.value = {
			left: evt.clientX,
			top: evt.clientY,
		};
		localShellStyle.value.left = `${elShell.offsetLeft - left}px`;
		localShellStyle.value.top = `${elShell.offsetTop - top}px`;
	}
}
function onMouseUpDoc(evt: MouseEvent) {
	if (completeConfig.value.handleDraggable) {
		// NOTE: Don't use preventDefault | Blocks input number
		isDragging.value = false;
	}
}
function onMouseLeaveDoc(evt: MouseEvent) {
	isDragging.value = false;
}
function onAfterEnterAnimation() {
	isLoadedShell.value = true;
}
async function setupResizeObs() {
	if (canResizeShell.value) {
		const instance = useResizeObserver(modalShellRef, (entries) => {
			if (canActivateResize.value) {
				isModalResized.value = true;
				instance.stop();
			}
		});
	}
}

onMounted(() => {
	isOverlayActive.value = true;
	isLoadedModal.value = true;

	document.body.addEventListener("keyup", handleKeyUp);
	document.addEventListener("mousemove", onMouseMoveDoc);
	document.addEventListener("mouseup", onMouseUpDoc);
	document.addEventListener("mouseleave", onMouseLeaveDoc);

	if (completeConfig.value.handleTabCycle) {
		tabHandlerTimeout.value = setTimeout(() => {
			handleTabFocusing();
		}, 10);
	}
});
onBeforeUnmount(() => {
	document.body.removeEventListener("keyup", handleKeyUp);
	document.removeEventListener("mousemove", onMouseMoveDoc);
	document.removeEventListener("mouseup", onMouseUpDoc);
	document.removeEventListener("mouseleave", onMouseLeaveDoc);
	endTimeout.value && clearTimeout(endTimeout.value);
	tabHandlerTimeout.value && clearTimeout(tabHandlerTimeout.value);
});
</script>

<template lang="pug">
teleport(to="#modern-modal")
	.modern-modal-comp.modal(ref="modalParentRef", :class="modalParentClass")
		.invalid-modal-clear(v-if="isModalClosedInvalid")
			span Modal Instance not cleared properly using events
		slot(name="overlay", :slotProps="completeConfig.slotProps")
			transition(name="fade")
				.overlay(
					v-if="completeConfig.hasOverlay && isOverlayActive",
					data-name="overlay",
					:class="{ transparent: completeConfig.isOverlayTransparent }",
					@click="onClickOverlay",
					@drag.prevent,
					@dragstart.prevent,
					@dragend.prevent,
					@dragenter.prevent,
					@dragover.prevent,
					@drop.prevent
				)
		slot(name="shell", :slotProps="completeConfig.slotProps")
			.shell-wrap(
				ref="modalShellWrapRef",
				data-name="shell-wrap",
				:style="completeShellWrapStyle",
				@click.self="onClickOverlay",
				@drag.prevent,
				@dragstart.prevent,
				@dragend.prevent,
				@dragenter.prevent,
				@dragover.prevent,
				@drop.prevent
			)
				transition(
					name="scale-fade",
					@after-enter="onAfterEnterAnimation",
					@after-leave="onLeaveAnimation"
				)
					.shell(
						v-if="isLoadedModal",
						ref="modalShellRef",
						:class="{ 'no-overlay': !completeConfig.hasOverlay, resized: isModalResized }",
						data-name="shell",
						:style="completeShellStyle",
						@mousedown="onMouseDownShell"
					)
						slot(name="form", :slotProps="completeConfig.slotProps")
							.layer(@load-modal-form="onLoadedForm")
								slot(name="header", :slotProps="completeConfig.slotProps")
									header.header(
										v-if="completeConfig.title || completeConfig.isShowCloseBtn !== false"
									)
										span.title(v-if="completeConfig.title")
											.text {{ completeConfig.title }}
										.close-btn(
											v-if="completeConfig.isShowCloseBtn !== false",
											data-name="close-action",
											@click="onClickClose"
										)
											svg.close-icon(
												width="16",
												height="16",
												viewBox="0 0 16 16",
												fill="none",
												xmlns="http://www.w3.org/2000/svg"
											)
												path(
													fill-rule="evenodd",
													clip-rule="evenodd",
													d="M8.00009 9.41431L13.6709 15.0851L15.0851 13.6709L9.41431 8.00009L15.0851 2.32925L13.6709 0.915039L8.00009 6.58588L2.32925 0.915039L0.915039 2.32925L6.58588 8.00009L0.915039 13.6709L2.32925 15.0851L8.00009 9.41431Z",
													fill="#575758"
												)
								slot(name="content", :slotProps="completeConfig.slotProps")
									span Content is rendered using slot "#content"
</template>

<style lang="scss" scoped>
.modern-modal-comp {
	$modal-back: $background-color;
	$header-size: 40px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 100;
	color: white;
	position: relative;
	overflow: hidden;

	// border-radius: 7px;
	// border-top-left-radius: 0;
	// border: thin solid #0000;
	// border-image-slice: 1;
	transition: none; // Used for transition scaling

	// NOTE: Workaround for dropdown
	// position: fixed;
	// inset: 0;

	.overlay {
		position: fixed;
		inset: 0;
		background: rgb(0 0 0 / 50%);

		&.transparent {
			background: transparent;
		}
	}

	.shell-wrap {
		// NOTE: Workaround for dropdown
		// position: absolute;

		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.shell {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 100px;
		max-height: 100vh;
		color: silver;
		background: $modal-back;
		transition: width 0.3s ease, height 0.3s ease;
		z-index: 1;
		border: thin solid #12161980;

		// border-image-slice: 1;
		// top: 50%;
		// transform: translateY(-50%);

		&.no-overlay {
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
		}

		.layer {
			display: flex;
			flex-direction: column;
			gap: 10px;
			height: 100%;
			width: 100%;

			.header {
				display: flex;
				align-items: center;
				gap: 10px;
				color: white;
				justify-content: space-between;
				padding: 0;
				height: $header-size;
				min-height: $header-size;
				overflow: hidden;

				.title {
					// Padding can cutout header
					margin: auto 0 auto 20px;
					font-weight: 600;
					user-select: none;

					.text {
						font-size: 16px;
						text-shadow: 3px 3px 10px #00000028;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}
				}

				& > .close-btn {
					margin: auto 12px auto auto;
					display: flex;
					align-self: center;
					padding: 3px;

					.close-icon {
						cursor: pointer;

						path {
							fill: #aeadad;
						}

						&:hover {
							path {
								fill: #ffb4c3;
								transition: all 0.3s ease;
							}
						}
					}
				}
			}
		}
	}

	&.can-resize {
		.shell {
			resize: both;
			overflow: auto;
			transition: none;

			.layer {
				overflow: hidden;

				:deep() {
					> *:not(.header) {
						overflow: auto;
					}
				}
			}

			&.resized {
				.layer {
					:deep() {
						> *:not(.header) {
							width: 100%;
							height: 100%;

							// min-width: auto;
							// min-height: auto;
						}
					}
				}
			}
		}
	}

	.invalid-modal-clear {
		position: fixed;
		inset: 0;
		background-color: rgb(29 29 29);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@include fade-transition;
	@include scale-fade-transition(0.2s, 0.8);
}
</style>
