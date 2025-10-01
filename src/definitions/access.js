/**
 * Access Expressions - Data Access Operations
 *
 * Operations for accessing and extracting data from input:
 * - Basic access ($get) - supports $ wildcard for array iteration
 * - Identity access ($identity)
 * - Object selection/projection ($select)
 */

import { mapValues } from "es-toolkit";
import { get } from "../helpers.js";

const $get = (operand, inputData, { apply }) => {
  const resolvedOperand = apply(operand, inputData);
  return resolvedOperand === "."
    ? inputData === undefined
      ? null
      : inputData
    : get(inputData, resolvedOperand);
};

const $identity = (_, inputData) => inputData;

const $select = (operand, inputData, { apply }) => {
  if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
    throw new Error("$select operand must be an object with key mappings");
  }

  return mapValues(operand, (expr) => apply(expr, inputData));
};

// Individual exports for tree shaking (alphabetized)
export { $get, $identity, $select };
