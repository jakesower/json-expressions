import { isEqual } from "es-toolkit";

/**
 * Creates a comparative expression that applies a comparison function to resolved operands.
 *
 * @param {function(any, any): boolean} compareFn - Function that takes two values and returns a boolean comparison result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createComparativeExpression = (compareFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    return compareFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    const [left, right] = operand;
    return compareFn(evaluate(left), evaluate(right));
  },
});

/**
 * Creates an inclusion expression that checks if a value is in/not in an array.
 *
 * @param {function(any, Array): boolean} inclusionFn - Function that takes a value and array and returns boolean
 * @param {string} expressionName - Name of the expression for error messages
 * @returns {object} Expression object with apply and evaluate methods
 */
const createInclusionExpression = (expressionName, inclusionFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    if (!Array.isArray(resolvedOperand)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    const [array, value] = evaluate(operand);
    if (!Array.isArray(array)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(value, array);
  },
});

const $eq = createComparativeExpression((a, b) => isEqual(a, b));
const $ne = createComparativeExpression((a, b) => !isEqual(a, b));
const $gt = createComparativeExpression((a, b) => a > b);
const $gte = createComparativeExpression((a, b) => a >= b);
const $lt = createComparativeExpression((a, b) => a < b);
const $lte = createComparativeExpression((a, b) => a <= b);

const $in = createInclusionExpression("$in", (value, array) =>
  array.includes(value),
);
const $nin = createInclusionExpression(
  "$nin",
  (value, array) => !array.includes(value),
);

const $between = {
  apply: (operand, inputData, { apply }) => {
    const { min, max } = apply(operand, inputData);
    return inputData >= min && inputData <= max;
  },
  evaluate: (operand, { evaluate }) => {
    const { value, min, max } = evaluate(operand);
    return value >= min && value <= max;
  },
};

const $isNull = {
  apply: (operand, inputData) => inputData == null,
  evaluate: (operand, { evaluate }) => evaluate(operand) == null,
};

const $isNotNull = {
  apply: (operand, inputData) => inputData != null,
  evaluate: (operand, { evaluate }) => evaluate(operand) != null,
};

// Individual exports for tree shaking
export {
  $eq,
  $gt,
  $gte,
  $lt,
  $lte,
  $ne,
  $in,
  $nin,
  $between,
  $isNull,
  $isNotNull,
};
