/**
 * Access Expressions - Data Access Operations
 *
 * Operations for accessing and extracting data from input:
 * - Basic access ($get)
 * - Identity access ($identity)
 * - Object selection/projection ($select)
 */

import { mapValues } from "es-toolkit";
import { get } from "../helpers.js";

const $get = {
  apply: (operand, inputData, { apply }) => {
    const resolvedOperand = apply(operand, inputData);
    return resolvedOperand === "."
      ? inputData === undefined
        ? null
        : inputData
      : get(inputData, resolvedOperand);
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$get evaluate form requires object operand: { object, path }",
      );
    }

    const { object, path } = operand;
    if (object === undefined || path === undefined) {
      throw new Error(
        "$get evaluate form requires 'object' and 'path' properties",
      );
    }

    return apply({ $get: path }, object);
  },
};

// Removed $isDefined - replaced with semantic expressions $isPresent/$isEmpty/$exists

const $identity = {
  apply: (_, inputData) => inputData,
  evaluate: (operand, { evaluate, isWrappedLiteral }) =>
    isWrappedLiteral(operand) ? operand : evaluate(operand),
};


const $select = {
  apply: (operand, inputData, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$select operand must be an object with key mappings",
      );
    }

    return mapValues(operand, (expr) => apply(expr, inputData));
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$select evaluate form requires object operand: { object, selection }",
      );
    }

    const { object, selection } = operand;
    if (object === undefined || selection === undefined) {
      throw new Error(
        "$select evaluate form requires 'object' and 'selection' properties",
      );
    }

    return apply({ $select: selection }, object);
  },
};

// Individual exports for tree shaking (alphabetized)
export { $get, $identity, $select };
