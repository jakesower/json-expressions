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

/**
 * Check if an expression is a boolean predicate (comparison/logic operator)
 * @param {any} expr - The expression to check
 * @returns {boolean} True if it's a boolean predicate expression
 */
const isBooleanPredicate = (expr) => {
  if (!expr || typeof expr !== "object" || Array.isArray(expr)) {
    return false;
  }

  const [key] = Object.keys(expr);
  // Boolean predicate operators that return true/false
  const booleanOps = [
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$eq",
    "$ne",
    "$in",
    "$nin",
    "$isNull",
    "$isNotNull",
    "$between",
    "$and",
    "$or",
    "$not",
    "$matchesRegex",
    "$matchesLike",
    "$matchesGlob",
    "$all",
    "$any",
  ];

  return booleanOps.includes(key);
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
const findFlexibleCase = (value, cases, evaluateWhen, isExpression, apply) => {
  return cases.find((caseItem) => {
    if (caseItem.when === undefined) {
      throw new Error("Case item must have 'when' property");
    }

    if (isExpression(caseItem.when) && isBooleanPredicate(caseItem.when)) {
      // Boolean predicate mode: apply the expression with value as input data
      const condition = apply(caseItem.when, value);
      if (typeof condition !== "boolean") {
        throw new Error(
          `$case.when expression must resolve to a boolean, got ${JSON.stringify(condition)}`,
        );
      }
      return condition;
    } else {
      // Literal mode: evaluate when clause and deep equality comparison
      const evaluatedWhen = evaluateWhen(caseItem.when);
      return isEqual(value, evaluatedWhen);
    }
  });
};

const $case = {
  apply(operand, inputData, { apply, isExpression }) {
    const value = apply(operand.value, inputData);
    const found = findFlexibleCase(
      value,
      operand.cases,
      (when) => apply(when, inputData),
      isExpression,
      apply,
    );
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { evaluate, isExpression, apply }) {
    // Handle array format for evaluate form
    const caseOperand = Array.isArray(operand) ? operand[0] : operand;
    const value = evaluate(caseOperand.value);
    const found = findFlexibleCase(
      value,
      caseOperand.cases,
      evaluate,
      isExpression,
      apply,
    );
    return found ? evaluate(found.then) : evaluate(caseOperand.default);
  },
};

// Individual exports for tree shaking
export { $if, $case };
