/**
 * Array Expressions - Array-Specific Operations
 *
 * Operations specifically for array manipulation and processing:
 * - Iteration ($all, $any, $filter, $find, $flatMap, $map)
 * - Transformations ($concat, $flatten, $join, $reverse, $unique)
 * - Slicing ($append, $prepend, $skip, $take)
 * - Projection ($pluck)
 * - Grouping ($groupBy)
 * - Utilities ($coalesce)
 */

import { get } from "es-toolkit/compat";

/**
 * Creates an array iteration expression that applies a function to array elements.
 * @param {function(Array, function): any} arrayMethodFn - Function that takes (array, itemFn) and returns result
 * @param {string} expressionName - Name of the expression for evaluate form
 * @returns {object} Expression object with apply and evaluate methods
 */
const createArrayIterationExpression = (arrayMethodFn, expressionName) => ({
  apply: (operand, inputData, { apply }) =>
    arrayMethodFn(inputData, (item) => apply(operand, item)),
  evaluate: (operand, { apply }) => {
    const [fn, items] = operand;
    return apply({ [expressionName]: fn }, items);
  },
});

/**
 * Creates a simple array operation expression.
 * @param {function(any, Array): any} operationFn - Function that takes (operand, inputData) and returns result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createArrayOperationExpression = (operationFn) => ({
  apply: (operand, inputData) => operationFn(operand, inputData),
  evaluate: (operand, { evaluate }) => {
    const [arg1, arg2] = operand;
    return operationFn(evaluate(arg1), evaluate(arg2));
  },
});

/**
 * Creates a simple array transformation expression (no operand needed).
 * @param {function(Array): any} transformFn - Function that transforms an array
 * @returns {object} Expression object with apply and evaluate methods
 */
const createArrayTransformExpression = (transformFn) => ({
  apply: (_, inputData) => transformFn(inputData),
  evaluate: (operand, { evaluate }) => {
    const array = evaluate(operand);
    return transformFn(array);
  },
});

const $all = createArrayIterationExpression(
  (array, itemFn) => array.every(itemFn),
  "$all",
);

const $any = createArrayIterationExpression(
  (array, itemFn) => array.some(itemFn),
  "$any",
);

const $append = createArrayOperationExpression((arrayToConcat, baseArray) =>
  baseArray.concat(arrayToConcat),
);

const $coalesce = {
  apply: (operand, inputData, { apply }) => {
    const values = apply(operand, inputData);
    return values.find((value) => value != null);
  },
  evaluate: (operand, { evaluate }) => {
    const values = evaluate(operand);
    return values.find((value) => value != null);
  },
};

const $concat = {
  apply: (operand, inputData, { apply }) => {
    const arrays = apply(operand, inputData);
    return inputData.concat(...arrays);
  },
  evaluate: (operand, { evaluate }) => {
    const [baseArray, ...arrays] = evaluate(operand);
    return baseArray.concat(...arrays);
  },
};

const $filter = createArrayIterationExpression(
  (array, itemFn) => array.filter(itemFn),
  "$filter",
);

const $find = createArrayIterationExpression(
  (array, itemFn) => array.find(itemFn),
  "$find",
);

const $flatMap = createArrayIterationExpression(
  (array, itemFn) => array.flatMap(itemFn),
  "$flatMap",
);

const $flatten = {
  apply: (operand, inputData) => {
    const depth = operand?.depth ?? 1;
    return inputData.flat(depth);
  },
  evaluate: (operand, { evaluate }) => {
    const evaluated = evaluate(operand);
    if (Array.isArray(evaluated)) return evaluate(evaluated).flat();

    if (
      typeof evaluated !== "object" ||
      !Array.isArray(evaluated.array) ||
      typeof evaluated.depth !== "number"
    ) {
      throw new Error(
        "$flatten evaluate form requires either an array operand, or an object of the form { array: [...], depth: 2 }",
      );
    }

    return evaluated.array.flat(evaluated.depth);
  },
};

const $groupBy = {
  apply: (operand, inputData, { apply }) => {
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
  },
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$groupBy evaluate form requires array operand: [array, keyStringOrExpression]",
      );
    }

    const [array, keyStringOrExpression] = operand;
    const evaluatedArray = evaluate(array);

    return apply({ $groupBy: keyStringOrExpression }, evaluatedArray);
  },
};

const $join = createArrayOperationExpression((separator, array) =>
  array.join(separator),
);

const $map = createArrayIterationExpression(
  (array, itemFn) => array.map(itemFn),
  "$map",
);

const $pluck = {
  apply: (operand, inputData, { apply }) => {
    if (!Array.isArray(inputData)) {
      throw new Error("$pluck can only be applied to arrays");
    }

    if (typeof operand === "string") {
      return inputData.map((item) => get(item, operand));
    }

    return inputData.map((item) => apply(operand, item));
  },
  evaluate: (operand, { apply }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$pluck evaluate form requires array operand: [array, pathOrExpression]",
      );
    }

    const [array, pathOrExpression] = operand;
    return apply({ $pluck: pathOrExpression }, array);
  },
};

const $prepend = createArrayOperationExpression((arrayToPrepend, baseArray) =>
  arrayToPrepend.concat(baseArray),
);

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

// Individual exports for tree shaking (alphabetized)
export {
  $all,
  $any,
  $append,
  $coalesce,
  $concat,
  $filter,
  $find,
  $flatMap,
  $flatten,
  $groupBy,
  $join,
  $map,
  $pluck,
  $prepend,
  $reverse,
  $skip,
  $take,
  $unique,
};
