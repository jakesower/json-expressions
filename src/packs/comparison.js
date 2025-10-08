/**
 * Comparison Pack - Scalar Comparison Operations
 *
 * Basic comparison operations for WHERE clause logic:
 * - Basic comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Membership tests ($in, $nin)
 * - Range and existence checks ($between, $isPresent, $isEmpty, $exists)
 */

// Import comparative expressions
import {
	$between,
	$eq,
	$exists,
	$gt,
	$gte,
	$in,
	$isEmpty,
	$isPresent,
	$lt,
	$lte,
	$ne,
	$nin,
} from "../definitions/predicate.js";

// Export as grouped object (alphabetized)
export const comparison = {
	$between,
	$eq,
	$exists,
	$gt,
	$gte,
	$in,
	$isEmpty,
	$isPresent,
	$lt,
	$lte,
	$ne,
	$nin,
};
