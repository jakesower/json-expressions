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

const $mode = createAggregativeExpression((values) => {
  if (values.length === 0) return undefined;
  const frequency = {};
  let maxCount = 0;
  let modes = [];

  // Count frequencies
  for (const value of values) {
    frequency[value] = (frequency[value] ?? 0) + 1;
    if (frequency[value] > maxCount) {
      maxCount = frequency[value];
      modes = [value];
    } else if (frequency[value] === maxCount && !modes.includes(value)) {
      modes.push(value);
    }
  }

  // Return single mode if only one, array if multiple, or undefined if all values appear once
  return maxCount === 1
    ? undefined
    : modes.length === 1
      ? modes[0]
      : modes.sort((a, b) => a - b);
});

export const aggregativeDefinitions = {
  $count,
  $max,
  $mean,
  $median,
  $min,
  $mode,
  $sum,
};
