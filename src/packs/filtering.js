/**
 * Filtering Pack - Comprehensive Data Filtering Toolkit
 *
 * Complete toolkit for WHERE clause logic and data filtering:
 * - Field access ($get, $pipe)
 * - Object filtering ($matches)
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Logic operations ($and, $or, $not)
 * - Membership tests ($in, $nin)
 * - Existence checks ($isNull, $isNotNull)
 * - Pattern matching ($matchesRegex)
 */

// Import field access expressions
import { $get, $matches } from "../definitions/access.js";
import { $pipe } from "../definitions/flow.js";

// Import comparison expressions
import {
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $in,
  $nin,
  $isNull,
  $isNotNull,
  $and,
  $or,
  $not,
  $matchesRegex,
} from "../definitions/predicate.js";

// Export as grouped object
export const filtering = {
  // Field access
  $get,
  $pipe,
  $matches,
  // Basic comparisons
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  // Logic operations
  $and,
  $or,
  $not,
  // Membership tests
  $in,
  $nin,
  // Existence checks
  $isNull,
  $isNotNull,
  // Pattern matching
  $matchesRegex,
};
