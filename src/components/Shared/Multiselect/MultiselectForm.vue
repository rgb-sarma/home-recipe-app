<script setup lang="ts">
// 2023-5
// Read docs here: https://github.com/vueform/multiselect
// Additional options -> wrapOptions
// __isFixedDrop: dropdown wrapper will be fixed (css)
// __noCaret: dd caret wont be shown if > true | (d) false
// __noBorder: disables dd border
// preselectFirst: selects first value when dd opens

import Multiselect3 from "@vueform/multiselect";
import { $t } from "@/i18n";
import { onClickOutside } from "@vueuse/core";

type Multiselect = Multiselect3 & {
	$el: HTMLElement;
	close: any;
	open: any;
	isOpen: any;
	pointer: any;
	filteredOptions: any;
};

const props = withDefaults(
	defineProps<{
		modelValue?: any;
		valueProp?: string;
		options: any[];
		slotText?: any;
		wrapOptions?: any;
	}>(),
	{
		modelValue: () => [],
		valueProp: "value",
		slotText: () => ({}),
		wrapOptions: () => ({}),
	},
);

const emit = defineEmits([
	"update:modelValue",
	"open",
	"close",
	"select",
	"deselect",
	"input",
	"search-change",
	"tag",
	// "keydown",
]);

const attrs = useAttrs();

const isDropdownOpenReadOnly = ref(false);
const multiSelRef = ref<Multiselect | null>(null);

const multiSelectBinds = computed(() => {
	return {
		...defaultProps.value,
		...props,
		...attrs,
		...getListeners.value,
		...additionalProps.value,
	};
});
const getListeners = computed(() => {
	if ("onRemove" in attrs) {
		console.error(
			"Invalid event -> [remove], change to [deselect]",
			attrs.onRemove,
		);
	}
	if ("value" in attrs) {
		console.error("Don't use 'value' prop, use 'modelValue'", attrs.value);
	}

	return {
		onTag: onTagMultiselect,
		onOpen: onOpenMultiselect,
		onClose: onCloseMultiselect,
		onInput: onInputMultiselect,
		onSearchChange,
		onSelect: onSelectMultiselect,
		onDeselect: onDeselectMultiselect,
	};
});
const defaultProps = computed(() => {
	return {
		canClear: false,
		canDeselect: false,
		// object: true,  // Not used yet
	};
});
const additionalProps = computed(() => {
	const options = {} as any;

	if (!props.valueProp) {
		options.valueProp = "value";
	}

	options.modelValue = valueParsed.value;

	return options;
});
const invalidTextVal = computed(() => {
	return "\u200B";
});
const vModelValue = computed(() => {
	return props.modelValue;
});
const valueParsed = computed(() => {
	if (Array.isArray(vModelValue.value)) {
		return vModelValue.value.map((oneObj) => oneObj[props.valueProp]);
	} else if (typeof vModelValue.value === "object") {
		if (props.valueProp) {
			return vModelValue.value?.[props.valueProp];
		}
	}
	return vModelValue.value;
});
const multiClasses = computed(() => {
	return {
		"no-caret": props.wrapOptions.__noCaret,
		"no-border": props.wrapOptions.__noBorder,
		"fixed-drop": props.wrapOptions.__isFixedDrop,
	};
});

watch(
	() => props.options,
	() => {
		if (props.wrapOptions.preselectFirst && props.options?.length) {
			pointFirstElement();
		}
	},
	{
		deep: true,
	},
);

