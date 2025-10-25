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
 * @property {function(any): string[]} validateExpression - Validate an expression tree, returning array of error messages (empty if valid)
 * @property {function(any): void} ensureValidExpression - Validate an expression tree, throwing all errors joined by newline
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

	const isExpression = (val) =>
		looksLikeExpression(val) && Object.keys(val)[0] in expressions;

	const validateExpression = (val) => {
		const errors = [];

		const validate = (value) => {
			if (value === null || value === undefined) {
				return;
			}

			if (Array.isArray(value)) {
				value.forEach(validate);
				return;
			}

			if (looksLikeExpression(value)) {
				if (!isExpression(value)) {
					const invalidOp = Object.keys(value)[0];
					const availableOps = Object.keys(expressions);
					const suggestion = didYouMean(invalidOp, availableOps);
					const helpText = suggestion
						? `Did you mean "${suggestion}"?`
						: `Available operators: ${availableOps
								.slice(0, 8)
								.join(", ")}${availableOps.length > 8 ? ", ..." : ""}.`;
					errors.push(
						`Unknown expression operator: "${invalidOp}". ${helpText}`,
					);
					return;
				}

				const expressionName = Object.keys(value)[0];
				const operand = value[expressionName];

				// Don't validate inside $literal
				if (expressionName !== "$literal") {
					validate(operand);
				}
				return;
			}

			if (typeof value === "object") {
				Object.values(value).forEach(validate);
			}
		};

		validate(val);
		return errors;
	};

	const ensureValidExpression = (val) => {
		const errors = validateExpression(val);
		if (errors.length > 0) {
			throw new Error(errors.join("\n"));
		}
	};

	const checkLooksLikeExpression = (val) => {
		if (looksLikeExpression(val)) {
			const invalidOp = Object.keys(val)[0];
			const availableOps = Object.keys(expressions);

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

	const applyWithErrorMode = (errorMode) => {
		const apply = (val, inputData, path) => {
			const applyWithPath = errorMode
				? (crumb) => (val, inputData, step) =>
						step === undefined
							? apply(val, inputData, [...path, crumb])
							: Array.isArray(step)
								? apply(val, inputData, [...path, crumb, ...step])
								: apply(val, inputData, [...path, crumb, step])
				: apply; // True fast path - no closure at all

			if (isExpression(val)) {
				const expressionName = Object.keys(val)[0];
				const operand = val[expressionName];
				const expressionDef = expressions[expressionName];

				try {
					// Skip middleware overhead when no middleware configured
					if (middleware.length === 0) {
						return expressionDef(operand, inputData, {
							apply: errorMode ? applyWithPath(expressionName) : apply,
							isExpression,
							isWrappedLiteral,
						});
					}

					return middleware.reduceRight(
						(next, mw) => (nextOperand, nextInputData) =>
							mw(nextOperand, nextInputData, next, { expressionName, path }),
						(finalOperand, finalInputData) =>
							expressionDef(finalOperand, finalInputData, {
								apply: errorMode ? applyWithPath(expressionName) : apply,
								isExpression,
								isWrappedLiteral,
							}),
					)(operand, inputData);
				} catch (err) {
					if (err[CAUGHT_IN_ENGINE] || !errorMode) {
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
				? errorMode
					? val.map((v, idx) => apply(v, inputData, [...path, idx]))
					: val.map((v) => apply(v, inputData, path))
				: val !== null && typeof val === "object"
					? errorMode
						? mapValues(val, (v, key) => apply(v, inputData, [...path, key]))
						: mapValues(val, (v) => apply(v, inputData, path))
					: val;
		};

		return apply;
	};

	const fastApply = applyWithErrorMode(false);
	const slowApply = applyWithErrorMode(true);

	return {
		apply: (val, inputData) => {
			try {
				return fastApply(val, inputData, []);
			} catch {
				// If fastApply threw, slowApply MUST also throw (with path info).
				// If slowApply returns instead of throwing, the expression is non-deterministic.
				slowApply(val, inputData, []);
				throw new Error(
					"Error mode failed to throw. Is your expression deterministic?",
				);
			}
		},
		expressionNames: Object.keys(expressions),
		isExpression,
		validateExpression,
		ensureValidExpression,
	};
}
