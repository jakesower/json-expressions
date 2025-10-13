/**
 * Filtering Pack - Comprehensive Data Filtering Toolkit
 *
 * Complete toolkit for WHERE clause logic and data filtering:
 * - Object filtering ($matchesAll)
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte, $between)
 * - Logic operations ($and, $or, $not)
 * - Membership tests ($in, $nin)
 * - Value and existence checks ($isPresent, $isEmpty, $exists)
 * - Pattern matching ($matchesRegex)
 * - Array filtering ($all, $any, $filter, $filterBy, $find)
 */

// Import conditional expressions
// $matchesAll is imported from predicate.js below
import { $all, $any, $filter, $filterBy, $find } from "../definitions/array.js";

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
	$isEmpty,
	$isPresent,
	$exists,
	$and,
	$or,
	$not,
	$matchesAll,
	$matchesRegex,
	$between,
} from "../definitions/predicate.js";

// Export as grouped object
export const filtering = {
	// Basic comparisons
	$between,
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
	// Applications
	$all,
	$any,
	$filter,
	$filterBy,
	$find,
	$matchesAll,
	// Membership tests
	$in,
	$nin,
	// Value and existence checks
	$isEmpty,
	$isPresent,
	$exists,
	// Pattern matching
	$matchesRegex,
};
