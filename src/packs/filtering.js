/**
 * Filtering Pack - Comprehensive Data Filtering Toolkit
 *
 * Complete toolkit for WHERE clause logic and data filtering:
 * - Field access ($get, $pipe)
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Logic operations ($and, $or, $not)
 * - Membership tests ($in, $nin)
 * - Existence checks ($isNull, $isNotNull)
 * - Pattern matching ($matchesRegex, $matchesLike, $matchesGlob)
 */

// Import field access expressions
import { $get, $pipe } from "../definitions/core.js";

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
} from "../definitions/comparative.js";

// Import logic expressions
import { $and, $or, $not } from "../definitions/logical.js";

// Import pattern matching expressions
import {
  $matchesRegex,
  $matchesLike,
  $matchesGlob,
} from "../definitions/string.js";

// Export as grouped object
export const filtering = {
  // Field access
  $get,
  $pipe,
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
  $matchesLike,
  $matchesGlob,
};
