/**
 * Aggregation Pack - Statistical Functions
 *
 * Statistical and aggregation functions for data analysis:
 * - Basic aggregations ($count, $sum, $max, $min)
 * - Statistical measures ($mean)
 * - Array reduction ($first, $last)
 */

// Import aggregative expressions
import {
  $count,
  $first,
  $last,
  $max,
  $mean,
  $min,
  $sum,
} from "../definitions/math.js";

// Export as grouped object (alphabetized)
export const aggregation = {
  $count,
  $first,
  $last,
  $max,
  $mean,
  $min,
  $sum,
};
