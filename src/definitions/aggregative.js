/**
 * Creates an aggregative expression that applies a calculation function to resolved values.
 *
 * @param {function(Array): any} calculateFn - Function that takes an array of values and returns a calculated result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createAggregativeExpression = (calculateFn) => ({
  apply(operand, inputData, { apply }) {
    const values = apply(operand, inputData);
    return calculateFn(values);
  },
  evaluate: (operand, { evaluate }) => {
    const values = evaluate(operand);
    return calculateFn(values);
  },
});

const $count = createAggregativeExpression((values) => values.length);

const $max = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((max, v) => Math.max(max, v));
});

const $min = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((min, v) => Math.min(min, v));
});

const $sum = createAggregativeExpression((values) => {
  return values.reduce((sum, v) => sum + v, 0);
});

const $mean = createAggregativeExpression((values) => {
  return values.length === 0
    ? undefined
    : values.reduce((sum, v) => sum + v, 0) / values.length;
});

const $median = createAggregativeExpression((values) => {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
});

const $first = createAggregativeExpression((values) => {
  return values.length === 0 ? undefined : values[0];
});

const $last = createAggregativeExpression((values) => {
  return values.length === 0 ? undefined : values[values.length - 1];
});

// Individual exports for tree shaking
export { $count, $max, $mean, $median, $min, $sum, $first, $last };
