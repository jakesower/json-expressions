/**
 * Array Pack - Complete Array Manipulation Toolkit
 *
 * All array operations for data transformation and processing:
 * - Core transformations ($map, $filter, $find)
 * - Predicates ($all, $any)
 * - Advanced operations ($flatMap)
 * - Array modifications ($append, $prepend, $reverse, $join)
 */

// Import iterative expressions
import {
  $map,
  $filter,
  $find,
  $all,
  $any,
  $flatMap,
  $append,
  $prepend,
  $reverse,
  $join,
} from "../definitions/iterative.js";

// Export as grouped object
export const array = {
  $map,
  $filter,
  $find,
  $all,
  $any,
  $flatMap,
  $append,
  $prepend,
  $reverse,
  $join,
};
