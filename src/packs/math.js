/**
 * Math Pack - Arithmetic Operations
 *
 * Pure arithmetic operations for mathematical calculations:
 * - Basic operations ($add, $subtract, $multiply, $divide, $modulo)
 * - Mathematical functions ($pow, $sqrt)
 * - Aggregations ($count, $sum, $max, $min, $mean)
 */

// Import arithmetic expressions
import * as mathExpressions from "../definitions/math.js";

// Export as grouped object
export const math = {
	...mathExpressions,
};
