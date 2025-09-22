/**
 * Logic Pack - Boolean Logic and Conditionals
 *
 * All boolean logic and conditional operations:
 * - Boolean operations ($and, $or, $not)
 * - Conditional branching ($if, $case)
 */

// Import logical and conditional expressions
import { $and, $not, $or } from "../definitions/predicate.js";
import { $case, $if } from "../definitions/conditional.js";

// Export as grouped object (alphabetized)
export const logic = {
  $and,
  $case,
  $if,
  $not,
  $or,
};
