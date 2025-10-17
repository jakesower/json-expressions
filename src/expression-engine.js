import didYouMean from "didyoumean";
import { base } from "./packs/base.js";
import { mapValues } from "es-toolkit";
import { $literal } from "./definitions/flow.js";

const CAUGHT_IN_ENGINE = Symbol("caught in engine");

/**
 * @typedef {object} ExpressionContext
 * @property {function(any, any, number|string|Array<number|string>=): any} apply - Apply an expression to input data. Optional third parameter adds path segment(s) for error tracking. Can be a single step (number/string) or array of steps (e.g., [0, "when"] for $case).
 * @property {function(any): boolean} isExpression - Check if a value is an expression
 * @property {function(any): boolean} isWrappedLiteral - Check if a value is a wrapped literal
 */

/**
 * @template Operand, Input, Output
 * @typedef {function(Operand, Input, ExpressionContext): Output} Expression
 */

/**
 * @typedef {object} ExpressionEngine
 * @property {function(any, any): any} apply - Apply an expression to input data
 * @property {string[]} expressionNames - List of available expression names
 * @property {function(any): boolean} isExpression - Check if a value is an expression
 */

function looksLikeExpression(val) {
	return (
		val !== null &&
		typeof val === "object" &&
		!Array.isArray(val) &&
		Object.keys(val).length === 1 &&
		Object.keys(val)[0].startsWith("$")
	);
}

function isWrappedLiteral(val) {
	return (
		val &&
		typeof val === "object" &&
		Object.keys(val).length === 1 &&
		"$literal" in val
	);
}

function buildPathStr(path) {
	return path.reduce(
		(acc, step) =>
			`${acc}${typeof step === "number" ? `[${step}]` : `.${step}`}`,
	);
}

/**
 * @typedef {function(any, any, function(any, any): any, {expressionName: string, path: Array<string|number>}): any} Middleware
 */

/**
 * @typedef {object} ExpressionEngineConfig
 * @property {object[]} [packs] - Array of expression pack objects to include
 * @property {object} [custom] - Custom expression definitions
 * @property {boolean} [includeBase=true] - Whether to include base expressions
 * @property {string[]} [exclude] - Expression names to exclude (applied after all packs and custom are merged, but before $literal)
 * @property {Middleware[]} [middleware] - Array of middleware functions to wrap expression evaluation
 */

/**
 * @param {ExpressionEngineConfig} [config={}] - Configuration object for the expression engine
 * @returns {ExpressionEngine}
 */
export function createExpressionEngine(config = {}) {
	const {
		packs = [],
		custom = {},
		includeBase = true,
		exclude = [],
		middleware = [],
	} = config;

	const mergedExpressions = [
		...(includeBase ? [base] : []),
		...packs,
		custom,
	].reduce((acc, pack) => ({ ...acc, ...pack }), {});

	// Apply exclusions (silently ignore non-existent expressions)
	exclude.forEach((name) => {
		delete mergedExpressions[name];
	});

	// Add $literal last (cannot be excluded)
	const expressions = {
		...mergedExpressions,
		$literal,
	};

	// Convert to Map for faster lookup
	const expressionMap = new Map(Object.entries(expressions));

	const isExpression = (val) =>
		looksLikeExpression(val) && expressionMap.has(Object.keys(val)[0]);

	const checkLooksLikeExpression = (val) => {
		if (looksLikeExpression(val)) {
			const [invalidOp] = Object.keys(val);
			const availableOps = Array.from(expressionMap.keys());

			const suggestion = didYouMean(invalidOp, availableOps);
			const helpText = suggestion
				? `Did you mean "${suggestion}"?`
				: `Available operators: ${availableOps
						.slice(0, 8)
						.join(", ")}${availableOps.length > 8 ? ", ..." : ""}.`;

			const message = `Unknown expression operator: "${invalidOp}". ${helpText} Use { $literal: ${JSON.stringify(val)} } if you meant this as a literal value.`;

			throw new Error(message);
		}
	};

	const apply = (val, inputData, path) => {
		const applyWithPath = (crumb) => (val, inputData, step) =>
			step === undefined
				? apply(val, inputData, [...path, crumb])
				: Array.isArray(step)
					? apply(val, inputData, [...path, crumb, ...step])
					: apply(val, inputData, [...path, crumb, step]);

		if (isExpression(val)) {
			const [expressionName, operand] = Object.entries(val)[0];
			const expressionDef = expressionMap.get(expressionName);

			try {
				return middleware.reduceRight(
					(next, mw) => (nextOperand, nextInputData) =>
						mw(nextOperand, nextInputData, next, { expressionName, path }),
					(finalOperand, finalInputData) =>
						expressionDef(finalOperand, finalInputData, {
							apply: applyWithPath(expressionName),
							isExpression,
							isWrappedLiteral,
						}),
				)(operand, inputData);
			} catch (err) {
				if (err[CAUGHT_IN_ENGINE]) {
					throw err;
				}

				// Preserve custom error types (like ExpressionNotSupportedError)
				// by adding path info but keeping the original error instance
				if (err.constructor !== Error) {
					const pathStr = buildPathStr([...path, expressionName]);
					err.message = `[${pathStr}] ${err.message}`;
					err[CAUGHT_IN_ENGINE] = true;
					throw err;
				}

				const outErr = Error(
					`[${buildPathStr([...path, expressionName])}] ${err.message}`,
				);
				outErr[CAUGHT_IN_ENGINE] = true;
				throw outErr;
			}
		}

		checkLooksLikeExpression(val);

		return Array.isArray(val)
			? val.map((v, idx) => apply(v, inputData, [...path, idx]))
			: val !== null && typeof val === "object"
				? mapValues(val, (v, key) => apply(v, inputData, [...path, key]))
				: val;
	};

	return {
		apply: (val, inputData) => apply(val, inputData, []),
		expressionNames: Array.from(expressionMap.keys()),
		isExpression,
	};
}
