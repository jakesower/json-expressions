/**
 * Aggregation Pack - Statistical Functions
 *
 * Statistical and aggregation functions for data analysis:
 * - Basic aggregations ($count, $sum, $max, $min)
 * - Statistical measures ($mean, $median)
 * - Array reduction ($first, $last)
 */

// Import aggregative expressions
import * as aggregativeExpressions from "../definitions/aggregative.js";

// Export as grouped object
export const aggregation = {
  ...aggregativeExpressions,
};
