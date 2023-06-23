import { baseURL } from "@/api/config";
import { type RemovableRef, useStorage } from "@vueuse/core";
import { type Ref, type UnwrapRef } from "vue";

// @ts-expect-error
export function debounce(func, waitTimer, immediate) {
	// @ts-expect-error
	let timeout = null;
	return function () {
		// @ts-expect-error
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const context = this;
		// eslint-disable-next-line prefer-rest-params
		const args = arguments;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		// @ts-expect-error
		const callNow = immediate && !timeout;
		// @ts-expect-error
		clearTimeout(timeout);
		timeout = setTimeout(later, waitTimer);
		if (callNow) func.apply(context, args);
	};
}

// @ts-expect-error
export function throttle(func, waitTimer = 500) {
	let inThrottle = false;
	return function () {
		// eslint-disable-next-line prefer-rest-params
		const args = arguments;
		// @ts-expect-error
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const context = this;
		if (!inThrottle) {
			func.apply(context, args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, waitTimer);
		}
	};
}

export function focusFirstElement(
	parentEl: HTMLElement,
	isFocus = true,
	isDebug = false,
) {
	// Don't invoke more than once (Before a component is destroyed)
	if (parentEl) {
		const inputListToIncludeFocusable = [
			"input:not(:disabled):not(.hidden)",
			"textarea:not(:disabled):not(.hidden)",
			"button:not(:disabled):not(.hidden)",
			"span.focusable",
			"div.focusable",
			".multiselect[tabindex]",
			"*[tabindex]:not(:disabled):not(.hidden)",
		].join();

		const nodeList = Array.from(
			parentEl.querySelectorAll(inputListToIncludeFocusable),
		) as HTMLElement[];
		if (nodeList?.length) {
			const addInputTabHandling = (nodeList: HTMLElement[]) => {
				const focusEl = (evt: KeyboardEvent, oppoEl: HTMLElement) => {
					// Only for first / last element
					oppoEl.focus();
					evt.preventDefault();
				};

				// First el
				nodeList[0].addEventListener("keydown", (evt: KeyboardEvent) => {
					if (evt.key === "Tab" && evt.shiftKey) {
						focusEl(evt, nodeList[nodeList.length - 1]);
					}
				});

				// Last el
				nodeList[nodeList.length - 1].addEventListener(
					"keydown",
					(evt: KeyboardEvent) => {
						if (evt.key === "Tab" && !evt.shiftKey) {
							focusEl(evt, nodeList[0]);
						}
					},
				);
			};

			if (isFocus) {
				// console.log("➕ Focusing first el", nodeList[0]);
				nodeList[0].focus();

				if (isDebug) {
					console.error("➕ Focusing first el", nodeList[0]);
				}
			}

			addInputTabHandling(nodeList);
		} else if (isDebug) {
			console.warn("No child element found for focus");
		}
	} else if (isDebug) {
		console.warn("No parent element found for focus");
	}
}

export function getCurrentDomain() {
	let url = new URL(location.href);
	try {
		url = new URL(baseURL);
	} catch (err) {
		// ignored - could break on prod because link is not valid
	}
	return url;
}
function getUseStorage<T>(
	key: string,
	shouldParse = false,
	storage: Storage,
	defaultVal?: T,
): Ref<T | UnwrapRef<T> | string | null | undefined> {
	const state = useStorage(key, defaultVal, storage);
	if (!shouldParse) return state;

	try {
		return ref(JSON.parse(state.value as string));
	} catch (err) {
		console.error(`Error loading key`, key);
		return ref(defaultVal);
	}
}

export function getLocalStorageReac<T>(
	key: string,
	shouldParse = false,
	defaultVal?: T,
) {
	// eslint-disable-next-line no-storage/no-browser-storage
	return getUseStorage(key, shouldParse, localStorage, defaultVal);
}

export function getSessionStorageReac<T>(
	key: string,
	shouldParse = false,
	defaultVal?: T,
) {
	// eslint-disable-next-line no-storage/no-browser-storage
	return getUseStorage(key, shouldParse, sessionStorage, defaultVal);
}

export function setLocalStorageReac(
	key: string,
	value: any,
): RemovableRef<any> {
	let tempValue = value;
	if (typeof value !== "string") {
		tempValue = JSON.stringify(value);
	}

	// GH: https://github.com/vueuse/vueuse/issues/2193
	// eslint-disable-next-line no-storage/no-browser-storage
	const state = useStorage(key, null, localStorage);
	state.value = tempValue;

	// eslint-disable-next-line no-storage/no-browser-storage
	if (localStorage[key] !== tempValue) {
		// eslint-disable-next-line no-storage/no-browser-storage
		localStorage[key] = tempValue;
		return ref(tempValue);
	}
	return state;
}

export function setSessionStorageReac(
	key: string,
	value: any,
): RemovableRef<any> {
	let tempValue = value;
	if (typeof value !== "string") {
		tempValue = JSON.stringify(value);
	}

	// GH: https://github.com/vueuse/vueuse/issues/2193
	// eslint-disable-next-line no-storage/no-browser-storage
	const state = useStorage(key, null, sessionStorage);
	state.value = tempValue;

	// eslint-disable-next-line no-storage/no-browser-storage
	if (sessionStorage[key] !== tempValue) {
		// eslint-disable-next-line no-storage/no-browser-storage
		sessionStorage[key] = tempValue;
		return ref(tempValue);
	}
	return state;
}
