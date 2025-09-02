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

const $reverse = {
  apply: (_, inputData) => inputData.slice().reverse(),
  evaluate: (operand, { evaluate }) => {
    const array = evaluate(operand);
    return array.slice().reverse();
  },
};

export const iterativeDefinitions = {
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
};
