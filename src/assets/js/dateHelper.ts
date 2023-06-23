// VER: 2023-3
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import customInputFormats from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/sr";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(customInputFormats);
dayjs.extend(localizedFormat);
dayjs.extend(localeData);
// dayjs.locale("sr");

export class DateInstance {
	dateInstance: dayjs.Dayjs;
	defaultOutputFormat = "DD. MMM YYYY.";

	constructor(dateString = "", inFormat = "", isUtc = true) {
		if (inFormat) {
			const dateLogic = isUtc
				? dayjs.utc(dateString, inFormat)
				: dayjs(dateString, inFormat);
			const todayDateLogic = isUtc ? dayjs.utc() : dayjs();
			this.dateInstance = dateString ? dateLogic : todayDateLogic;
		} else {
			const dateLogic = isUtc ? dayjs.utc(dateString) : dayjs(dateString);
			const todayDateLogic = isUtc ? dayjs.utc() : dayjs();
			this.dateInstance = dateString ? dateLogic : todayDateLogic;
		}
	}

	formatDate(outFormat = this.defaultOutputFormat) {
		return getFormattedDate(this.dateInstance, outFormat);
	}

	formatIsoDate(timeFormat = "") {
		return getFormattedIsoDate(this.dateInstance, timeFormat);
	}

	changeGlobalLocale(locStr = "") {
		return dayjs.locale(locStr);
	}

	changeLocale(locStr = "") {
		return dayjs(this.dateInstance).locale(locStr);
	}

	changeOutputFormat(outFormat = "") {
		if (outFormat) {
			this.defaultOutputFormat = outFormat;
			return this;
		}
		console.error("Output format needed");
	}

	static getFormattedDate(date = "", outFormat = "l", isUtc = true) {
		const dateObj = getDateInstance(date, isUtc);
		return getFormattedDate(dateObj, outFormat);
	}

	static getFormattedIsoDate(date = "", timeFormat = "", isUtc = true) {
		const dateObj = getDateInstance(date, isUtc);
		return getFormattedIsoDate(dateObj, timeFormat);
	}

	static getDateInstance(date = "", isUtc = true) {
		return getDateInstance(date, isUtc);
	}

	static getDateLocaleData(date = "", isUtc = true) {
		const dateObj = getDateInstance(date, isUtc);
		return getDateLocaleData(dateObj);
	}

	static getRelativeTimeFromNow(date = "", isUtc = true) {
		return getRelativeTimeFromNow(date, isUtc);
	}

	/**
	 * Gets date difference from date2. If date2 is not provided, it will use current time
	 *
	 * @param date1 - The first date
	 * @param date2 - The second date, leave blank for today
	 * @param unit - The unit to be used for comparison, default is "day"
	 * @param isUtc - UTC date format, default is true
	 * @returns The date difference in the unit provided
	 *
	 */
	static getDateDiff(
		date1 = "",
		date2 = "",
		unit: dayjs.UnitType = "day",
		isUtc = true,
	) {
		if (date2) return getDateDiff(date1, date2, unit, isUtc);
		return getDateDiffToday(date1, unit, isUtc);
	}

	static isDateToday(date = "", unit: dayjs.UnitType = "day", isUtc = true) {
		return isDateToday(date, unit, isUtc);
	}

	static getFormatHasTime(format = "") {
		return getFormatHasTime(format);
	}
}

function getDateInstance(date = "", isUtc = true) {
	// Get date from string / today
	const dateLogic = isUtc ? dayjs.utc(date) : dayjs(date);
	const todayDateLogic = isUtc ? dayjs.utc() : dayjs();
	return date ? dateLogic : todayDateLogic;
}

function getFormattedDate(dateInstance: dayjs.Dayjs, outFormat = "l") {
	return dateInstance.format(outFormat);
}

function getFormattedIsoDate(dateInstance: dayjs.Dayjs, timeFormat = "") {
	return timeFormat
		? dateInstance.format(`YYYY-MM-DD ${timeFormat}`)
		: dateInstance.format("YYYY-MM-DD");
}

function getDateLocaleData(dateInstance: dayjs.Dayjs) {
	// https://day.js.org/docs/en/plugin/locale-data
	return dateInstance?.localeData();
}

function getRelativeTimeFromNow(date = "", isUtc = true) {
	if (isUtc) {
		return dayjs.utc(date).fromNow();
	} else {
		return dayjs(date).fromNow();
	}
}

function getDateDiffToday(
	date = "",
	unit: dayjs.UnitType = "day",
	isUtc = true,
) {
	if (isUtc) {
		const formattedLocal = dayjs.utc(date).local();
		return dayjs().diff(formattedLocal, unit);
	} else {
		const formattedLocal = dayjs(date).local();
		return dayjs().diff(formattedLocal, unit);
	}
}

function getDateDiff(
	date1 = "",
	date2 = "",
	unit: dayjs.UnitType = "day",
	isUtc = true,
) {
	// Dates must be same format
	return dayjs(date1).diff(date2, unit);
}

function isDateToday(date = "", unit: dayjs.UnitType = "day", isUtc = true) {
	return getDateDiffToday(date, unit, isUtc) < 1;
}

function getFormatHasTime(format: string) {
	const timeFormats = ["H", "h", "m", "s"];
	return timeFormats.some((tf) => format.includes(tf));
}
