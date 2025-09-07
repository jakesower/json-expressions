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
 * Internal helper to find a matching switch case using deep equality.
 * @param {any} value - The value to match against
 * @param {Array} cases - Array of case objects with 'when' and 'then' properties
 * @param {function} evaluateWhen - Function to evaluate the 'when' condition
 * @returns {object|undefined} The matching case object or undefined
 */
const findSwitchCase = (value, cases, evaluateWhen) => {
  return cases.find((caseItem) => {
    if (caseItem.when === undefined) {
      throw new Error("Switch case must have 'when' property");
    }
    return isEqual(evaluateWhen(caseItem.when), value);
  });
};

const $switch = {
  apply(operand, inputData, { apply }) {
    const value = apply(operand.value, inputData);
    const found = findSwitchCase(value, operand.cases, (when) =>
      apply(when, inputData),
    );
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { evaluate }) {
    const [switchOperand] = operand;
    const value = evaluate(switchOperand.value);
    const found = findSwitchCase(value, switchOperand.cases, evaluate);
    return found ? evaluate(found.then) : evaluate(switchOperand.default);
  },
};

/**
 * Internal helper to find a matching case using boolean predicates.
 * @param {any} value - The value to test against
 * @param {Array} cases - Array of case objects with 'when' and 'then' properties
 * @param {function} evaluateWhen - Function to evaluate the 'when' predicate
 * @returns {object|undefined} The matching case object or undefined
 */
const findPredicateCase = (value, cases, evaluateWhen) => {
  return cases.find((caseItem) => {
    if (caseItem.when === undefined) {
      throw new Error("Case item must have 'when' property");
    }

    const condition = evaluateWhen(caseItem.when, value);
    if (typeof condition !== "boolean") {
      throw new Error(
        `$case.when must resolve to a boolean, got ${JSON.stringify(condition)}`,
      );
    }
    return condition;
  });
};

const $case = {
  apply(operand, inputData, { apply }) {
    const value = apply(operand.value, inputData);
    const found = findPredicateCase(value, operand.cases, (when, val) =>
      apply(when, val),
    );
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { evaluate }) {
    const [caseOperand] = operand;
    const found = findPredicateCase(
      caseOperand.value,
      caseOperand.cases,
      (when) => evaluate(when),
    );
    return found ? evaluate(found.then) : evaluate(caseOperand.default);
  },
};

// Individual exports for tree shaking
export { $if, $switch, $case };
