/**
 * Flow Expressions - Control Flow Operations
 *
 * Operations for controlling program flow and utilities:
 * - Pipeline control ($pipe, $debug)
 * - Data utilities ($literal, $default)
 * - Sorting ($sort)
 */

import { createDualExpression, get } from "../helpers.js";

const $debug = {
  apply: (operand, inputData, { apply }) => {
    const result = apply(operand, inputData);
    console.log("Debug:", { operand, inputData, result });
    return result;
  },
  evaluate: (operand, { evaluate }) => {
    const result = evaluate(operand);
    console.log("Debug (evaluate):", { operand, result });
    return result;
  },
};

const $default = createDualExpression((operand, applyOrEvaluate) => {
  if (
    typeof operand !== "object" ||
    operand === null ||
    !("expression" in operand) ||
    !("default" in operand)
  ) {
    throw new Error(
      "$default operand must be on object with { expression, default, allowNull? }",
    );
  }

  const { expression } = operand;
  // In this system where null = undefined, treat them the same
  // Use != to check for both null and undefined
  const check = (val) => val != null;
  const result = applyOrEvaluate(expression);

  return check(result) ? result : applyOrEvaluate(operand.default);
});

const $literal = {
  apply: (operand) => operand,
  evaluate: (operand) => operand,
};

const $pipe = {
  apply: (operand, inputData, { apply }) => {
    if (!Array.isArray(operand)) {
      throw new Error("$pipe operand must be an array of expressions");
    }

    return operand.reduce((data, expr) => apply(expr, data), inputData);
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$pipe evaluate form requires object operand: { expressions, inputData }",
      );
    }

    const { expressions, inputData } = operand;
    if (expressions === undefined || inputData === undefined) {
      throw new Error(
        "$pipe evaluate form requires 'expressions' and 'inputData' properties",
      );
    }

    return apply({ $pipe: expressions }, inputData);
  },
};

const $sort = {
  apply: (operand, inputData, { apply }) => {
    if (!Array.isArray(inputData)) {
      throw new Error("$sort can only be applied to arrays");
    }

    const by =
      typeof operand === "string"
        ? [{ by: operand }]
        : Array.isArray(operand)
          ? operand
          : [operand];

    return Array.from(inputData).sort((a, b) => {
      for (const sortCriterion of by) {
        if (typeof sortCriterion !== "object" || !("by" in sortCriterion)) {
          throw new Error(
            "$sort operand must be string, object with 'by' property, or array of sort criteria",
          );
        }

        const { by, desc = false } = sortCriterion;

        let aVal, bVal;
        if (typeof by === "string") {
          aVal = get(a, by);
          bVal = get(b, by);
        } else {
          aVal = apply(by, a);
          bVal = apply(by, b);
        }

        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
      }
      return 0;
    });
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$sort evaluate form requires object operand: { array, by, desc? }",
      );
    }

    const { array, by, desc } = operand;
    if (array === undefined || by === undefined) {
      throw new Error(
        "$sort evaluate form requires 'array' and 'by' properties",
      );
    }

    const sortCriteria = desc !== undefined ? { by, desc } : by;
    return apply({ $sort: sortCriteria }, array);
  },
};

// Individual exports for tree shaking (alphabetized)
export { $debug, $default, $literal, $pipe, $sort };
