/**
 * Aggregation Pack - Statistical Functions
 *
 * Statistical and aggregation functions for data analysis:
 * - Basic aggregations ($count, $sum, $max, $min)
 * - Statistical measures ($mean)
 * - Array reduction ($first, $last)
 * - Grouping operations ($groupBy)
 */

// Import aggregative expressions
import { $groupBy, $first, $last } from "../definitions/array.js";
import { $count, $max, $mean, $min, $sum } from "../definitions/math.js";

// Export as grouped object (alphabetized)
export const aggregation = {
  $count,
  $first,
  $groupBy,
  $last,
  $max,
  $mean,
  $min,
  $sum,
};
