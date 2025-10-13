/**
 * Temporal Expressions - Date and Time Operations
 *
 * All expressions operate on ISO 8601 strings (JSON-native format).
 * Dates are represented as strings like "2025-10-05T11:23:45.234Z".
 *
 * Operations on date/time values:
 * - Arithmetic ($addTime) - supports negative values for subtraction
 * - Differences ($diffTime)
 * - Boundaries ($startOf, $endOf)
 * - Comparisons ($isAfter, $isBefore)
 * - Component extraction ($getTime)
 * - Formatting ($formatDate, $parseDate, $isDateValid)
 *
 * All operations are deterministic. For current time, inject it as input data
 * or create a custom $now expression.
 */

import { format, parse } from "date-fns";

/**
 * Parses an ISO 8601 string to a Date object.
 * @param {string} isoString - ISO 8601 date string
 * @returns {Date}
 */
const parseISO = (isoString) => {
	if (typeof isoString !== "string") {
		throw new Error(`Expected ISO 8601 string, got ${typeof isoString}`);
	}
	const date = new Date(isoString);
	if (isNaN(date.getTime())) {
		throw new Error(`Invalid ISO 8601 date string: "${isoString}"`);
	}
	return date;
};

/**
 * Formats a Date object to ISO 8601 string.
 * @param {Date} date - Date object
 * @returns {string}
 */
const formatISO = (date) => date.toISOString();

const SUPPORTED_UNITS = [
	"milliseconds",
	"seconds",
	"minutes",
	"hours",
	"days",
	"weeks",
	"months",
	"years",
];

const BOUNDARY_UNITS = ["day", "week", "month", "year"];

const COMPONENT_UNITS = [
	"year",
	"month",
	"day",
	"hour",
	"minute",
	"second",
	"dayOfWeek",
	"dayOfYear",
];

/**
 * Calculates difference between two dates in specified unit
 */
const calculateDifference = (date1, date2, unit) => {
	const ms = date2.getTime() - date1.getTime();

	switch (unit) {
		case "milliseconds":
			return ms;
		case "seconds":
			return Math.floor(ms / 1000);
		case "minutes":
			return Math.floor(ms / 60000);
		case "hours":
			return Math.floor(ms / 3600000);
		case "days":
			return Math.floor(ms / 86400000);
		case "weeks":
			return Math.floor(ms / (86400000 * 7));
		case "months": {
			const years = date2.getUTCFullYear() - date1.getUTCFullYear();
			const months = date2.getUTCMonth() - date1.getUTCMonth();
			return years * 12 + months;
		}
		case "years":
			return date2.getUTCFullYear() - date1.getUTCFullYear();
		default:
			throw new Error(`Unknown time unit: ${unit}`);
	}
};

/**
 * Adds a duration to a date. Use negative values to subtract.
 *
 * Supports two patterns:
 * - Operand form: { $addTime: { days: 7 } } with date in inputData
 * - Array form: { $addTime: ["2025-10-05", { days: 7 }] }
 *
 * Units: years, months, weeks, days, hours, minutes, seconds, milliseconds
 *
 * Examples:
 * - { $addTime: { days: 7 } }
 * - { $addTime: { days: -3 } } // subtract 3 days
 * - { $addTime: { days: 7, hours: 2, minutes: 30 } }
 * - { $addTime: ["2025-10-05T00:00:00Z", { days: 7 }] }
 * - { $addTime: { $fromPairs: [[{ $get: "unit" }, { $get: "value" }]] } }
 */
