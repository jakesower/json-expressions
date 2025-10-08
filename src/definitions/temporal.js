/**
 * Temporal Expressions - Date and Time Operations
 *
 * All expressions operate on ISO 8601 strings (JSON-native format).
 * Dates are represented as strings like "2025-10-05T11:23:45.234Z".
 *
 * Operations on date/time values:
 * - Arithmetic ($addDays, $addMonths, $addYears, $subDays, $subMonths, $subYears)
 * - Differences ($diffDays, $diffMonths, $diffYears, $diffHours, $diffMinutes)
 * - Boundaries ($startOfDay, $endOfDay, $startOfMonth, $endOfMonth, $startOfYear, $endOfYear)
 * - Comparisons ($isAfter, $isBefore, $isSameDay)
 * - Predicates ($isWeekend, $isWeekday)
 * - Components ($year, $month, $day, $hour, $minute, $dayOfWeek)
 * - Formatting ($formatDate)
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

/**
 * Creates a unary temporal expression (operates on single date).
 * Supports two patterns:
 * - Operand form: { $startOfDay: "2025-10-05T11:23:45.234Z" }
 * - Input data form: apply({ $startOfDay: null }, "2025-10-05T11:23:45.234Z")
 *
 * @param {function(Date): Date|number} fn - Function that takes a Date and returns Date or number
 * @returns {function} Expression function
 */
const createUnaryTemporalExpression =
	(fn) =>
	(operand, inputData, { apply }) => {
		const resolved = apply(operand, inputData);

		// If operand resolves to null/undefined, use inputData
		const isoString = resolved == null ? inputData : resolved;
		const date = parseISO(isoString);
		const result = fn(date);
		return result instanceof Date ? formatISO(result) : result;
	};

/**
 * Creates a binary temporal expression (operates on date + argument).
 * Supports two patterns:
 * - Array form: { $addDays: ["2025-10-05T00:00:00Z", 7] }
 * - Input data form: apply({ $addDays: 7 }, "2025-10-05T00:00:00Z")
 *
 * @param {function(Date, any): Date|number} fn - Function that takes a Date and argument
 * @returns {function} Expression function
 */
const createBinaryTemporalExpression =
	(fn) =>
	(operand, inputData, { apply }) => {
		const resolved = apply(operand, inputData);

		// Array form: [isoString, argument]
		if (Array.isArray(resolved)) {
			if (resolved.length !== 2) {
				throw new Error(
					"Binary temporal expressions in array form require exactly 2 elements: [isoString, argument] or a single argument that operates on ISO string input data",
				);
			}
			const [isoString, arg] = resolved;
			const date = parseISO(isoString);
			const result = fn(date, arg);
			return result instanceof Date ? formatISO(result) : result;
		}

		// Input data form: operand is the argument, inputData is the ISO string
		const date = parseISO(inputData);
		const result = fn(date, resolved);
		return result instanceof Date ? formatISO(result) : result;
	};

/**
 * Creates a comparison temporal expression (compares two dates).
 * Supports two patterns:
 * - Array form: { $isAfter: ["2025-10-08T00:00:00Z", "2025-10-05T00:00:00Z"] }
 * - Input data form: apply({ $isAfter: "2025-10-05T00:00:00Z" }, "2025-10-08T00:00:00Z")
 *
 * @param {function(Date, Date): boolean|number} fn - Function that compares two Dates
 * @returns {function} Expression function
 */
const createComparisonTemporalExpression =
	(fn) =>
	(operand, inputData, { apply }) => {
		const resolved = apply(operand, inputData);

		// Array form: [isoString1, isoString2]
		if (Array.isArray(resolved)) {
			if (resolved.length !== 2) {
				throw new Error(
					"Comparison temporal expressions in array form require exactly 2 elements: [isoString1, isoString2] or a single argument that operates on ISO string input data (operand is in slot 2, input data in slot 1)",
				);
			}
			const [iso1, iso2] = resolved;
			return fn(parseISO(iso1), parseISO(iso2));
		}

		// Input data form: operand is second date, inputData is first date
		return fn(parseISO(inputData), parseISO(resolved));
	};

// Arithmetic operations
const $addDays = createBinaryTemporalExpression((date, days) => {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
});

const $addMonths = createBinaryTemporalExpression((date, months) => {
	const result = new Date(date);
	result.setUTCMonth(result.getUTCMonth() + months);
	return result;
});

const $addYears = createBinaryTemporalExpression((date, years) => {
	const result = new Date(date);
	result.setUTCFullYear(result.getUTCFullYear() + years);
	return result;
});

const $addHours = createBinaryTemporalExpression((date, hours) => {
	const result = new Date(date);
	result.setUTCHours(result.getUTCHours() + hours);
	return result;
});

const $addMinutes = createBinaryTemporalExpression((date, minutes) => {
	const result = new Date(date);
	result.setUTCMinutes(result.getUTCMinutes() + minutes);
	return result;
});

