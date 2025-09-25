/**
 * Predicate Expressions - Boolean Logic and Comparisons
 *
 * Operations that return true/false values:
 * - Comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 * - Existence checks ($has, $isNull, $isNotNull)
 * - Range checks ($between)
 * - Logical operations ($and, $or, $not)
 * - Pattern matching ($matchesRegex)
 */

import { isEqual } from "es-toolkit";
import { get } from "es-toolkit/compat";

/**
 * Creates a comparative expression that applies a comparison function to resolved operands.
 *
 * @param {function(any, any): boolean} compareFn - Function that takes two values and returns a boolean comparison result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createComparativeExpression = (compareFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    return compareFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    if (Array.isArray(operand) && operand.length === 2) {
      const [left, right] = operand;
      return compareFn(evaluate(left), evaluate(right));
    }

    if (!operand || typeof operand !== "object") {
      throw new Error(
        "Comparison evaluate form requires object operand: { left, right }",
      );
    }

    const { left, right } = operand;
    if (left === undefined || right === undefined) {
      throw new Error(
        "Comparison evaluate form requires 'left' and 'right' properties",
      );
    }

    return compareFn(evaluate(left), evaluate(right));
  },
});

/**
 * Creates an inclusion expression that checks if a value is in/not in an array.
 *
 * @param {function(any, Array): boolean} inclusionFn - Function that takes a value and array and returns boolean
 * @param {string} expressionName - Name of the expression for error messages
 * @returns {object} Expression object with apply and evaluate methods
 */
const createInclusionExpression = (expressionName, inclusionFn) => ({
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    if (!Array.isArray(resolvedOperand)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(inputData, resolvedOperand);
  },
  evaluate: (operand, { evaluate }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        `${expressionName} evaluate form requires object operand: { array, value }`,
      );
    }

    const { array, value } = operand;
    if (array === undefined || value === undefined) {
      throw new Error(
        `${expressionName} evaluate form requires 'array' and 'value' properties`,
      );
    }

    const evaluatedArray = evaluate(array);
    const evaluatedValue = evaluate(value);
    if (!Array.isArray(evaluatedArray)) {
      throw new Error(`${expressionName} parameter must be an array`);
    }
    return inclusionFn(evaluatedValue, evaluatedArray);
  },
});

/**
 * Internal helper to test if a string matches a regex pattern with flag parsing.
 * @param {string} pattern - The regex pattern (possibly with inline flags)
 * @param {string} inputData - The string to test
 * @returns {boolean} Whether the pattern matches the input
 */
const testRegexPattern = (pattern, inputData) => {
  if (typeof inputData !== "string") {
    throw new Error("$matchesRegex requires string input");
  }

  // Extract inline flags and clean pattern
  const flagMatch = pattern.match(/^\(\?([ims]*)\)(.*)/);
  if (flagMatch) {
    const [, flags, patternPart] = flagMatch;
    let jsFlags = "";

    if (flags.includes("i")) jsFlags += "i";
    if (flags.includes("m")) jsFlags += "m";
    if (flags.includes("s")) jsFlags += "s";

    const regex = new RegExp(patternPart, jsFlags);
    return regex.test(inputData);
  }

  // Check for unsupported inline flags and strip them
  const unsupportedFlagMatch = pattern.match(/^\(\?[^)]*\)(.*)/);
  if (unsupportedFlagMatch) {
    const [, patternPart] = unsupportedFlagMatch;
    const regex = new RegExp(patternPart);
    return regex.test(inputData);
  }

  // No inline flags - use PCRE defaults
  const regex = new RegExp(pattern);
  return regex.test(inputData);
};

const $and = {
  apply: (operand, inputData, { apply }) => {
    return operand.every((expr) => apply(expr, inputData));
  },
  evaluate: (operand, { evaluate }) => {
    return operand.every((expr) => evaluate(expr));
  },
};

const $between = {
  apply: (operand, inputData, { apply }) => {
    const { min, max } = apply(operand, inputData);
    return inputData >= min && inputData <= max;
  },
  evaluate: (operand, { evaluate }) => {
    const { value, min, max } = evaluate(operand);
    return value >= min && value <= max;
  },
};

