/**
 * Comparison Pack - Scalar Comparison Operations
 *
 * Basic comparison operations for WHERE clause logic:
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 * - Range and existence checks ($between, $isNull, $isNotNull)
 */

// Import comparative expressions
import * as comparativeExpressions from "../definitions/comparative.js";

// Export as grouped object
export const comparison = {
  ...comparativeExpressions,
};
