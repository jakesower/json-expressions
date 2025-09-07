/**
 * String Pack - String Processing Operations
 *
 * String processing and pattern matching functions:
 * - Pattern matching ($matchesRegex, $matchesLike, $matchesGlob)
 * - String transformations ($split, $trim, $uppercase, $lowercase)
 * - String operations ($replace, $substring)
 */

// Import string expressions
import * as stringExpressions from "../definitions/string.js";

// Export as grouped object
export const string = {
  ...stringExpressions,
};