const $eq = createComparativeExpression((a, b) => isEqual(a, b));

const $gt = createComparativeExpression((a, b) => a > b);

const $gte = createComparativeExpression((a, b) => a >= b);

const $has = {
  apply: (operand, inputData, { apply }) => {
    const resolvedPath = apply(operand, inputData);
    if (typeof resolvedPath !== "string") {
      throw new Error("$has operand must resolve to a string path");
    }
    return get(inputData, resolvedPath) !== undefined;
  },
  evaluate: (operand, { evaluate }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$has evaluate form requires object operand: { object, path }",
      );
    }

    const { object, path } = operand;
    if (object === undefined || path === undefined) {
      throw new Error(
        "$has evaluate form requires 'object' and 'path' properties",
      );
    }

    const evaluatedObject = evaluate(object);
    const evaluatedPath = evaluate(path);
    if (typeof evaluatedPath !== "string") {
      throw new Error("$has path must be a string");
    }
    return get(evaluatedObject, evaluatedPath) !== undefined;
  },
};

const $in = createInclusionExpression("$in", (value, array) =>
  array.includes(value),
);

const $hasValue = {
  apply: (operand, inputData) => inputData != null, // != catches both null and undefined
  evaluate: (operand, { evaluate }) => evaluate(operand) != null,
};

const $isEmpty = {
  apply: (operand, inputData) => inputData == null, // == catches both null and undefined
  evaluate: (operand, { evaluate }) => evaluate(operand) == null,
};

const $exists = {
  apply: (operand, inputData, { apply }) => {
    const resolvedPath = apply(operand, inputData);
    if (typeof resolvedPath !== "string") {
      throw new Error("$exists operand must resolve to a string path");
    }
    return get(inputData, resolvedPath) !== undefined;
  },
  evaluate: (operand, { evaluate }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$exists evaluate form requires object operand: { object, path }",
      );
    }

    const { object, path } = operand;
    if (object === undefined || path === undefined) {
      throw new Error(
        "$exists evaluate form requires 'object' and 'path' properties",
      );
    }

    const evaluatedObject = evaluate(object);
    const evaluatedPath = evaluate(path);
    if (typeof evaluatedPath !== "string") {
      throw new Error("$exists path must be a string");
    }
    return get(evaluatedObject, evaluatedPath) !== undefined;
  },
};

const $lt = createComparativeExpression((a, b) => a < b);

const $lte = createComparativeExpression((a, b) => a <= b);

const $matchesRegex = {
  apply(operand, inputData, { apply }) {
    const resolvedOperand = apply(operand, inputData);
    return testRegexPattern(resolvedOperand, inputData);
  },
  evaluate: (operand, { evaluate }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$matchesRegex evaluate form requires object operand: { pattern, text }",
      );
    }

    const { pattern, text } = operand;
    if (pattern === undefined || text === undefined) {
      throw new Error(
        "$matchesRegex evaluate form requires 'pattern' and 'text' properties",
      );
    }

    const resolvedPattern = evaluate(pattern);
    const resolvedText = evaluate(text);
    return testRegexPattern(resolvedPattern, resolvedText);
  },
};

const $ne = createComparativeExpression((a, b) => !isEqual(a, b));

const $nin = createInclusionExpression(
  "$nin",
  (value, array) => !array.includes(value),
);

const $not = {
  apply: (operand, inputData, { apply }) => {
    return !apply(operand, inputData);
  },
  evaluate: (operand, { evaluate }) => {
    return !evaluate(operand);
  },
};

const $or = {
  apply: (operand, inputData, { apply }) => {
    return operand.some((expr) => apply(expr, inputData));
  },
  evaluate: (operand, { evaluate }) => {
    return operand.some((expr) => evaluate(expr));
  },
};

// Individual exports for tree shaking (alphabetized)
export {
  $and,
  $between,
  $eq,
  $exists,
  $gt,
  $gte,
  $has,
  $hasValue,
  $in,
  $isEmpty,
  $lt,
  $lte,
  $matchesRegex,
  $ne,
  $nin,
  $not,
  $or,
};
