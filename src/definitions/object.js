/**
 * Object Expressions - Key-Value Manipulation
 *
 * Implementation-focused definitions for object/dictionary operations:
 * - Object combination ($merge)
 * - Property selection ($pick, $omit)
 * - Object introspection ($keys, $values, $pairs, $fromPairs)
 */

import { createDualExpression } from "../helpers.js";

const createKeyInclusionExpression = (keepFn, expressionName) => ({
  apply: (operand, inputData, { apply }) => {
    if (!Array.isArray(operand)) {
      throw new Error(
        `${expressionName} operand must be an array of property names`,
      );
    }

    if (!inputData || typeof inputData !== "object") {
      throw new Error(`${expressionName} must be applied to an object`);
    }

    const keySet = new Set(operand.map((path) => apply(path, inputData)));
    const result = {};
    Object.keys(inputData).forEach((key) => {
      if (keepFn(keySet, key)) {
        result[key] = inputData[key];
      }
    });

    return result;
  },
  evaluate: (operand, { apply }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        `${expressionName} evaluate form requires array operand: [object, propertyNames]`,
      );
    }

    const [object, propertyNames] = operand;
    return apply({ [expressionName]: propertyNames }, object);
  },
});

const createObjectExtractionExpression = (fn, expressionName) => ({
  apply: (operand, inputData) => {
    if (
      !inputData ||
      typeof inputData !== "object" ||
      Array.isArray(inputData)
    ) {
      throw new Error(`${expressionName} can only be applied to objects`);
    }
    return fn(inputData);
  },
  evaluate: (operand, { evaluate }) => {
    const result = evaluate(operand);
    if (!result || typeof result !== "object") {
      throw new Error(`${expressionName} can only be applied to objects`);
    }
    return fn(result);
  },
});

const $merge = createDualExpression((operand, applyOrEvaluate) => {
  if (!Array.isArray(operand)) {
    throw new Error("$merge operand must be an array of objects to merge");
  }

  const resolvedObjects = operand.map(op => applyOrEvaluate(op));
  return Object.assign({}, ...resolvedObjects);
});

const $omit = createKeyInclusionExpression(
  (set, key) => !set.has(key),
  "$omit",
);

const $pick = createKeyInclusionExpression((set, key) => set.has(key), "$pick");

const $keys = createObjectExtractionExpression(Object.keys, "$keys");
const $values = createObjectExtractionExpression(Object.values, "$values");
const $pairs = createObjectExtractionExpression(Object.entries, "$pairs");

const $fromPairs = {
  apply: (operand, inputData) => {
    if (!Array.isArray(inputData)) {
      throw new Error(
        "$fromPairs can only be applied to arrays of [key, value] pairs",
      );
    }

    const result = {};
    inputData.forEach((pair) => {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error("$fromPairs requires array of [key, value] pairs");
      }
      const [key, value] = pair;
      result[key] = value;
    });

    return result;
  },
  evaluate: (operand, { evaluate }) => {
    const evaluatedPairs = evaluate(operand);

    if (!Array.isArray(evaluatedPairs)) {
      throw new Error(
        "$fromPairs can only be applied to arrays of [key, value] pairs",
      );
    }

    const result = {};
    evaluatedPairs.forEach((pair) => {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error(
          "$fromPairs can only be applied to arrays of [key, value] pairs",
        );
      }
      const [key, value] = pair;
      result[key] = value;
    });

    return result;
  },
};

// Individual exports for tree shaking
export { $merge, $pick, $omit, $keys, $values, $pairs, $fromPairs };
