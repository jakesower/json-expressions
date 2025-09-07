/**
 * Logic Pack - Boolean Logic and Conditionals
 *
 * All boolean logic and conditional operations:
 * - Boolean operations ($and, $or, $not)
 * - Conditional branching ($if, $switch, $case)
 */

// Import logical and conditional expressions
import * as logicalExpressions from "../definitions/logical.js";
import * as conditionalExpressions from "../definitions/conditional.js";

// Export as grouped object
export const logic = {
  ...logicalExpressions,
  ...conditionalExpressions,
};