const $addTime = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [date, duration]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 2) {
			throw new Error(
				"$addTime array form requires exactly 2 elements: [date, duration]",
			);
		}
		const [isoString, duration] = resolved;

		if (
			typeof duration !== "object" ||
			duration === null ||
			Array.isArray(duration)
		) {
			throw new Error(
				"$addTime duration must be an object with time unit properties",
			);
		}

		// Validate units
		const units = Object.keys(duration);
		for (const unit of units) {
			if (!SUPPORTED_UNITS.includes(unit)) {
				throw new Error(
					`Unknown time unit: ${unit}. Supported units: ${SUPPORTED_UNITS.join(", ")}`,
				);
			}
		}

		const date = parseISO(isoString);

		// Manually add duration components using UTC methods
		const result = new Date(date);
		if (duration.years) {
			result.setUTCFullYear(result.getUTCFullYear() + duration.years);
		}
		if (duration.months) {
			result.setUTCMonth(result.getUTCMonth() + duration.months);
		}
		if (duration.weeks) {
			result.setUTCDate(result.getUTCDate() + duration.weeks * 7);
		}
		if (duration.days) result.setUTCDate(result.getUTCDate() + duration.days);
		if (duration.hours) {
			result.setUTCHours(result.getUTCHours() + duration.hours);
		}
		if (duration.minutes) {
			result.setUTCMinutes(result.getUTCMinutes() + duration.minutes);
		}
		if (duration.seconds) {
			result.setUTCSeconds(result.getUTCSeconds() + duration.seconds);
		}
		if (duration.milliseconds) {
			result.setUTCMilliseconds(
				result.getUTCMilliseconds() + duration.milliseconds,
			);
		}

		return formatISO(result);
	}

	// Operand form: duration object operates on inputData
	if (typeof resolved !== "object" || resolved === null) {
		throw new Error(
			"$addTime operand must be an object with time unit properties",
		);
	}

	// Validate units
	const units = Object.keys(resolved);
	for (const unit of units) {
		if (!SUPPORTED_UNITS.includes(unit)) {
			throw new Error(
				`Unknown time unit: ${unit}. Supported units: ${SUPPORTED_UNITS.join(", ")}`,
			);
		}
	}

	const date = parseISO(inputData);

	// Manually add duration components using UTC methods
	const result = new Date(date);
	if (resolved.years) {
		result.setUTCFullYear(result.getUTCFullYear() + resolved.years);
	}
	if (resolved.months) {
		result.setUTCMonth(result.getUTCMonth() + resolved.months);
	}
	if (resolved.weeks) {
		result.setUTCDate(result.getUTCDate() + resolved.weeks * 7);
	}
	if (resolved.days) result.setUTCDate(result.getUTCDate() + resolved.days);
	if (resolved.hours) result.setUTCHours(result.getUTCHours() + resolved.hours);
	if (resolved.minutes) {
		result.setUTCMinutes(result.getUTCMinutes() + resolved.minutes);
	}
	if (resolved.seconds) {
		result.setUTCSeconds(result.getUTCSeconds() + resolved.seconds);
	}
	if (resolved.milliseconds) {
		result.setUTCMilliseconds(
			result.getUTCMilliseconds() + resolved.milliseconds,
		);
	}

	return formatISO(result);
};

/**
 * Calculates the difference between two dates in a specific unit.
 *
 * Supports two patterns:
 * - Operand form: { $diffTime: { date: "2025-12-25", unit: "days" } } with comparison date in inputData
 * - Array form: { $diffTime: [date1, date2, unit] }
 *
 * Units: years, months, weeks, days, hours, minutes, seconds, milliseconds
 *
 * Examples:
 * - { $diffTime: { date: "2025-12-25", unit: "days" } } // diff between input and date
 * - { $diffTime: ["2025-10-05", "2025-12-25", "days"] } // diff between two dates
 */
