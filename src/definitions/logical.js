/**
 * Creates an array logical expression that applies a logical operation to an array of conditions.
 * @param {function(Array, function): boolean} arrayMethodFn - Function that takes (array, predicate) and returns boolean
 * @returns {object} Expression object with apply and evaluate methods
 */
const createArrayLogicalExpression = (arrayMethodFn) => ({
  apply: (operand, inputData, { apply }) =>
    arrayMethodFn(operand, (subexpr) => apply(subexpr, inputData)),
  evaluate: (operand, { evaluate }) =>
    arrayMethodFn(operand, (value) => {
      return typeof value === "boolean" ? value : Boolean(evaluate(value));
    }),
});

const $and = createArrayLogicalExpression((array, predicate) =>
  array.every(predicate),
);

const $or = createArrayLogicalExpression((array, predicate) =>
  array.some(predicate),
);

const $not = {
  apply: (operand, inputData, { apply }) => !apply(operand, inputData),
  evaluate: (operand, { evaluate }) => {
    const value = typeof operand === "boolean" ? operand : evaluate(operand);
    return !value;
  },
};

export const logicalDefinitions = {
  $and,
  $not,
  $or,
};
