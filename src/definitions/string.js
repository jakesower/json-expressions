/**
 * String Expressions - Text Processing Operations
 *
 * Operations for text manipulation and processing:
 * - Transformations ($lowercase, $substring, $trim, $uppercase)
 * - Operations ($replace, $split)
 */

/**
 * Creates a string transformation expression that operates on either operand or input data.
 * Follows the pattern:
 * - If operand resolves to a string, transform the operand
 * - Otherwise, transform the input data
 * - Respects $literal wrapping to prevent unwanted resolution
 *
 * @param {function(string): any} transformFn - Function that transforms the string
 * @returns {object} Expression object with apply method
 */
const createStringTransformExpression =
	(transformFn) =>
	(operand, inputData, { apply, isWrappedLiteral }) => {
		const resolved = isWrappedLiteral(operand)
			? operand.$literal
			: apply(operand, inputData);

		return typeof resolved === "string"
			? transformFn(resolved)
			: transformFn(inputData);
	};

/**
 * Creates a string operation expression with parameters.
 *
 * @param {function(string, ...any): any} operationFn - Function that operates on string with params
 * @returns {object} Expression object with apply method
 */
const createStringOperationExpression =
	(operationFn) =>
	(operand, inputData, { apply }) => {
		if (Array.isArray(operand)) {
			const [param, ...rest] = operand;
			return operationFn(
				inputData,
				apply(param, inputData, 0),
				...rest.map((r, idx) => apply(r, inputData, idx + 1)),
			);
		}
		return operationFn(inputData, apply(operand, inputData));
	};

const $lowercase = createStringTransformExpression((str) => str.toLowerCase());

const $replace = createStringOperationExpression((str, search, replacement) =>
	str.replace(new RegExp(search, "g"), replacement),
);

const $split = createStringOperationExpression((str, delimiter) =>
	str.split(delimiter),
);

const $substring = createStringOperationExpression((str, start, length) =>
	length !== undefined ? str.slice(start, start + length) : str.slice(start),
);

const $trim = createStringTransformExpression((str) => str.trim());

const $uppercase = createStringTransformExpression((str) => str.toUpperCase());

// Individual exports (alphabetized)
export { $lowercase, $replace, $split, $substring, $trim, $uppercase };