function onOpenMultiselect() {
	// Wait for comp to render
	nextTick(() => {
		const callback = (entries: any, observer: any) => {
			entries.forEach((entry: any) => {
				if (entry.intersectionRatio < 1) {
					if (scrollableEl && childEl) {
						const options = {
							top: (childEl as HTMLElement).offsetTop,
							left: 0,
							behavior: "smooth",
						} as any;
						scrollableEl.scrollTo(options);
					}
				}
			});
			observer.disconnect();
		};

		const scrollableEl = multiSelRef.value?.$el.querySelector(
			".multiselect-dropdown",
		);

		const childEl = multiSelRef.value?.$el.querySelector(
			".multiselect-option.is-selected",
		);
		if (scrollableEl && childEl) {
			const observer = new IntersectionObserver(callback, {
				root: scrollableEl,
			});

			observer.observe(childEl);
		}

		isDropdownOpenReadOnly.value = true;
	});

	emit("open");

	if (props.wrapOptions.__isFixedDrop) {
		getFixedPositionCoordinates();
	}

	onClickOutsideFunc();
}
function getFixedPositionCoordinates() {
	const el = multiSelRef.value?.$el;
	const dropMenu = el?.querySelector(".multiselect-dropdown");
	if (el && dropMenu) {
		const viewportOffset = el.getBoundingClientRect();
		const top = viewportOffset.top + el.offsetHeight;
		const left = viewportOffset.left;
		(dropMenu as HTMLElement).style.top = `${top}px`;
		(dropMenu as HTMLElement).style.left = `${left}px`;
	} else {
		console.log("[⚠️] No drop menu");
	}
}
function onCloseMultiselect() {
	isDropdownOpenReadOnly.value = false;
	emit("close");
}
function onClickOutsideFunc() {
	const target = multiSelRef.value?.$el;
	if (target) {
		onClickOutside(target as HTMLElement, (evt) => {
			const mf = multiSelRef.value;
			if (mf) {
				if (mf.isOpen) {
					mf.close();
				}
			}
		});
	}
}
function onInputMultiselect(evt: Event) {
	if (Array.isArray(evt)) {
		const arrayOfObjects = evt.reduce((prev, optionStr) => {
			const foundObj = props.options.find(
				(opt) => opt?.[props.valueProp] === optionStr,
			);
			if (foundObj) {
				prev.push(foundObj);
			} else {
				const lowercaseVal = optionStr.toLowerCase();
				prev.push({
					// There may be some other keys missing
					[props.valueProp]: lowercaseVal,
				});
			}

			return prev;
		}, []);

		emit("update:modelValue", arrayOfObjects, evt);
	} else {
		// Ignored
	}
	emit("input", evt);
}
function onSearchChange(evt: Event) {
	if (props.wrapOptions.preselectFirst && props.options?.length) {
		pointFirstElement();
	}
	emit("search-change", evt);
}
function onSelectMultiselect(evtParsed: any, evt: any) {
	if (Array.isArray(vModelValue.value)) {
		emit("select", evt, evtParsed);
	} else {
		emit("update:modelValue", evt, evtParsed);
		emit("select", evt, evtParsed);
	}
}
function onDeselectMultiselect(evtParsed: any, evt: any) {
	if (Array.isArray(vModelValue.value)) {
		emit("deselect", evt, evtParsed);
	} else {
		emit("update:modelValue", evt, evtParsed);
		emit("deselect", evt, evtParsed);
	}
}
function onTagMultiselect(evt: any) {
	emit("tag", evt);
}
function tryTranslate(evt: any, value: any) {
	return evt?.__isI18n ? $t(value) : value;
}
function getTextFromProps(evt: any) {
	const label = attrs?.label as undefined | string;
	if (label) {
		return tryTranslate(evt, evt[label]?.trim() || invalidTextVal.value);
	} else if (evt?.label) {
		return tryTranslate(evt, evt?.label);
	}
	return tryTranslate(evt, evt);
}
function getSlotTextSingle(evt: any) {
	return getTextFromProps(evt);
}
function getSlotTextPre(props: any) {
	const evt = props.option;
	return getTextFromProps(evt);
}
function onClickCaret(evt: any) {
	const mf = multiSelRef.value;
	if (mf) {
		if (mf.isOpen) {
			mf.close();
		} else {
			mf.open();
		}
	}
}
async function pointFirstElement() {
	await nextTick(); // Needed because of the internal filtering
	const firstEl = multiSelRef.value?.filteredOptions?.[0];
	if (multiSelRef.value && firstEl) {
		multiSelRef.value.pointer = firstEl;
	} else {
		// ignored, when there are no items to select [empty array]
	}
}