const $subDays = createBinaryTemporalExpression((date, days) => {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() - days);
	return result;
});

const $subMonths = createBinaryTemporalExpression((date, months) => {
	const result = new Date(date);
	result.setUTCMonth(result.getUTCMonth() - months);
	return result;
});

const $subYears = createBinaryTemporalExpression((date, years) => {
	const result = new Date(date);
	result.setUTCFullYear(result.getUTCFullYear() - years);
	return result;
});

// Difference operations
const $diffMilliseconds = createComparisonTemporalExpression(
	(date1, date2) => date2.getTime() - date1.getTime(),
);

const $diffSeconds = createComparisonTemporalExpression((date1, date2) =>
	Math.floor((date2.getTime() - date1.getTime()) / 1000),
);

const $diffMinutes = createComparisonTemporalExpression((date1, date2) =>
	Math.floor((date2.getTime() - date1.getTime()) / 60000),
);

const $diffHours = createComparisonTemporalExpression((date1, date2) =>
	Math.floor((date2.getTime() - date1.getTime()) / 3600000),
);

const $diffDays = createComparisonTemporalExpression((date1, date2) =>
	Math.floor((date2.getTime() - date1.getTime()) / 86400000),
);

const $diffMonths = createComparisonTemporalExpression((date1, date2) => {
	const years = date2.getUTCFullYear() - date1.getUTCFullYear();
	const months = date2.getUTCMonth() - date1.getUTCMonth();
	return years * 12 + months;
});

const $diffYears = createComparisonTemporalExpression(
	(date1, date2) => date2.getUTCFullYear() - date1.getUTCFullYear(),
);

// Boundary operations
const $startOfDay = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCHours(0, 0, 0, 0);
	return result;
});

const $endOfDay = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCHours(23, 59, 59, 999);
	return result;
});

const $startOfMonth = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCDate(1);
	result.setUTCHours(0, 0, 0, 0);
	return result;
});

const $endOfMonth = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCMonth(result.getUTCMonth() + 1, 0);
	result.setUTCHours(23, 59, 59, 999);
	return result;
});

const $startOfYear = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCMonth(0, 1);
	result.setUTCHours(0, 0, 0, 0);
	return result;
});

const $endOfYear = createUnaryTemporalExpression((date) => {
	const result = new Date(date);
	result.setUTCMonth(11, 31);
	result.setUTCHours(23, 59, 59, 999);
	return result;
});

// Comparison operations
const $isAfter = createComparisonTemporalExpression(
	(date1, date2) => date1.getTime() > date2.getTime(),
);

const $isBefore = createComparisonTemporalExpression(
	(date1, date2) => date1.getTime() < date2.getTime(),
);

const $isSameDay = createComparisonTemporalExpression((date1, date2) => {
	return (
		date1.getUTCFullYear() === date2.getUTCFullYear() &&
		date1.getUTCMonth() === date2.getUTCMonth() &&
		date1.getUTCDate() === date2.getUTCDate()
	);
});

// Predicate operations
const $isWeekend = createUnaryTemporalExpression((date) => {
	const day = date.getUTCDay();
	return day === 0 || day === 6;
});

const $isWeekday = createUnaryTemporalExpression((date) => {
	const day = date.getUTCDay();
	return day !== 0 && day !== 6;
});

// Component extraction
const $year = createUnaryTemporalExpression((date) => date.getUTCFullYear());

const $month = createUnaryTemporalExpression((date) => date.getUTCMonth() + 1);

const $day = createUnaryTemporalExpression((date) => date.getUTCDate());

const $hour = createUnaryTemporalExpression((date) => date.getUTCHours());

const $minute = createUnaryTemporalExpression((date) => date.getUTCMinutes());

const $second = createUnaryTemporalExpression((date) => date.getUTCSeconds());

const $dayOfWeek = createUnaryTemporalExpression((date) => date.getUTCDay());

const $dayOfYear = createUnaryTemporalExpression((date) => {
	const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	const diff = date - start;
	const oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay) + 1;
});

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

// Individual exports for tree shaking (alphabetized)
export {
	$addDays,
	$addHours,
	$addMinutes,
	$addMonths,
	$addYears,
	$day,
	$dayOfWeek,
	$dayOfYear,
	$diffDays,
	$diffHours,
	$diffMilliseconds,
	$diffMinutes,
	$diffMonths,
	$diffSeconds,
	$diffYears,
	$endOfDay,
	$endOfMonth,
	$endOfYear,
	$formatDate,
	$hour,
	$isAfter,
	$isBefore,
	$isDateValid,
	$isSameDay,
	$isWeekday,
	$isWeekend,
	$minute,
	$month,
	$parseDate,
	$second,
	$startOfDay,
	$startOfMonth,
	$startOfYear,
	$subDays,
	$subMonths,
	$subYears,
	$year,
};
