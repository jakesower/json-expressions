/**
 * Comparison Pack - Scalar Comparison Operations
 *
 * Basic comparison operations for WHERE clause logic:
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 * - Range and existence checks ($between, $isNull, $isNotNull, $has)
 */

// Import comparative expressions
import {
  $between,
  $eq,
  $gt,
  $gte,
  $has,
  $in,
  $isNotNull,
  $isNull,
  $lt,
  $lte,
  $ne,
  $nin,
} from "../definitions/predicate.js";

// Export as grouped object (alphabetized)
export const comparison = {
  $between,
  $eq,
  $gt,
  $gte,
  $has,
  $in,
  $isNotNull,
  $isNull,
  $lt,
  $lte,
  $ne,
  $nin,
};