defineExpose({
	multiSelRef,
});
</script>
<template lang="pug">
.multiselect-form(:class="multiClasses")
	multiselect3(
		ref="multiSelRef",
		v-bind="multiSelectBinds",
		:model-value="multiSelectBinds.modelValue"
	)
		template(#singlelabel="msProps: any")
			slot(name="option-single", :props="{ option: msProps.value }")
				span.default-text {{ getSlotTextSingle(msProps.value) }}
		template(#multiplelabel="msProps: any")
			slot(name="option-multiple", :props="msProps")
				span.default-text {{ msProps }}
		template(#option="msProps: any")
			slot(name="option-pre", :props="msProps")
				span.default-text {{ getSlotTextPre(msProps) }}
		template(#tag="msProps: any")
			slot(name="tag", :props="msProps")
		template(v-if="slotText.noOptions !== null", #nooptions)
			.multiselect-no-options {{ slotText.noOptions }}
		template(v-if="slotText.noResult !== null", #noresults)
			.multiselect-no-results {{ slotText.noResult }}
		template(#caret)
			svg.faico.custom-caret(
				viewBox="0 0 512 512"
				width="12px"
				height="12px"
				:class="{ reverse: isDropdownOpenReadOnly }"
				@mousedown.prevent.stop="onClickCaret"
			)
				path(
					fill="currentColor" 
					d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7L86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
				)
</template>

<style lang="scss">
@import "@vueform/multiselect/themes/default";

.multiselect-form {
	$darker-gray: $medium-gray;
	$light-border: $medium-gray;

	display: flex;
	width: 100%;
	height: 100%;

	@mixin vars {
		--ms-font-size: 0.85rem;
		--ms-line-height: 1;
		--ms-bg: transparent;
		--ms-bg-disabled: transparent;
		--ms-border-color: #d3d3d321;
		--ms-max-height: 20rem;
		--ms-border-width: 0;
		--ms-radius: 0;
		--ms-tag-font-size: 0.85rem;
		--ms-tag-line-height: 1rem;
		--ms-tag-gap: 0.25rem; // New var
		--ms-dropdown-bg: #{$darker-gray};
		--ms-dropdown-border-color: gray;
		--ms-dropdown-border-width: 0;
		--ms-dropdown-radius: 4px;
		--ms-group-label-py: 0.3rem;
		--ms-group-label-px: 0.75rem;
		--ms-group-label-line-height: 1;
		--ms-group-label-bg-pointed: #d1d5db;
		--ms-group-label-color-pointed: #374151;
		--ms-group-label-bg-disabled: #f3f4f6;
		--ms-group-label-color-disabled: #d1d5db;
		--ms-group-label-bg-selected: #454748;
		--ms-group-label-color-selected: #fff;
		--ms-group-label-bg-selected-pointed: #454748;
		--ms-group-label-color-selected-pointed: #fff;
		--ms-group-label-bg-selected-disabled: rgba(#454748, 0.9);
		--ms-group-label-color-selected-disabled: #d1fae5;
		--ms-option-font-size: 0.85rem;
		--ms-option-line-height: 1;
		--ms-option-bg-pointed: #{lighten($color: $darker-gray, $amount: 10)};
		--ms-option-bg-selected: #{lighten($color: $darker-gray, $amount: 5)};
		--ms-option-bg-disabled: #{lighten($color: $darker-gray, $amount: 3)};
		--ms-option-bg-selected-pointed: #{lighten(
				$color: $darker-gray,
				$amount: 10
			)};
		--ms-option-bg-selected-disabled: #{lighten(
				$color: $darker-gray,
				$amount: 3
			)};
		--ms-option-color-pointed: #c0c0c0;
		--ms-option-color-selected: #c0c0c0;
		--ms-option-color-disabled: #d1d5db;
		--ms-option-color-selected-pointed: #c0c0c0;
		--ms-option-color-selected-disabled: #d1fae5;
		--ms-option-py: 0.3rem;
		--ms-option-px: 0.5rem;
	}

	@mixin vars-all {
		// --ms-font-size: 0.9rem;
		// --ms-line-height: 1;
		// --ms-bg: transparent;
		// --ms-bg-disabled: transparent;
		// --ms-border-color: #d3d3d321;
		// --ms-border-width: 0;
		// --ms-radius: 0;
		--ms-py: 0.5rem;
		--ms-px: 0.875rem;
		--ms-ring-width: 3px;
		--ms-ring-color: #10b98130;
		--ms-placeholder-color: #9ca3af;

		// --ms-max-height: 10rem;

		--ms-spinner-color: #10b981;

		// Unused
		// --ms-caret-color: #999999;
		// --ms-clear-color: #999999;
		// --ms-clear-color-hover: #000000;

		// --ms-tag-font-size: 0.875rem;
		// --ms-tag-line-height: 1.25rem;
		--ms-tag-font-weight: 600;
		--ms-tag-bg: #10b981;
		--ms-tag-bg-disabled: #9ca3af;
		--ms-tag-color: #fff;
		--ms-tag-color-disabled: #fff;
		--ms-tag-radius: 4px;
		--ms-tag-py: 0.125rem;
		--ms-tag-px: 0.5rem;
		--ms-tag-my: 0.25rem;
		--ms-tag-mx: 0.25rem;
		--ms-tag-remove-radius: 4px;
		--ms-tag-remove-py: 0.25rem;
		--ms-tag-remove-px: 0.25rem;
		--ms-tag-remove-my: 0;
		--ms-tag-remove-mx: 0.125rem;

		// --ms-dropdown-bg: #{$darker-gray};
		// --ms-dropdown-border-color: gray;
		// --ms-dropdown-border-width: 0px;
		// --ms-dropdown-radius: 4px;

		// --ms-group-label-py: 0.3rem;
		// --ms-group-label-px: 0.75rem;
		// --ms-group-label-line-height: 1.375;
		// --ms-group-label-bg-pointed: #d1d5db;
		// --ms-group-label-color-pointed: #374151;
		// --ms-group-label-bg-disabled: #f3f4f6;
		// --ms-group-label-color-disabled: #d1d5db;
		// --ms-group-label-bg-selected: #059669;
		// --ms-group-label-color-selected: #ffffff;
		// --ms-group-label-bg-selected-pointed: #0c9e70;
		// --ms-group-label-color-selected-pointed: #ffffff;
		// --ms-group-label-bg-selected-disabled: #75cfb1;
		// --ms-group-label-color-selected-disabled: #d1fae5;

		// --ms-option-font-size: 0.9rem;
		// --ms-option-line-height: 1;
		// --ms-option-bg-pointed: #ffffff;
		// --ms-option-bg-selected: #10b981;
		// --ms-option-bg-disabled: #ffffff;
		// --ms-option-bg-selected-pointed: #26c08e;
		// --ms-option-bg-selected-disabled: #ffffff;
		// --ms-option-color-pointed: #1f2937;
		// --ms-option-color-selected: #ffffff;
		// --ms-option-color-disabled: #d1d5db;
		// --ms-option-color-selected-pointed: #ffffff;
		// --ms-option-color-selected-disabled: #d1fae5;
		// --ms-option-py: 0.5rem;
		// --ms-option-px: 0.75rem;

		--ms-empty-color: #4b5563;
	}

	.multiselect {
		@include vars;

		border-bottom: 1px solid var(--ms-border-color);
		justify-content: space-between;
		height: 100%;
		font-size: 12px;

		.multiselect-wrapper {
			padding: 0 5px;
			height: 100%;
		}

		.multiselect-search {
			height: 100%;
			background-color: var(--ms-bg);
			text-indent: 5px;
			padding: 0;

			&:hover,
			&:focus,
			&:active {
				background-color: var(--ms-bg);
			}
		}

		.multiselect-placeholder {
			padding-left: var(--ms-px, 0.675rem);
			padding-right: calc(var(--ms-px, 0.675rem) * 3);
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.default-text {
			user-select: none;
			white-space: nowrap;
		}

		.multiselect-options {
			padding-top: 4px;

			.multiselect-option {
				&.is-selected {
					font-weight: 700;
				}
			}
		}

		&.is-active {
			box-shadow: none;

			.multiselect-search {
				height: 100%;

				// & + .default-text {
				//   display: none;
				// }
			}
		}

		.multiselect-dropdown {
			$alpha-darker: rgba($light-border, 0.2);

			width: 100%;
			max-height: var(--ms-max-height, 20rem);
			overflow-y: auto;
			left: 0;
			right: 0;
			bottom: -1px;
			border: thin solid darken($color: $alpha-darker, $amount: 50);
			box-shadow: 0 6px 16px 3px rgb(0 0 0 / 15%);

			// opacity: 1;
			// transition: opacity 0.15s ease;

			// &.is-hidden {
			//   display: inherit;
			//   opacity: 0;
			// }
		}

		.multiselect-tags {
			margin: var(--ms-tag-my, 0.25rem) 0;
			gap: var(--ms-tag-gap, 0);

			.multiselect-tags-search-wrapper {
				margin: 0;

				.multiselect-tags-search {
					height: auto;
				}
			}

			.multiselect-tag {
				margin: 0;
			}
		}

		.custom-caret {
			position: relative;
			width: 1.5rem;
			height: 90%;
			right: 1px;
			top: 1px;
			padding: 4px 8px;
			text-align: center;
			transition: transform 0.2s ease;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: auto;

			&.reverse {
				transform: rotateX(180deg);
			}
		}
	}

	&.no-caret {
		.custom-caret {
			display: none;
		}
	}

	&.no-border {
		.multiselect {
			border: unset;
		}
	}

	&.fixed-drop {
		.multiselect-dropdown {
			position: fixed;
			z-index: 200;
			width: auto;
			transform: translateY(0%);
			right: unset;
			max-height: 300px;
		}
	}
}
</style>
