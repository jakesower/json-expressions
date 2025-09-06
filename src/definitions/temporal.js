/**
 * Creates a temporal expression that generates time-based values without needing operands or input data.
 * @param {function(): any} generateFn - Function that generates a time-based value
 * @returns {object} Expression object with apply and evaluate methods
 */
const createTemporalExpression = (generateFn) => ({
  apply: generateFn,
  evaluate: generateFn,
});

const $nowLocal = createTemporalExpression(() => {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return now.toISOString().slice(0, -1) + sign + hours + ":" + minutes;
});

const $nowUTC = createTemporalExpression(() => new Date().toISOString());

const $timestamp = createTemporalExpression(() => Date.now());

// Individual exports for tree shaking
export { $nowLocal, $nowUTC, $timestamp };

// Grouped export for compatibility
export const temporalDefinitions = {
  $nowLocal,
  $nowUTC,
  $timestamp,
};