const $diffTime = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [date1, date2, unit]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 3) {
			throw new Error(
				"$diffTime array form requires exactly 3 elements: [date1, date2, unit]",
			);
		}
		const [iso1, iso2, unit] = resolved;

		if (!SUPPORTED_UNITS.includes(unit)) {
			throw new Error(
				`Unknown time unit: ${unit}. Supported units: ${SUPPORTED_UNITS.join(", ")}`,
			);
		}

		const date1 = parseISO(iso1);
		const date2 = parseISO(iso2);

		return calculateDifference(date1, date2, unit);
	}

	// Operand form: { date, unit }
	if (typeof resolved !== "object" || resolved === null) {
		throw new Error(
			"$diffTime operand must be an object with 'date' and 'unit' properties or array [date1, date2, unit]",
		);
	}

	const { date, unit } = resolved;

	if (!date || !unit) {
		throw new Error(
			"$diffTime operand must have both 'date' and 'unit' properties",
		);
	}

	if (!SUPPORTED_UNITS.includes(unit)) {
		throw new Error(
			`Unknown time unit: ${unit}. Supported units: ${SUPPORTED_UNITS.join(", ")}`,
		);
	}

	const date1 = parseISO(inputData);
	const date2 = parseISO(date);

	return calculateDifference(date1, date2, unit);
};

/**
 * Gets the start of a time period (day, week, month, year).
 *
 * Operand: String unit name
 *
 * Examples:
 * - { $startOf: "day" }
 * - { $startOf: "month" }
 * - { $startOf: "year" }
 * - { $startOf: "week" }
 */
const $startOf = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	if (typeof resolved !== "string") {
		throw new Error("$startOf operand must be a string unit");
	}

	if (!BOUNDARY_UNITS.includes(resolved)) {
		throw new Error(
			`Unknown boundary unit: ${resolved}. Supported units: ${BOUNDARY_UNITS.join(", ")}`,
		);
	}

	const date = parseISO(inputData);
	const result = new Date(date);

	switch (resolved) {
		case "day":
			result.setUTCHours(0, 0, 0, 0);
			break;
		case "week": {
			// Start of week (Sunday)
			const day = result.getUTCDay();
			result.setUTCDate(result.getUTCDate() - day);
			result.setUTCHours(0, 0, 0, 0);
			break;
		}
		case "month":
			result.setUTCDate(1);
			result.setUTCHours(0, 0, 0, 0);
			break;
		case "year":
			result.setUTCMonth(0, 1);
			result.setUTCHours(0, 0, 0, 0);
			break;
	}

	return formatISO(result);
};

/**
 * Gets the end of a time period (day, week, month, year).
 *
 * Operand: String unit name
 *
 * Examples:
 * - { $endOf: "day" }
 * - { $endOf: "month" }
 * - { $endOf: "year" }
 * - { $endOf: "week" }
 */
const $endOf = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	if (typeof resolved !== "string") {
		throw new Error("$endOf operand must be a string unit");
	}

	if (!BOUNDARY_UNITS.includes(resolved)) {
		throw new Error(
			`Unknown boundary unit: ${resolved}. Supported units: ${BOUNDARY_UNITS.join(", ")}`,
		);
	}

	const date = parseISO(inputData);
	const result = new Date(date);

	switch (resolved) {
		case "day":
			result.setUTCHours(23, 59, 59, 999);
			break;
		case "week": {
			// End of week (Saturday)
			const day = result.getUTCDay();
			result.setUTCDate(result.getUTCDate() + (6 - day));
			result.setUTCHours(23, 59, 59, 999);
			break;
		}
		case "month":
			result.setUTCMonth(result.getUTCMonth() + 1, 0);
			result.setUTCHours(23, 59, 59, 999);
			break;
		case "year":
			result.setUTCMonth(11, 31);
			result.setUTCHours(23, 59, 59, 999);
			break;
	}

	return formatISO(result);
};

/**
 * Extracts a component from a date.
 *
 * Operand: String component name
 *
 * Examples:
 * - { $getTime: "year" }
 * - { $getTime: "month" }
 * - { $getTime: "dayOfWeek" }
 */
