/**
 * Array Expressions - Array-Specific Operations
 *
 * Operations specifically for array manipulation and processing:
 * - Iteration ($all, $any, $filter, $filterBy, $find, $flatMap, $map)
 * - Transformations ($concat, $flatten, $join, $reverse, $unique)
 * - Slicing ($skip, $take)
 * - Projection ($pluck)
 * - Grouping ($groupBy)
 * - Accessors ($first, $last)
 * - Utilities ($coalesce)
 */

import { get } from "../helpers.js";

/**
 * Creates an array iteration expression that applies a function to array elements.
 * @param {function(Array, function): any} arrayMethodFn - Function that takes (array, itemFn) and returns result
 * @returns {object} Expression object with apply method
 */
const createArrayIterationExpression =
  (arrayMethodFn) =>
  (operand, inputData, { apply }) =>
    arrayMethodFn(inputData, (item) => apply(operand, item));

/**
 * Creates a simple array operation expression.
 * @param {function(any, Array): any} operationFn - Function that takes (operand, inputData) and returns result
 * @returns {object} Expression object with apply method
 */
const createArrayOperationExpression = (operationFn) => (operand, inputData) =>
  operationFn(operand, inputData);

/**
 * Creates a simple array transformation expression (no operand needed).
 * @param {function(Array): any} transformFn - Function that transforms an array
 * @returns {object} Expression object with apply method
 */
const createArrayTransformExpression = (transformFn) => (_, inputData) =>
  transformFn(inputData);

const $all = createArrayIterationExpression((array, itemFn) =>
  array.every(itemFn),
);

const $any = createArrayIterationExpression((array, itemFn) =>
  array.some(itemFn),
);

const $coalesce = (operand, inputData, { apply }) => {
  const values = apply(operand, inputData);
  return values.find((value) => value != null);
};

const $concat = (operand, inputData, { apply }) => {
  const arrays = apply(operand, inputData);
  return inputData.concat(...arrays);
};

const $filter = createArrayIterationExpression((array, itemFn) =>
  array.filter(itemFn),
);

const $find = createArrayIterationExpression((array, itemFn) =>
  array.find(itemFn),
);

const $filterBy = (operand, inputData, { apply, isExpression }) => {
  if (!Array.isArray(inputData)) {
    throw new Error("$filterBy can only be applied to arrays");
  }

  if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
    throw new Error(
      "$filterBy operand must be an object with property conditions",
    );
  }

  return inputData.filter((item) => {
    return Object.entries(operand).every(([path, condition]) => {
      const value = get(item, path);
      // If condition is an expression, apply it to the value
      // If it's a literal, check for equality
      if (isExpression(condition)) {
        return apply(condition, value);
      } else {
        return value === condition;
      }
    });
  });
};

const $flatMap = createArrayIterationExpression((array, itemFn) =>
  array.flatMap(itemFn),
);

const $flatten = (operand, inputData) => {
  const depth = operand?.depth ?? 1;
  return inputData.flat(depth);
};

const $groupBy = (operand, inputData, { apply }) => {
  if (!Array.isArray(inputData)) {
    throw new Error("$groupBy can only be applied to arrays");
  }

  if (typeof operand === "string") {
    // Simple property path grouping
    const groups = {};
    inputData.forEach((item) => {
      const key = item?.[operand];
      if (!key) {
        throw new Error(
          `${JSON.stringify(item)} could not be grouped by ${operand}`,
        );
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }

  // Expression-based grouping
  const groups = {};
  inputData.forEach((item) => {
    const key = apply(operand, item);
    if (!key) {
      throw new Error(
        `${JSON.stringify(item)} could not be grouped by ${operand}`,
      );
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return groups;
};

const $join = createArrayOperationExpression((separator, array) =>
  array.join(separator),
);

const $map = createArrayIterationExpression((array, itemFn) =>
  array.map(itemFn),
);

const $pluck = (operand, inputData, { apply }) => {
  if (!Array.isArray(inputData)) {
    throw new Error("$pluck can only be applied to arrays");
  }

  if (typeof operand === "string") {
    return inputData.map((item) => get(item, operand));
  }

  return inputData.map((item) => apply(operand, item));
};

const $reverse = createArrayTransformExpression((array) =>
  array.slice().reverse(),
);

const $skip = createArrayOperationExpression((count, array) =>
  array.slice(count),
);

const $take = createArrayOperationExpression((count, array) =>
  array.slice(0, count),
);

const $unique = createArrayTransformExpression((array) => [...new Set(array)]);

/**
 * Creates an array accessor expression that operates on either operand or input data.
 * Similar to aggregative expressions - if operand resolves to an array, use it; otherwise use input data.
 *
 * @param {function(Array): any} accessorFn - Function that extracts a value from an array
 * @returns {function} Expression function that operates on operand or input data
 */
const createArrayAccessorExpression =
  (accessorFn) =>
  (operand, inputData, { apply, isWrappedLiteral }) => {
    const resolved = isWrappedLiteral(operand)
      ? operand.$literal
      : apply(operand, inputData);

    if (!Array.isArray(resolved) && !Array.isArray(inputData)) {
      throw new Error(
        "Array accessor expressions require array operand or input data",
      );
    }

    return Array.isArray(resolved)
      ? accessorFn(resolved)
      : accessorFn(inputData);
  };

const $first = createArrayAccessorExpression((array) => {
  return array.length === 0 ? undefined : array[0];
});

const $last = createArrayAccessorExpression((array) => {
  return array.length === 0 ? undefined : array[array.length - 1];
});

// Individual exports for tree shaking (alphabetized)
export {
  $all,
  $any,
  $coalesce,
  $concat,
  $filter,
  $filterBy,
  $find,
  $first,
  $flatMap,
  $flatten,
  $groupBy,
  $join,
  $last,
  $map,
  $pluck,
  $reverse,
  $skip,
  $take,
  $unique,
};
