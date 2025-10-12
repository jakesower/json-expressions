/**
 * Predicate Expressions - Boolean Logic and Comparisons
 *
 * Operations that return true/false values:
 * - Comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 * - Existence checks ($exists, $isEmpty, $isPresent)
 * - Range checks ($between)
 * - Logical operations ($and, $or, $not)
 * - Pattern matching ($matchesAll, $matchesAny, $matchesRegex)
 */

import { get, isEqual } from "../helpers.js";

/**
 * Creates a comparative expression that applies a comparison function to resolved operands.
 *
 * @param {function(any, any): boolean} compareFn - Function that takes two values and returns a boolean comparison result
 * @returns {object} Expression object with apply method
 */
const createComparativeExpression =
	(compareFn) =>
	(operand, inputData, { apply, isWrappedLiteral }) => {
		if (isWrappedLiteral(operand)) {
			return compareFn(inputData, operand.$literal);
		}

		const resolved = apply(operand, inputData);

		if (Array.isArray(resolved) && resolved.length !== 2) {
			throw new Error(
				"Comparitive expressions in array form require exactly 2 elements",
			);
		}

		return Array.isArray(resolved)
			? compareFn(...resolved)
			: compareFn(inputData, resolved);
	};

/**
 * Creates an inclusion expression that checks if a value is in/not in an array.
 *
 * @param {function(any, Array): boolean} inclusionFn - Function that takes a value and array and returns boolean
 * @param {string} expressionName - Name of the expression for error messages
 * @returns {object} Expression object with apply method
 */
const createInclusionExpression =
	(expressionName, inclusionFn) =>
	(operand, inputData, { apply }) => {
		const resolvedOperand = apply(operand, inputData);
		if (!Array.isArray(resolvedOperand)) {
			throw new Error(`${expressionName} parameter must be an array`);
		}
		return inclusionFn(inputData, resolvedOperand);
	};

/**
 * Internal helper to test if a string matches a regex pattern with flag parsing.
 * @param {string} pattern - The regex pattern (possibly with inline flags)
 * @param {string} inputData - The string to test
 * @returns {boolean} Whether the pattern matches the input
 */
const testRegexPattern = (pattern, inputData) => {
	if (typeof inputData !== "string") {
		throw new Error("$matchesRegex requires string input");
	}

	// Extract inline flags and clean pattern
	const flagMatch = pattern.match(/^\(\?([ims]*)\)(.*)/);
	if (flagMatch) {
		const [, flags, patternPart] = flagMatch;
		let jsFlags = "";

		if (flags.includes("i")) jsFlags += "i";
		if (flags.includes("m")) jsFlags += "m";
		if (flags.includes("s")) jsFlags += "s";

		const regex = new RegExp(patternPart, jsFlags);
		return regex.test(inputData);
	}

	// Check for unsupported inline flags and strip them
	const unsupportedFlagMatch = pattern.match(/^\(\?[^)]*\)(.*)/);
	if (unsupportedFlagMatch) {
		const [, patternPart] = unsupportedFlagMatch;
		const regex = new RegExp(patternPart);
		return regex.test(inputData);
	}

	// No inline flags - use PCRE defaults
	const regex = new RegExp(pattern);
	return regex.test(inputData);
};

const $and = (operand, inputData, { apply }) => {
	return operand.every((expr) => apply(expr, inputData));
};

const $between = (operand, inputData, { apply }) => {
	const { min, max } = apply(operand, inputData);
	return inputData >= min && inputData <= max;
};

const $eq = createComparativeExpression((a, b) => isEqual(a, b));

const $gt = createComparativeExpression((a, b) => a > b);

const $gte = createComparativeExpression((a, b) => a >= b);

const $in = createInclusionExpression("$in", (value, array) =>
	array.includes(value),
);

const $isPresent = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);
	if (typeof resolved !== "boolean") {
		throw new Error("$isPresent requires boolean operand (true/false)");
	}
	const isPresent = inputData != null;
	return resolved ? isPresent : !isPresent;
};

const $isEmpty = (operand, inputData, { apply }) => {
	const resolved = apply(operand, inputData);
	if (typeof resolved !== "boolean") {
		throw new Error("$isEmpty requires boolean operand (true/false)");
	}
	const isEmpty = inputData == null;
	return resolved ? isEmpty : !isEmpty;
};

const $exists = (operand, inputData, { apply }) => {
	if (typeof inputData !== "object" || inputData === null) {
		throw new Error("$exists input data must be an object");
	}

	const resolvedPath = apply(operand, inputData);
	if (!Array.isArray(resolvedPath) && typeof resolvedPath !== "string") {
		throw new Error("$exists operand must resolve to an array or string path");
	}

	const pathPieces = Array.isArray(resolvedPath)
		? resolvedPath
		: resolvedPath.split(".");

	if (pathPieces.length === 1) {
		return pathPieces[0] in inputData && inputData[pathPieces[0]] !== undefined;
	}

	const lastObj = get(inputData, pathPieces.slice(0, -1));

	return (
		lastObj !== null &&
		typeof lastObj === "object" &&
		pathPieces.slice(-1)[0] in lastObj
	);
};

const $lt = createComparativeExpression((a, b) => a < b);

const $lte = createComparativeExpression((a, b) => a <= b);

const $matchesAll = (
	operand,
	inputData,
	{ apply, isExpression, isWrappedLiteral },
) => {
	if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
		throw new Error(
			"$matchesAll operand must be an object with property conditions",
		);
	}
	return Object.entries(operand).every(([path, condition]) => {
		const value = get(inputData, path);

		if (isWrappedLiteral(condition)) {
			return isEqual(condition.$literal, value);
		}
		if (isExpression(condition)) return apply(condition, value);

		return isEqual(value, condition);
	});
};

const $matchesAny = (
	operand,
	inputData,
	{ apply, isExpression, isWrappedLiteral },
) => {
	if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
		throw new Error(
			"$matchesAny operand must be an object with property conditions",
		);
	}
	return Object.entries(operand).some(([path, condition]) => {
		const value = get(inputData, path);

		if (isWrappedLiteral(condition)) {
			return isEqual(condition.$literal, value);
		}
		if (isExpression(condition)) return apply(condition, value);

		return isEqual(value, condition);
	});
};

const $matchesRegex = (operand, inputData, { apply }) => {
	const resolvedOperand = apply(operand, inputData);
	return testRegexPattern(resolvedOperand, inputData);
};

const $ne = createComparativeExpression((a, b) => !isEqual(a, b));

const $nin = createInclusionExpression(
	"$nin",
	(value, array) => !array.includes(value),
);

const $not = (operand, inputData, { apply }) => {
	return !apply(operand, inputData);
};

const $or = (operand, inputData, { apply }) => {
	return operand.some((expr) => apply(expr, inputData));
};

// Individual exports for tree shaking (alphabetized)
export {
	$and,
	$between,
	$eq,
	$exists,
	$gt,
	$gte,
	$in,
	$isEmpty,
	$isPresent,
	$lt,
	$lte,
	$matchesAll,
	$matchesAny,
	$matchesRegex,
	$ne,
	$nin,
	$not,
	$or,
};
