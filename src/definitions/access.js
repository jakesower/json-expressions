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
  evaluate: (operand, { evaluate }) => {
    if (Array.isArray(operand)) {
      const [objectExpr, path] = operand;
      const evaluatedObject = evaluate(objectExpr);
      return get(evaluatedObject, path);
    }

    throw new Error(
      "$get evaluate form requires array operand: [object, path]",
    );
  },
};

const $isDefined = {
  apply: (operand, inputData, { apply }) =>
    apply(operand, inputData) !== undefined,
  evaluate: (operand, { evaluate }) => evaluate(operand) !== undefined,
};

const $prop = {
  apply: (operand, inputData, { apply }) => {
    if (Array.isArray(operand)) {
      const [objectExpr, propName] = operand;
      const resolvedObject = apply(objectExpr, inputData);
      const resolvedProp = apply(propName, inputData);
      return resolvedObject?.[resolvedProp];
    }

    const resolvedOperand = apply(operand, inputData);
    return inputData?.[resolvedOperand];
  },
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$prop evaluate form requires array operand: [object, property]",
      );
    }

    const [object, property] = operand;
    const evaluatedObject = evaluate(object);
    const evaluatedProperty = evaluate(property);

    return apply({ $prop: evaluatedProperty }, evaluatedObject);
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
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$select evaluate form requires array operand: [object, selection]",
      );
    }

    const [object, selection] = operand;
    const evaluatedObject = evaluate(object);
    const evaluatedSelection = evaluate(selection);

    return apply({ $select: evaluatedSelection }, evaluatedObject);
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
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$where evaluate form requires array operand: [data, conditions]",
      );
    }

    const [data, conditions] = operand;
    const evaluatedData = evaluate(data);
    const evaluatedConditions = evaluate(conditions);

    if (
      !evaluatedConditions ||
      typeof evaluatedConditions !== "object" ||
      Array.isArray(evaluatedConditions)
    ) {
      throw new Error(
        "$where conditions must be an object with property conditions",
      );
    }

    return apply({ $where: evaluatedConditions }, evaluatedData);
  },
};

// Individual exports for tree shaking (alphabetized)
export { $get, $isDefined, $prop, $select, $where };
