import { isEqualWith } from "es-toolkit";

/**
 * @param {Object} obj - The object to query.
 * @param {string | Array} path - The path of the property to get.
 * @param {*} [defaultValue] - The value returned if the resolved value is undefined.
 * @returns {*} Returns the resolved value.
 */
export function get(obj, path) {
  // Convert the path to an array if it's not already.
  const pathArray = Array.isArray(path) ? path : path.split(".");

  // Reduce over the path array to find the nested value.
  return pathArray.reduce((acc, key) => acc && acc[key], obj) ?? null;
}

export function isEqual(a, b) {
  return isEqualWith(a, b, (x, y) =>
    // eslint-disable-next-line eqeqeq
    x === undefined || x === null ? x == y : undefined,
  );
}
