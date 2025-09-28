/**
 * Array Expressions - Array-Specific Operations
 *
 * Operations specifically for array manipulation and processing:
 * - Iteration ($all, $any, $filter, $filterBy, $find, $flatMap, $map)
 * - Transformations ($concat, $flatten, $join, $reverse, $unique)
 * - Slicing ($append, $prepend, $skip, $take)
 * - Projection ($pluck)
 * - Grouping ($groupBy)
 * - Accessors ($first, $last)
 * - Utilities ($coalesce)
 */

import { get } from "../helpers.js";

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
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        `${expressionName} evaluate form requires object operand: { expression, array }`,
      );
    }
    const { expression, array } = operand;
    if (!expression || !array) {
      throw new Error(
        `${expressionName} evaluate form requires 'expression' and 'array' properties`,
      );
    }
    return apply({ [expressionName]: expression }, array);
  },
});

/**
 * Creates a simple array operation expression.
 * @param {function(any, Array): any} operationFn - Function that takes (operand, inputData) and returns result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createArrayOperationExpression = (
  operationFn,
  operandName = "operand",
  dataName = "array",
) => ({
  apply: (operand, inputData) => operationFn(operand, inputData),
  evaluate: (operand, { evaluate }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        `evaluate form requires object operand: { ${operandName}, ${dataName} }`,
      );
    }
    const operandValue = operand[operandName];
    const dataValue = operand[dataName];
    if (operandValue === undefined || dataValue === undefined) {
      throw new Error(
        `evaluate form requires '${operandName}' and '${dataName}' properties`,
      );
    }
    return operationFn(evaluate(operandValue), evaluate(dataValue));
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

const $append = createArrayOperationExpression(
  (arrayToAppend, baseArray) => baseArray.concat(arrayToAppend),
  "arrayToAppend",
  "baseArray",
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

const $filterBy = {
  apply: (operand, inputData, { apply, isExpression }) => {
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
  },
  evaluate: (operand, { apply, evaluate }) => {
    if (!Array.isArray(operand) || operand.length !== 2) {
      throw new Error(
        "$filterBy evaluate form requires array operand: [data, conditions]",
      );
    }

    const [data, conditions] = operand;
    const evaluatedData = evaluate(data);
    const evaluatedConditions = evaluate(conditions);

    if (!Array.isArray(evaluatedData)) {
      throw new Error("$filterBy first argument must be an array");
    }

    if (
      !evaluatedConditions ||
      typeof evaluatedConditions !== "object" ||
      Array.isArray(evaluatedConditions)
    ) {
      throw new Error(
        "$filterBy conditions must be an object with property conditions",
      );
    }

    return apply({ $filterBy: evaluatedConditions }, evaluatedData);
  },
};

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
  evaluate: (operand, { apply }) => {
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$groupBy evaluate form requires object operand: { array, groupBy }",
      );
    }

    const { array, groupBy } = operand;
    if (!array || !groupBy) {
      throw new Error(
        "$groupBy evaluate form requires 'array' and 'groupBy' properties",
      );
    }

    return apply({ $groupBy: groupBy }, array);
  },
};

const $join = createArrayOperationExpression(
  (separator, array) => array.join(separator),
  "separator",
  "array",
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
    if (!operand || typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$pluck evaluate form requires object operand: { array, property }",
      );
    }

    const { array, property } = operand;
    if (!array || !property) {
      throw new Error(
        "$pluck evaluate form requires 'array' and 'property' properties",
      );
    }

    return apply({ $pluck: property }, array);
  },
};

const $prepend = createArrayOperationExpression(
  (arrayToPrepend, baseArray) => arrayToPrepend.concat(baseArray),
  "arrayToPrepend",
  "baseArray",
);

const $reverse = createArrayTransformExpression((array) =>
  array.slice().reverse(),
);

const $skip = createArrayOperationExpression(
  (count, array) => array.slice(count),
  "count",
  "array",
);

const $take = createArrayOperationExpression(
  (count, array) => array.slice(0, count),
  "count",
  "array",
);

const $unique = createArrayTransformExpression((array) => [...new Set(array)]);

const $first = createArrayTransformExpression((array) => {
  return array.length === 0 ? undefined : array[0];
});

const $last = createArrayTransformExpression((array) => {
  return array.length === 0 ? undefined : array[array.length - 1];
});

// Individual exports for tree shaking (alphabetized)
export {
  $all,
  $any,
  $append,
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
  $prepend,
  $reverse,
  $skip,
  $take,
  $unique,
};
