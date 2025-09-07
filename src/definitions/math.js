/**
 * Creates a math expression that performs binary operations.
 * @param {function(number, number): number} operationFn - Function that takes (left, right) and returns result
 * @param {function(number, number): void} [validateFn] - Optional validation function for divide by zero checks
 * @returns {object} Expression object with apply and evaluate methods
 */
const createMathExpression = (operationFn, validateFn) => ({
  apply: (operand, inputData) => {
    if (validateFn) validateFn(inputData, operand);
    return operationFn(inputData, operand);
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

const $abs = {
  apply: (operand, inputData) => Math.abs(inputData),
  evaluate: (operand, { evaluate }) => Math.abs(evaluate(operand)),
};

const $pow = createMathExpression((left, right) => Math.pow(left, right));

const $sqrt = {
  apply: (operand, inputData) => Math.sqrt(inputData),
  evaluate: (operand, { evaluate }) => Math.sqrt(evaluate(operand)),
};

// Individual exports for tree shaking
export { $add, $subtract, $multiply, $divide, $modulo, $abs, $pow, $sqrt };
