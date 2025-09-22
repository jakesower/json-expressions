/**
 * Array Pack - Complete Array Manipulation Toolkit
 *
 * All array operations for data transformation and processing:
 * - Core transformations ($map, $filter, $find)
 * - Predicates ($all, $any)
 * - Advanced operations ($flatMap)
 * - Array modifications ($append, $prepend, $reverse, $join)
 * - Array slicing ($take, $skip)
 * - Array operations ($concat, $distinct)
 * - Utility ($coalesce)
 */

// Import array expressions
import * as arrayExpressions from "../definitions/array.js";

// Export as grouped object
export const array = {
  ...arrayExpressions,
};
