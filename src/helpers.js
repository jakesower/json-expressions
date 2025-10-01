import { isEqualWith } from "es-toolkit";

/**
 * Gets a value from an object using a property path.
 * Supports the $ wildcard for array element iteration and flattening.
 *
 * @param {Object|Array} objOrArray - The object or array to query
 * @param {string | Array} path - The path of the property to get. Use "$" to iterate over array elements.
 * @returns {*} Returns the resolved value, or null if not found
 *
 * @example
 * get({ name: "Chen" }, "name") // "Chen"
 * get({ user: { name: "Amira" } }, "user.name") // "Amira"
 * get([{ name: "Luna" }, { name: "Kai" }], "$.name") // ["Luna", "Kai"]
 * get({ items: [{ id: 1 }, { id: 2 }] }, "items.$.id") // [1, 2]
 */
export function get(objOrArray, path) {
  if (objOrArray === null || objOrArray === undefined) return null;
  if (path === "" || path === "." || path.length === 0) return objOrArray;

  // Convert the path to an array if it's not already
  const pathArray = Array.isArray(path) ? path : path.split(".");
  const [head, ...tail] = pathArray;

  if (head === "$") {
    const asArray = Array.isArray(objOrArray) ? objOrArray : [objOrArray];
    return asArray.flatMap((item) => get(item, tail));
  }

  return get(objOrArray[head], tail);
}

export function isEqual(a, b) {
  return isEqualWith(a, b, (x, y) =>
    // eslint-disable-next-line eqeqeq
    x === undefined || x === null ? x == y : undefined,
  );
}
