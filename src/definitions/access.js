/**
 * Access Expressions - Data Access Operations
 *
 * Operations for accessing and extracting data from input:
 * - Basic access ($get, $isDefined)
 * - Property access ($prop)
 * - Object selection/projection ($select)
 * - Filtered access ($where)
 */

import { get } from "es-toolkit/compat";

const $get = {
  apply: (operand, inputData, { apply }) => {
    const resolvedOperand = apply(operand, inputData);
    return resolvedOperand === "."
      ? inputData
      : get(inputData, resolvedOperand);
  },
  evaluate: (operand, { apply, evaluate }) => {
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

const $isDefined = {
  apply: (operand, inputData, { apply }) =>
    apply(operand, inputData) !== undefined,
  evaluate: (operand, { evaluate }) => evaluate(operand) !== undefined,
};

const $prop = {
  apply: (operand, inputData, { apply }) => {
    const resolvedOperand = apply(operand, inputData);
    return inputData?.[resolvedOperand];
  },
  evaluate: (operand, { apply, evaluate }) => {
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

// TODO: Review Claude implementation
const $select = {
  apply: (operand, inputData, { apply }) => {
    if (Array.isArray(operand)) {
      // Array of property names - return object with only those properties
      const result = {};
      operand.forEach((prop) => {
        const key = typeof prop === "string" ? prop : apply(prop, inputData);
        const value = get(inputData, key);
        if (value !== undefined) {
          result[key] = value;
        }
      });
      return result;
    }

    if (typeof operand === "object" && operand !== null) {
      // Object mapping - return object with computed values
      const result = {};
      Object.entries(operand).forEach(([newKey, expr]) => {
        result[newKey] = apply(expr, inputData);
      });
      return result;
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

const $where = {
  apply: (operand, inputData, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$where operand must be an object with property conditions",
      );
    }

    return Object.entries(operand).every(([path, condition]) => {
      const value = get(inputData, path);
      return apply(condition, value);
    });
  },
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$where evaluate form requires object operand: { data, conditions }",
      );
    }

    const { data, conditions } = operand;
    if (data === undefined || conditions === undefined) {
      throw new Error(
        "$where evaluate form requires 'data' and 'conditions' properties",
      );
    }

    return apply({ $where: conditions }, data);
  },
};

// Individual exports for tree shaking (alphabetized)
export { $get, $isDefined, $prop, $select, $where };
