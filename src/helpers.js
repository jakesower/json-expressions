/**
 * Expression Authoring Helpers
 *
 * Utilities to simplify custom expression creation.
 */

/**
 * @template Resolved, Input, Output
 * @callback ResolvedExpressionFunction
 * @param {Resolved} resolved - The resolved operand value
 * @param {Input} inputData - The input data passed to the expression
 * @param {import('./expression-engine.js').ExpressionContext} context - The expression context
 * @returns {Output} The result of the expression
 */

/**
 * Wraps a function to automatically resolve the operand before calling it.
 * Useful for expressions that always want to work with resolved values.
 *
 * @template Resolved, Input, Output
 * @param {ResolvedExpressionFunction<Resolved, Input, Output>} fn - Function to call with resolved operand
 * @returns {import('./expression-engine.js').Expression<any, Input, Output>} Expression function that auto-resolves operand
 *
 * @example
 * const $trim = withResolvedOperand((str) => str.trim());
 * // { $trim: { $get: "name" } }, resolves operand, calls trim on result
 */
export const withResolvedOperand = (fn) => (operand, inputData, context) => {
	const resolved = context.apply(operand, inputData);
	return fn(resolved, inputData, context);
};

/**
 * @template T
 * @callback UnaryFunction
 * @param {T} value - The value to operate on
 * @returns {any} The result
 */

/**
 * @template A, B
 * @callback BinaryFunction
 * @param {A} first - The first argument
 * @param {B} second - The second argument
 * @returns {any} The result
 */

/**
 * Creates a bimodal expression that operates on either operand or inputData based on arity.
 * This enables expressions to work flexibly with two calling patterns:
 * 1. Operating on inputData with operand providing parameters
 * 2. Operating on operand with inputData as context
 *
 * For unary functions (1 param):
 *   - If operand is null/undefined, operates on inputData
 *   - Otherwise, operates on resolved operand
 *
 * For binary functions (2 params):
 *   - If operand resolves to 2-element array, spreads as both arguments
 *   - Otherwise, inputData is first arg, resolved operand is second arg
 *
 * @template {UnaryFunction<any>|BinaryFunction<any, any>} Fn
 * @param {Fn} fn - Unary or binary function to wrap (arity must be 1 or 2)
 * @returns {import('./expression-engine.js').Expression<any, any, any>} Expression function with bimodal behavior
 * @throws {Error} If function arity is not 1 or 2
 *
 * @example
 * // Unary: operate on value
 * const $double = createBimodalExpression((val) => val * 2);
 * // { $double: null }, doubles inputData
 * // { $double: { $get: "age" } }, doubles the operand result
 *
 * @example
 * // Binary: takes a parameter
 * const $logN = createBimodalExpression((value, base) => Math.log(value) / Math.log(base));
 * // { $logN: 2 }, log base 2 of inputData
 * // { $logN: [{ $get: "age" }, 2] }, log base 2 of age
 */
export const createBimodalExpression =
	(fn) =>
	(operand, inputData, { apply }) => {
		const resolved = apply(operand, inputData);

		if (fn.length === 1) {
			return resolved == null ? fn(inputData) : fn(resolved);
		}

		if (fn.length === 2) {
			return Array.isArray(resolved) && resolved.length === 2
				? fn(...resolved)
				: fn(inputData, resolved);
		}

		throw new Error("only unary and binary functions can be wrapped");
	};
