/**
 * Temporal Pack - Date and Time Operations
 *
 * Complete toolkit for date/time operations on ISO 8601 strings:
 * - Parsing and formatting ($parseDate, $formatDate)
 * - Arithmetic ($addDays, $addMonths, $addYears, $subDays, etc.)
 * - Differences ($diffDays, $diffMonths, $diffYears, $diffHours, etc.)
 * - Boundaries ($startOfDay, $endOfDay, $startOfMonth, $endOfMonth, etc.)
 * - Comparisons ($isAfter, $isBefore, $isSameDay)
 * - Predicates ($isWeekend, $isWeekday, $isDateValid)
 * - Components ($year, $month, $day, $hour, $minute, $dayOfWeek, etc.)
 *
 * All expressions operate on ISO 8601 strings (e.g., "2025-10-05T11:23:45.234Z").
 * All operations are deterministic. For current time, inject it as input data
 * or create a custom $now expression.
 */

// Import all temporal expressions
import * as temporalExpressions from "../definitions/temporal.js";

// Export as grouped object
export const temporal = {
	...temporalExpressions,
};