const $getTime = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	if (typeof resolved !== "string") {
		throw new Error("$getTime operand must be a string component name");
	}

	if (!COMPONENT_UNITS.includes(resolved)) {
		throw new Error(
			`Unknown time component: ${resolved}. Supported components: ${COMPONENT_UNITS.join(", ")}`,
		);
	}

	const date = parseISO(inputData);

	switch (resolved) {
		case "year":
			return date.getUTCFullYear();
		case "month":
			return date.getUTCMonth() + 1; // 1-indexed
		case "day":
			return date.getUTCDate();
		case "hour":
			return date.getUTCHours();
		case "minute":
			return date.getUTCMinutes();
		case "second":
			return date.getUTCSeconds();
		case "dayOfWeek":
			return date.getUTCDay(); // 0 = Sunday
		case "dayOfYear": {
			const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
			const diff = date - start;
			const oneDay = 1000 * 60 * 60 * 24;
			return Math.floor(diff / oneDay) + 1;
		}
		default:
			throw new Error(`Unsupported time component: ${resolved}`);
	}
};

/**
 * Tests if first date is after second date.
 *
 * Supports two patterns:
 * - Single operand: compare input to threshold
 * - Array form: compare two dates
 *
 * Examples:
 * - { $isAfter: "2025-10-05T00:00:00Z" }
 * - { $isAfter: [{ $get: "date1" }, { $get: "date2" }] }
 */
const $isAfter = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [date1, date2]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 2) {
			throw new Error(
				"$isAfter array form requires exactly 2 elements: [date1, date2]",
			);
		}
		const [iso1, iso2] = resolved;
		return parseISO(iso1).getTime() > parseISO(iso2).getTime();
	}

	// Single operand form: input > operand
	const inputDate = parseISO(inputData);
	const thresholdDate = parseISO(resolved);
	return inputDate.getTime() > thresholdDate.getTime();
};

/**
 * Tests if first date is before second date.
 *
 * Supports two patterns:
 * - Single operand: compare input to threshold
 * - Array form: compare two dates
 *
 * Examples:
 * - { $isBefore: "2025-10-05T00:00:00Z" }
 * - { $isBefore: [{ $get: "date1" }, { $get: "date2" }] }
 */
const $isBefore = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [date1, date2]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 2) {
			throw new Error(
				"$isBefore array form requires exactly 2 elements: [date1, date2]",
			);
		}
		const [iso1, iso2] = resolved;
		return parseISO(iso1).getTime() < parseISO(iso2).getTime();
	}

	// Single operand form: input < operand
	const inputDate = parseISO(inputData);
	const thresholdDate = parseISO(resolved);
	return inputDate.getTime() < thresholdDate.getTime();
};

/**
 * Formats a date using date-fns format function.
 * Format strings follow Unicode Technical Standard #35.
 * See: https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 *
 * Supports two patterns:
 * - Array form: { $formatDate: ["2025-10-05T11:23:45.234Z", "yyyy-MM-dd"] }
 * - Input data form: apply({ $formatDate: "yyyy-MM-dd" }, "2025-10-05T11:23:45.234Z")
 *
 * Common format tokens:
 * - yyyy: 4-digit year (e.g., 2025)
 * - MM: 2-digit month (e.g., 10)
 * - dd: 2-digit day (e.g., 05)
 * - HH: 2-digit hour (00-23)
 * - mm: 2-digit minute
 * - ss: 2-digit second
 * - EEEE: Day of week (e.g., Sunday)
 * - MMMM: Month name (e.g., October)
 */
const $formatDate = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [isoString, formatString]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 2) {
			throw new Error(
				"$formatDate in array form requires exactly 2 elements: [isoString, formatString]",
			);
		}
		const [isoString, formatString] = resolved;
		const date = parseISO(isoString);
		return format(date, formatString);
	}

	// Input data form: operand is format string, inputData is ISO string
	const date = parseISO(inputData);
	return format(date, resolved);
};

