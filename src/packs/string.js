/**
 * String Pack - String Pattern Matching Operations
 *
 * String processing and pattern matching functions:
 * - Regular expression matching ($matchesRegex)
 * - SQL LIKE pattern matching ($matchesLike)
 * - Unix GLOB pattern matching ($matchesGlob)
 */

// Import string pattern matching expressions
import {
  $matchesRegex,
  $matchesLike,
  $matchesGlob,
} from "../definitions/string.js";

// Export as grouped object
export const string = {
  $matchesRegex,
  $matchesLike,
  $matchesGlob,
};
