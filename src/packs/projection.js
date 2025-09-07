/**
 * Projection Pack - Data Transformation and Projection Toolkit
 *
 * Complete toolkit for SELECT clause operations and data transformation:
 * - Aggregation functions ($count, $sum, $min, $max, $mean)
 * - Array transformations ($map, $filter, $flatMap, $distinct)
 * - String/value operations ($concat, $substring, $uppercase, $lowercase, $join)
 * - Conditionals for computed fields ($if, $case)
 * - Field access ($get, $pipe)
 */

// Import aggregation expressions
import { $count, $sum, $min, $max, $mean } from "../definitions/aggregative.js";

// Import array transformation expressions
import { $map, $filter, $flatMap, $distinct, $concat, $join } from "../definitions/iterative.js";

// Import string transformation expressions
import { $substring, $uppercase, $lowercase } from "../definitions/string.js";

// Import conditional expressions
import { $if, $case } from "../definitions/conditional.js";

// Import field access
import { $get, $pipe } from "../definitions/core.js";

// Export as grouped object
export const projection = {
  // Field access and chaining
  $get,
  $pipe,
  // Aggregation functions
  $count,
  $sum,
  $min,
  $max,
  $mean,
  // Array transformations
  $map,
  $filter,
  $flatMap,
  $distinct,
  $concat,
  $join,
  // String/value transformations
  $substring,
  $uppercase,
  $lowercase,
  // Conditionals for computed fields
  $if,
  $case,
};