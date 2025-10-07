/**
 * Math Expressions - Arithmetic Operations
 *
 * Mathematical operations and calculations:
 * - Basic arithmetic ($add, $divide, $modulo, $multiply, $subtract)
 * - Aggregation ($count, $max, $mean, $min, $sum)
 * - Advanced math ($abs, $pow, $sqrt)
 */

/**
 * Creates a math expression that performs binary operations.
 * @param {function(number, number): number} operationFn - Function that takes (left, right) and returns result
 * @param {function(number, number): void} [validateFn] - Optional validation function for divide by zero checks
 * @returns {object} Expression object with apply method
 */
const createMathExpression =
  (operationFn, validateFn) =>
  (operand, inputData, { apply }) => {
    const resolved = apply(operand, inputData);

    if (validateFn) validateFn(inputData, resolved);
    if (Array.isArray(resolved) && resolved.length !== 2) {
      throw new Error(
        "Math expressions in array form require exactly 2 elements",
      );
    }

    return Array.isArray(resolved)
      ? operationFn(...resolved)
      : operationFn(inputData, resolved);
  };

/**
 * Creates an aggregative expression that applies a calculation function to either the operand or input data.
 * Follows the SpectraGraph pattern:
 * - If operand resolves to an array, aggregate the operand
 * - Otherwise, aggregate the input data (which must be an array)
 * - Respects $literal wrapping to prevent unwanted resolution
 *
 * @param {string} expressionName - Name of the expression for error messages (e.g., "$count", "$max")
 * @param {function(Array): any} calculateFn - Function that takes an array of values and returns a calculated result
 * @returns {function} Expression function that operates on operand or input data
 */
const createAggregativeExpression =
  (expressionName, calculateFn) =>
  (operand, inputData, { apply, isWrappedLiteral }) => {
    const resolved = isWrappedLiteral(operand)
      ? operand.$literal
      : apply(operand, inputData);

    if (!Array.isArray(resolved) && !Array.isArray(inputData)) {
      throw new Error(`${expressionName} requires array operand or input data`);
    }

    return Array.isArray(resolved)
      ? calculateFn(resolved)
      : calculateFn(inputData);
  };

const $abs = (operand, inputData) => Math.abs(inputData);

const $ceil = (operand, inputData) => Math.ceil(inputData);

const $floor = (operand, inputData) => Math.floor(inputData);

const $add = createMathExpression((left, right) => left + right);
const $subtract = createMathExpression((left, right) => left - right);
const $multiply = createMathExpression((left, right) => left * right);

const $divide = createMathExpression(
  (left, right) => left / right,
  (left, right) => {
    if (right === 0) {
      throw new Error("Division by zero");
    }
  },
);

const $modulo = createMathExpression(
  (left, right) => {
    // Mathematical modulo: result has same sign as divisor
    const result = left % right;
    return result < 0 && right > 0
      ? result + right
      : result > 0 && right < 0
        ? result + right
        : result;
  },
  (left, right) => {
    if (right === 0) {
      throw new Error("Modulo by zero");
    }
  },
);

const $pow = createMathExpression((left, right) => {
  // Check for complex number results
  if (left < 0 && right % 1 !== 0) {
    throw new Error(
      "Complex numbers are not supported (negative base with fractional exponent)",
    );
  }

  // Check for division by zero (0^negative = 1/0^positive = 1/0)
  if (left === 0 && right < 0) {
    throw new Error("Division by zero (0 raised to negative exponent)");
  }

  return Math.pow(left, right);
});

const $count = createAggregativeExpression("$count", (values) => values.length);

const $max = createAggregativeExpression("$max", (values) => {
  return values.length === 0
    ? null
    : values.reduce((max, v) => Math.max(max, v));
});

const $mean = createAggregativeExpression("$mean", (values) => {
  return values.length === 0
    ? null
    : values.reduce((sum, v) => sum + v, 0) / values.length;
});

const $min = createAggregativeExpression("$min", (values) => {
  return values.length === 0
    ? null
    : values.reduce((min, v) => Math.min(min, v));
});

const $sqrt = (operand, inputData) => {
  if (inputData < 0) {
    throw new Error(
      "Complex numbers are not supported (square root of negative number)",
    );
  }
  return Math.sqrt(inputData);
};

const $sum = createAggregativeExpression("$sum", (values) => {
  return values.reduce((sum, v) => sum + v, 0);
});

// Individual exports for tree shaking (alphabetized)
export {
  $abs,
  $add,
  $ceil,
  $count,
  $divide,
  $floor,
  $max,
  $mean,
  $min,
  $modulo,
  $multiply,
  $pow,
  $sqrt,
  $subtract,
  $sum,
};
