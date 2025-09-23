/**
 * Creates a generative expression that produces values without needing input data or nested expressions.
 * @param {function(any): any} generateFn - Function that takes operand and generates a value
 * @returns {object} Expression object with apply and evaluate methods
 */
const createGenerativeExpression = (generateFn) => ({
  apply: (operand) => generateFn(operand),
  evaluate: (operand) => generateFn(operand),
});

const $random = createGenerativeExpression((operand = {}) => {
  const { min = 0, max = 1, precision = null } = operand ?? {};
  const value = Math.random() * (max - min) + min;

  if (precision == null) {
    return value;
  }

  if (precision >= 0) {
    // Positive precision: decimal places
    return Number(value.toFixed(precision));
  } else {
    // Negative precision: round to 10^(-precision)
    const factor = Math.pow(10, -precision);
    return Math.round(value / factor) * factor;
  }
});

// Individual exports for tree shaking
export { $random };