/**
 * Parses a date string using a format pattern and returns ISO 8601 string.
 * Format strings follow Unicode Technical Standard #35.
 * See: https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 *
 * Supports two patterns:
 * - Array form: { $parseDate: ["10/05/2025", "MM/dd/yyyy"] }
 * - Input data form: apply({ $parseDate: "MM/dd/yyyy" }, "10/05/2025")
 *
 * For ISO 8601 strings, you can use $parseDate without a format:
 * - { $parseDate: "2025-10-05T11:23:45.234Z" } (validates and returns ISO string)
 *
 * Common format tokens:
 * - yyyy: 4-digit year
 * - MM: 2-digit month (01-12)
 * - dd: 2-digit day (01-31)
 * - HH: 2-digit hour (00-23)
 * - mm: 2-digit minute
 * - ss: 2-digit second
 */
const $parseDate = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	// Array form: [dateString, formatString]
	if (Array.isArray(resolved)) {
		if (resolved.length !== 2) {
			throw new Error(
				"$parseDate in array form requires exactly 2 elements: [dateString, formatString]",
			);
		}
		const [dateString, formatString] = resolved;
		const date = parse(dateString, formatString, new Date());
		if (isNaN(date.getTime())) {
			throw new Error(
				`Invalid date string "${dateString}" for format "${formatString}"`,
			);
		}
		return formatISO(date);
	}

	// Input data form: operand is format string, inputData is date string
	// Special case: if operand is null, just validate ISO string
	if (resolved == null) {
		// Validate ISO string
		const date = new Date(inputData);
		if (isNaN(date.getTime())) {
			throw new Error(`Invalid ISO 8601 date string: "${inputData}"`);
		}
		return formatISO(date);
	}

	// If operand is a string (not null), it could be:
	// 1. A format pattern (use with inputData)
	// 2. An ISO string to validate (operand-only form)
	// Check if we're in operand-only form (inputData is null or undefined)
	if (inputData == null) {
		// Operand-only form: validate ISO string in operand
		const date = new Date(resolved);
		if (isNaN(date.getTime())) {
			throw new Error(`Invalid ISO 8601 date string: "${resolved}"`);
		}
		return formatISO(date);
	}

	const date = parse(inputData, resolved, new Date());
	if (isNaN(date.getTime())) {
		throw new Error(
			`Invalid date string "${inputData}" for format "${resolved}"`,
		);
	}
	return formatISO(date);
};

/**
 * Checks if a date string is valid.
 * Returns true if the date can be parsed, false otherwise.
 *
 * Supports two patterns:
 * - Array form: { $isDateValid: ["10/05/2025", "MM/dd/yyyy"] }
 * - Input data form: apply({ $isDateValid: "MM/dd/yyyy" }, "10/05/2025")
 * - ISO string validation: { $isDateValid: "2025-10-05T11:23:45.234Z" }
 *
 * Unlike $parseDate, this returns false instead of throwing on invalid dates.
 */
const $isDateValid = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);

	try {
		// Array form: [dateString, formatString]
		if (Array.isArray(resolved)) {
			if (resolved.length !== 2) {
				return false;
			}
			const [dateString, formatString] = resolved;
			const date = parse(dateString, formatString, new Date());
			return !isNaN(date.getTime());
		}

		// Input data form: operand is format string (or null for ISO validation)
		if (resolved == null) {
			// Validate ISO string
			const date = new Date(inputData);
			return !isNaN(date.getTime());
		}

		// If inputData is null, we're validating the operand as ISO string
		if (inputData == null) {
			const date = new Date(resolved);
			return !isNaN(date.getTime());
		}

		const date = parse(inputData, resolved, new Date());
		return !isNaN(date.getTime());
	} catch {
		return false;
	}
};

// Individual exports (alphabetized)
export {
	$addTime,
	$diffTime,
	$endOf,
	$formatDate,
	$getTime,
	$isAfter,
	$isBefore,
	$isDateValid,
	$parseDate,
	$startOf,
};
