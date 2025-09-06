/**
 * Aggregation Pack - Statistical Functions
 *
 * Statistical and aggregation functions for data analysis:
 * - Basic aggregations ($count, $sum, $max, $min)
 * - Statistical measures ($mean, $median, $mode)
 */

// Import aggregative expressions
import {
  $count,
  $sum,
  $max,
  $min,
  $mean,
  $median,
  $mode,
} from "../definitions/aggregative.js";

// Export as grouped object
export const aggregation = {
  $count,
  $sum,
  $max,
  $min,
  $mean,
  $median,
  $mode,
};
