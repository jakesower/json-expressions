import { isEqualWith } from "es-toolkit";

/**
 * Parses a path string into segments, supporting both dot and bracket notation.
 *
 * @param {string} path - The path string to parse
 * @returns {Array<string>} Array of path segments
 *
 * @example
 * parsePath("foo.bar") // ["foo", "bar"]
 * parsePath("foo[0].bar") // ["foo", "0", "bar"]
 * parsePath("foo[$].bar") // ["foo", "$", "bar"]
 * parsePath("foo[0][1]") // ["foo", "0", "1"]
 */
function parsePath(path) {
	// Fast path for simple dot notation (no brackets)
	if (!path.includes("[")) {
		return path.split(".");
	}

	const segments = [];
	let current = "";
	let inBracket = false;

	for (let i = 0; i < path.length; i++) {
		const char = path[i];

		if (char === "[") {
			if (current) {
				segments.push(current);
				current = "";
			}
			inBracket = true;
		} else if (char === "]") {
			if (inBracket && current) {
				segments.push(current);
				current = "";
			}
			inBracket = false;
		} else if (char === "." && !inBracket) {
			if (current) {
				segments.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current) {
		segments.push(current);
	}

	return segments;
}

/**
 * Gets a value from an object using a property path.
 * Supports the $ wildcard for array element iteration and flattening.
 * Supports both dot notation and bracket notation.
 *
 * @param {Object|Array} objOrArray - The object or array to query
 * @param {string | Array} path - The path of the property to get. Use "$" to iterate over array elements.
 * @param {boolean} [allowWildcards=false] - Whether to allow wildcard ($) in paths
 * @returns {*} Returns the resolved value, or null if not found
 *
 * @example
 * get({ name: "Chen" }, "name") // "Chen"
 * get({ user: { name: "Amira" } }, "user.name") // "Amira"
 * get({ items: [{ id: 1 }] }, "items[0].id") // 1
 * get([{ name: "Luna" }, { name: "Kai" }], "$.name", true) // ["Luna", "Kai"]
 * get([{ name: "Luna" }, { name: "Kai" }], "[$].name", true) // ["Luna", "Kai"]
 * get({ items: [{ id: 1 }, { id: 2 }] }, "items.$.id", true) // [1, 2]
 * get({ items: [{ id: 1 }, { id: 2 }] }, "items[$].id", true) // [1, 2]
 * get({ items: [] }, "items.$.id", false) // throws Error
 */
export function get(objOrArray, path, allowWildcards = false) {
	if (objOrArray === null || objOrArray === undefined) return null;
	if (path === "" || path === "." || path.length === 0) return objOrArray;

	// Convert the path to an array if it's not already
	const pathArray = Array.isArray(path) ? path : parsePath(path);

	let current = objOrArray;

	for (let i = 0; i < pathArray.length; i++) {
		const segment = pathArray[i];

		// Handle wildcard array iteration
		if (segment === "$") {
			if (!allowWildcards) {
				const pathStr = Array.isArray(path) ? path.join(".") : path;
				throw new Error(
					`Wildcard ($) not supported in this context. Path: "${pathStr}"`,
				);
			}

			const asArray = Array.isArray(current) ? current : [current];
			const remainingPath = pathArray.slice(i + 1);

			// If no remaining path, return the array
			if (remainingPath.length === 0) return asArray;

			// Recursively get from each array element
			return asArray.flatMap((item) =>
				get(item, remainingPath, allowWildcards),
			);
		}

		// Normal property access
		current = current?.[segment];

		if (current === null || current === undefined) return null;
	}

	return current;
}

export function isEqual(a, b) {
	return isEqualWith(a, b, (x, y) =>
		// eslint-disable-next-line eqeqeq
		x === undefined || x === null ? x == y : undefined,
	);
}
