/**
 * Projection Pack - Data Transformation and Projection Toolkit
 *
 * Complete toolkit for SELECT clause operations and data transformation:
 * - Array transformations ($map, $filter, $flatMap, $unique, $pluck, $concat, $join)
 * - String/value operations ($substring, $uppercase, $lowercase)
 * - Conditionals for computed fields ($if, $case)
 * - Field access ($get, $select)
 * - Comparison operations ($eq, $ne, $gt, $gte, $lt, $lte, $in, $nin)
 */

import {
  $map,
  $filter,
  $flatMap,
  $unique,
  $concat,
  $join,
  $pluck,
} from "../definitions/array.js";
import { $substring, $uppercase, $lowercase } from "../definitions/string.js";
import { $if, $case } from "../definitions/conditional.js";
import { $get, $select } from "../definitions/access.js";
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
  $select,
  // Array transformations
  $concat,
  $filter,
  $flatMap,
  $join,
  $map,
  $pluck,
  $unique,
  // String/value transformations
  $lowercase,
  $substring,
  $uppercase,
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
