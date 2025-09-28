/**
 * Access Expressions - Data Access Operations
 *
 * Operations for accessing and extracting data from input:
 * - Basic access ($get)
 * - Identity access ($identity)
 * - Property access ($prop)
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

const $prop = {
  apply: (operand, inputData, { apply }) => {
    const resolvedOperand = apply(operand, inputData);
    return inputData?.[resolvedOperand];
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$prop evaluate form requires object operand: { object, property }",
      );
    }

    const { object, property } = operand;
    if (object === undefined || property === undefined) {
      throw new Error(
        "$prop evaluate form requires 'object' and 'property' properties",
      );
    }

    return apply({ $prop: property }, object);
  },
};

const $select = {
  apply: (operand, inputData, { apply }) => {
    if (Array.isArray(operand)) {
      // Array of property names - return object with only those properties
      const result = {};
      operand.forEach((prop) => {
        const key = typeof prop === "string" ? prop : apply(prop, inputData);
        const value = get(inputData, key);
        if (value !== null) {
          result[key] = value;
        }
      });
      return result;
    }

    if (typeof operand === "object" && operand !== null) {
      return mapValues(operand, (expr) => apply(expr, inputData));
    }

    throw new Error(
      "$select operand must be array of paths or object with key mappings",
    );
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
export { $get, $identity, $prop, $select };
