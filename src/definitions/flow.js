/**
 * Flow Expressions - Control Flow Operations
 *
 * Operations for controlling program flow and utilities:
 * - Pipeline control ($pipe, $debug)
 * - Data utilities ($literal, $default)
 */

const $debug = (operand, inputData, { apply }) => {
	const result = apply(operand, inputData);
	console.log("Debug:", { operand, inputData, result });
	return result;
};

const $default = (operand, inputData, { apply }) => {
	// Support array form: [expression, defaultValue]
	if (Array.isArray(operand)) {
		if (operand.length !== 2) {
			throw new Error(
				"$default array form must have exactly 2 elements: [expression, default]",
			);
		}

		const [expression, defaultValue] = operand;
		const check = (val) => val != null;
		const result = apply(expression, inputData);

		return check(result) ? result : apply(defaultValue, inputData);
	}

	// Support object form: { expression, default }
	if (
		typeof operand !== "object" ||
		operand === null ||
		!("expression" in operand) ||
		!("default" in operand)
	) {
		throw new Error(
			"$default operand must be an object with { expression, default } or array [expression, default]",
		);
	}

	const { expression } = operand;
	// In this system where null = undefined, treat them the same
	// Use != to check for both null and undefined
	const check = (val) => val != null;
	const result = apply(expression, inputData);

	return check(result) ? result : apply(operand.default, inputData);
};

const $literal = (operand) => operand;

const $pipe = (operand, inputData, { apply }) => {
	if (!Array.isArray(operand)) {
		throw new Error("$pipe operand must be an array of expressions");
	}

	return operand.reduce((data, expr, idx) => apply(expr, data, idx), inputData);
};

// Individual exports for tree shaking (alphabetized)
export { $debug, $default, $literal, $pipe };
