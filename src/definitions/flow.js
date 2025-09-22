/**
 * Flow Expressions - Control Flow Operations
 *
 * Operations for controlling program flow and utilities:
 * - Pipeline control ($pipe, $debug)
 * - Data utilities ($literal, $default)
 * - Sorting ($sort)
 */

import { get } from "es-toolkit/compat";
import { createDualExpression } from "../helpers.js";

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

  const { allowNull, expression } = operand;
  const check = allowNull
    ? (val) => val !== undefined
    : (val) => val !== undefined && val !== null;
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
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$pipe evaluate form requires array operand: [expressions, inputData]",
      );
    }

    const [expressions, inputData] = operand;
    const evaluatedExpressions = evaluate(expressions);
    const evaluatedInputData = evaluate(inputData);

    return apply({ $pipe: evaluatedExpressions }, evaluatedInputData);
  },
};

const $sort = {
  apply: (operand, inputData, { apply }) => {
    if (!Array.isArray(inputData)) {
      throw new Error("$sort can only be applied to arrays");
    }

    const sortCriteria =
      typeof operand === "string"
        ? [{ by: operand }]
        : Array.isArray(operand)
          ? operand
          : [operand];

    return Array.from(inputData).sort((a, b) => {
      for (const sortCriterion of sortCriteria) {
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
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$sort evaluate form requires array operand: [array, sortCriteria]",
      );
    }

    const [array, sortCriteria] = operand;
    return apply({ $sort: sortCriteria }, array);
  },
};

// Individual exports for tree shaking (alphabetized)
export { $debug, $default, $literal, $pipe, $sort };
