import { isEqual } from "es-toolkit";

/**
 * Internal helper to validate a boolean condition and execute if/else logic.
 * @param {boolean} condition - The condition to check
 * @param {any} thenValue - Value to return if condition is true
 * @param {any} elseValue - Value to return if condition is false
 * @returns {any} The selected value based on condition
 */
const executeConditional = (condition, thenValue, elseValue) => {
  if (typeof condition !== "boolean") {
    throw new Error(
      `$if.if must be a boolean or an expression that resolves to one, got ${JSON.stringify(condition)}`,
    );
  }
  return condition ? thenValue : elseValue;
};

/**
 * Internal helper to find a matching case using flexible matching.
 * Supports both literal comparisons and expression predicates.
 * @param {any} value - The value to test against
 * @param {Array} cases - Array of case objects with 'when' and 'then' properties
 * @param {function} evaluateWhen - Function to evaluate the 'when' condition
 * @param {function} isExpression - Function to check if a value is an expression
 * @param {function} apply - Function to apply expressions with input data
 * @returns {object|undefined} The matching case object or undefined
 */
const findFlexibleCase = (
  value,
  cases,
  { apply, isExpression, isWrappedLiteral },
) =>
  cases.find((caseItem) => {
    const { when } = caseItem;

    if (when === undefined) {
      throw new Error("Case item must have 'when' property");
    }

    if (isWrappedLiteral(when)) {
      return isEqual(value, when.$literal);
    }

    if (isExpression(when)) {
      const applied = apply(when, value);
      if (typeof applied !== "boolean") {
        throw new Error(
          "only expressions that return true of false may be used in when clauses",
        );
      }

      return applied;
    }

    return isEqual(value, when);
  });

const $case = {
  apply(operand, inputData, { apply, isExpression, isWrappedLiteral }) {
    const value = apply(operand.value, inputData);
    const found = findFlexibleCase(value, operand.cases, {
      apply,
      isExpression,
      isWrappedLiteral,
    });
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { apply, evaluate, isExpression, isWrappedLiteral }) {
    // Handle array format for evaluate form
    const caseOperand = Array.isArray(operand) ? operand[0] : operand;
    const value = evaluate(caseOperand.value);
    const found = findFlexibleCase(value, caseOperand.cases, {
      apply,
      isExpression,
      isWrappedLiteral,
    });
    return found ? evaluate(found.then) : evaluate(caseOperand.default);
  },
};

const $if = {
  apply(operand, inputData, { apply }) {
    const condition = apply(operand.if, inputData);
    return executeConditional(
      condition,
      apply(operand.then, inputData),
      apply(operand.else, inputData),
    );
  },
  evaluate: (operand, { evaluate }) => {
    const condition = evaluate(operand.if);
    return executeConditional(
      condition,
      evaluate(operand.then),
      evaluate(operand.else),
    );
  },
};

// Individual exports for tree shaking
export { $if, $case };
