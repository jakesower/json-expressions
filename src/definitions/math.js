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
 * @returns {object} Expression object with apply and evaluate methods
 */
const createMathExpression = (operationFn, validateFn) => ({
  apply: (operand, inputData, { apply }) => {
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
  },
  evaluate: (operand, { evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    }
    const [left, right] = operand;
    const leftValue = evaluate(left);
    const rightValue = evaluate(right);
    if (validateFn) validateFn(leftValue, rightValue);
    return operationFn(leftValue, rightValue);
  },
});

/**
 * Creates an aggregative expression that applies a calculation function to resolved values.
 *
 * @param {function(Array): any} calculateFn - Function that takes an array of values and returns a calculated result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createAggregativeExpression = (calculateFn) => ({
  apply(operand, inputData, { apply }) {
    const values = apply(operand, inputData);
    return calculateFn(values);
  },
  evaluate: (operand, { evaluate }) => {
    const values = evaluate(operand);
    return calculateFn(values);
  },
});

const $abs = {
  apply: (operand, inputData) => Math.abs(inputData),
  evaluate: (operand, { evaluate }) => Math.abs(evaluate(operand)),
};

const $ceil = {
  apply: (operand, inputData) => Math.ceil(inputData),
  evaluate: (operand, { evaluate }) => Math.ceil(evaluate(operand)),
};

const $floor = {
  apply: (operand, inputData) => Math.floor(inputData),
  evaluate: (operand, { evaluate }) => Math.floor(evaluate(operand)),
};

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
  (left, right) => left % right,
  (left, right) => {
    if (right === 0) {
      throw new Error("Modulo by zero");
    }
  },
);

const $pow = createMathExpression((left, right) => Math.pow(left, right));

const $count = createAggregativeExpression((values) => values.length);


const $max = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((max, v) => Math.max(max, v));
});

const $mean = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((sum, v) => sum + v, 0) / values.length;
});

const $min = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((min, v) => Math.min(min, v));
});

const $sqrt = {
  apply: (operand, inputData) => Math.sqrt(inputData),
  evaluate: (operand, { evaluate }) => Math.sqrt(evaluate(operand)),
};

const $sum = createAggregativeExpression((values) => {
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
