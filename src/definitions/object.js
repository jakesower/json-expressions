/**
 * Object Expressions - Key-Value Manipulation
 *
 * Implementation-focused definitions for object/dictionary operations:
 * - Object combination ($merge)
 * - Property selection ($pick, $omit)
 * - Object introspection ($keys, $values, $pairs, $fromPairs)
 */

const createKeyInclusionExpression =
	(keepFn, expressionName) =>
	(operand, inputData, { apply }) => {
		if (!Array.isArray(operand)) {
			throw new Error(
				`${expressionName} operand must be an array of property names`,
			);
		}

		if (!inputData || typeof inputData !== "object" || Array.isArray(inputData)) {
			return {};
		}

		const keySet = new Set(operand.map((path) => apply(path, inputData)));
		const result = {};
		Object.keys(inputData).forEach((key) => {
			if (keepFn(keySet, key)) {
				result[key] = inputData[key];
			}
		});

		return result;
	};

const createObjectExtractionExpression =
	(fn, expressionName) => (_, inputData) => {
		if (
			!inputData ||
			typeof inputData !== "object" ||
			Array.isArray(inputData)
		) {
			// Return appropriate empty value based on the extraction function
			if (fn === Object.keys || fn === Object.values) return [];
			if (fn === Object.entries) return [];
			return null;
		}
		return fn(inputData);
	};

const $merge = (operand, inputData, { apply }) => {
	const resolvedOperand = apply(operand, inputData);
	if (
		!resolvedOperand ||
		typeof resolvedOperand !== "object" ||
		Array.isArray(resolvedOperand)
	) {
		throw new Error("$merge operand must resolve to an object");
	}

	if (!inputData || typeof inputData !== "object" || Array.isArray(inputData)) {
		return resolvedOperand;
	}

	return Object.assign({}, inputData, resolvedOperand);
};

const $omit = createKeyInclusionExpression(
	(set, key) => !set.has(key),
	"$omit",
);

const $pick = createKeyInclusionExpression((set, key) => set.has(key), "$pick");

const $keys = createObjectExtractionExpression(Object.keys, "$keys");
const $values = createObjectExtractionExpression(Object.values, "$values");
const $pairs = createObjectExtractionExpression(Object.entries, "$pairs");

const $fromPairs = (_, inputData) => {
	if (!Array.isArray(inputData)) {
		return {};
	}

	const result = {};
	inputData.forEach((pair) => {
		if (!Array.isArray(pair) || pair.length !== 2) {
			throw new Error("$fromPairs requires array of [key, value] pairs");
		}
		const [key, value] = pair;
		result[key] = value;
	});

	return result;
};

// Individual exports
export { $merge, $pick, $omit, $keys, $values, $pairs, $fromPairs };
