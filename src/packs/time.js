/**
 * Time Pack - Time-Based Operations
 *
 * Time and temporal functions for date/time generation:
 * - Current time in different formats ($nowLocal, $nowUTC)
 * - Timestamp generation ($timestamp)
 */

// Import temporal expressions
import { $nowLocal, $nowUTC, $timestamp } from "../definitions/temporal.js";

// Export as grouped object
export const time = {
  $nowLocal,
  $nowUTC,
  $timestamp,
};
