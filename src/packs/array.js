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

// Import iterative expressions
import * as iterativeExpressions from "../definitions/iterative.js";

// Export as grouped object
export const array = {
  ...iterativeExpressions,
};
