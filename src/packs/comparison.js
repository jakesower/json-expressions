/**
 * Comparison Pack - Scalar Comparison Operations
 *
 * Basic comparison operations for WHERE clause logic:
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 */

// Import comparative expressions
import {
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $in,
  $nin,
} from "../definitions/comparative.js";

// Export as grouped object
export const comparison = {
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $in,
  $nin,
};
