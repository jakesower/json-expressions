/**
 * Math Pack - Arithmetic Operations
 *
 * Pure arithmetic operations for mathematical calculations:
 * - Basic operations ($add, $subtract, $multiply, $divide)
 * - Modulo operation ($modulo)
 * - Mathematical functions ($abs, $pow, $sqrt)
 * - Random number generation ($random)
 */

// Import arithmetic expressions
import * as mathExpressions from "../definitions/math.js";
import { $random } from "../definitions/generative.js";

// Export as grouped object
export const math = {
  ...mathExpressions,
  $random,
};
