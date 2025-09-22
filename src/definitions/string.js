/**
 * String Expressions - Text Processing Operations
 *
 * Operations for text manipulation and processing:
 * - Transformations ($lowercase, $substring, $trim, $uppercase)
 * - Operations ($replace, $split)
 */

/**
 * Creates a string transformation expression.
 *
 * @param {function(string): any} transformFn - Function that transforms the string
 * @returns {object} Expression object with apply and evaluate methods
 */
const createStringTransformExpression = (transformFn) => ({
  apply: (operand, inputData) => transformFn(inputData),
  evaluate: (operand, { evaluate }) => transformFn(evaluate(operand)),
});

/**
 * Creates a string operation expression with parameters.
 *
 * @param {function(string, ...any): any} operationFn - Function that operates on string with params
 * @returns {object} Expression object with apply and evaluate methods
 */
const createStringOperationExpression = (operationFn) => ({
  apply: (operand, inputData, { apply }) => {
    if (Array.isArray(operand)) {
      const [param, ...rest] = operand;
      return operationFn(
        inputData,
        apply(param, inputData),
        ...rest.map((r) => apply(r, inputData)),
      );
    }
    return operationFn(inputData, apply(operand, inputData));
  },
  evaluate: (operand, { evaluate }) => {
    const [str, ...params] = evaluate(operand);
    return operationFn(str, ...params);
  },
});

const $lowercase = createStringTransformExpression((str) => str.toLowerCase());

const $replace = createStringOperationExpression((str, search, replacement) =>
  str.replace(new RegExp(search, "g"), replacement),
);

const $split = createStringOperationExpression((str, delimiter) =>
  str.split(delimiter),
);

const $substring = createStringOperationExpression((str, start, length) =>
  length !== undefined ? str.slice(start, start + length) : str.slice(start),
);

const $trim = createStringTransformExpression((str) => str.trim());

const $uppercase = createStringTransformExpression((str) => str.toUpperCase());

// Individual exports for tree shaking (alphabetized)
export { $lowercase, $replace, $split, $substring, $trim, $uppercase };
