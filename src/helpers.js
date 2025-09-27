// useful for function that are _almost_ identical -- breaks if anything needs
// to be done with the input data or the operands differ at all
export function createDualExpression(fn) {
  return {
    apply: (operand, inputData, { apply }) =>
      fn(operand, (val) => apply(val, inputData)),
    evaluate: (operand, { evaluate }) => fn(operand, evaluate),
  };
}

/**
 * @param {Object} obj - The object to query.
 * @param {string | Array} path - The path of the property to get.
 * @param {*} [defaultValue] - The value returned if the resolved value is undefined.
 * @returns {*} Returns the resolved value.
 */
export function get(obj, path, defaultValue) {
  // Convert the path to an array if it's not already.
  const pathArray = Array.isArray(path) ? path : path.split(".");

  // Reduce over the path array to find the nested value.
  const result = pathArray.reduce((acc, key) => acc && acc[key], obj);

  // Return the resolved value or the default value if undefined.
  return result === undefined ? defaultValue : result;
}
