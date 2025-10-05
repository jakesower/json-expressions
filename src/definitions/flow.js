/**
 * Flow Expressions - Control Flow Operations
 *
 * Operations for controlling program flow and utilities:
 * - Pipeline control ($pipe, $debug)
 * - Data utilities ($literal, $default)
 * - Sorting ($sort)
 */

import { get } from "../helpers.js";

const $debug = (operand, inputData, { apply }) => {
  const result = apply(operand, inputData);
  console.log("Debug:", { operand, inputData, result });
  return result;
};

const $default = (operand, inputData, { apply }) => {
  if (
    typeof operand !== "object" ||
    operand === null ||
    !("expression" in operand) ||
    !("default" in operand)
  ) {
    throw new Error(
      "$default operand must be an object with { expression, default }",
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

const $sort = (operand, inputData, { apply }) => {
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
};

// Individual exports for tree shaking (alphabetized)
export { $debug, $default, $literal, $pipe, $sort };
