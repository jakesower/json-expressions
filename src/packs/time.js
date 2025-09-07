/**
 * Time Pack - Time-Based Operations
 *
 * Time and temporal functions for date/time operations:
 * - Current time in different formats ($nowLocal, $nowUTC)
 * - Timestamp generation ($timestamp)
 * - Time calculations ($timeAdd, $timeDiff)
 * - Time formatting ($formatTime)
 */

// Import temporal expressions
import * as temporalExpressions from "../definitions/temporal.js";

// Export as grouped object
export const time = {
  ...temporalExpressions,
};
