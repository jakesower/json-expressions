/**
 * Projection Pack - Data Transformation and Projection Toolkit
 *
 * Complete toolkit for SELECT clause operations and data transformation:
 * - Aggregation functions ($count, $sum, $min, $max, $mean)
 * - Array transformations ($map, $filter, $flatMap, $unique, $pluck)
 * - String/value operations ($concat, $substring, $uppercase, $lowercase, $join)
 * - Conditionals for computed fields ($if, $case)
 * - Field access ($get, $pipe)
 */

// Import aggregation expressions
import { $count, $sum, $min, $max, $mean } from "../definitions/math.js";

// Import array transformation expressions
import {
  $map,
  $filter,
  $flatMap,
  $unique,
  $concat,
  $join,
  $pluck,
} from "../definitions/array.js";

// Import string transformation expressions
import { $substring, $uppercase, $lowercase } from "../definitions/string.js";

// Import conditional expressions
import { $if, $case } from "../definitions/conditional.js";

// Import field access
import { $get, $where } from "../definitions/access.js";

// Import flow control
import { $pipe } from "../definitions/flow.js";

// Import comparison expressions for filtering
import {
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $in,
  $nin,
} from "../definitions/predicate.js";

// Export as grouped object
export const projection = {
  // Field access and chaining
  $get,
  $pipe,
  $where,
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
  $unique,
  $concat,
  $join,
  $pluck,
  // String/value transformations
  $substring,
  $uppercase,
  $lowercase,
  // Conditionals for computed fields
  $if,
  $case,
  // Comparison expressions for filtering
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $in,
  $nin,
};

// Individual exports for tree shaking
export { $pluck };
