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

const $filter = createArrayIterationExpression(
  (array, itemFn) => array.filter(itemFn),
  "$filter",
);

const $flatMap = createArrayIterationExpression(
  (array, itemFn) => array.flatMap(itemFn),
  "$flatMap",
);

const $map = createArrayIterationExpression(
  (array, itemFn) => array.map(itemFn),
  "$map",
);

const $any = createArrayIterationExpression(
  (array, itemFn) => array.some(itemFn),
  "$any",
);

const $all = createArrayIterationExpression(
  (array, itemFn) => array.every(itemFn),
  "$all",
);

const $find = createArrayIterationExpression(
  (array, itemFn) => array.find(itemFn),
  "$find",
);

const $append = createArrayOperationExpression((arrayToConcat, baseArray) =>
  baseArray.concat(arrayToConcat),
);

const $prepend = createArrayOperationExpression((arrayToPrepend, baseArray) =>
  arrayToPrepend.concat(baseArray),
);

const $join = createArrayOperationExpression((separator, array) =>
  array.join(separator),
);

const $reverse = createArrayTransformExpression((array) =>
  array.slice().reverse(),
);

const $take = createArrayOperationExpression((count, array) =>
  array.slice(0, count),
);

const $skip = createArrayOperationExpression((count, array) =>
  array.slice(count),
);

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

const $distinct = createArrayTransformExpression((array) => [
  ...new Set(array),
]);

/**
 * Internal helper to find the first non-null value in an array.
 * @param {Array} values - Array of values to check
 * @returns {any} First non-null value or undefined
 */
const findFirstNonNull = (values) => values.find((value) => value != null);

const $coalesce = {
  apply: (operand, inputData, { apply }) => {
    const values = apply(operand, inputData);
    return findFirstNonNull(values);
  },
  evaluate: (operand, { evaluate }) => {
    const values = evaluate(operand);
    return findFirstNonNull(values);
  },
};

// Individual exports for tree shaking
export {
  $all,
  $any,
  $append,
  $filter,
  $find,
  $flatMap,
  $join,
  $map,
  $prepend,
  $reverse,
  $take,
  $skip,
  $concat,
  $distinct,
  $coalesce,
};
