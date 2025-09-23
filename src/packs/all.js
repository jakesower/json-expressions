/**
 * All Pack - Complete Expression Library
 *
 * Comprehensive collection of all available expressions:
 * - Access expressions (data access and filtering)
 * - Array operations (transformations, predicates, manipulations)
 * - Conditional expressions (control flow)
 * - Flow expressions (pipeline control and utilities)
 * - Math operations (arithmetic, statistics)
 * - Object operations (key-value manipulation)
 * - Predicate expressions (boolean logic and comparisons)
 * - String operations (text processing)
 *
 * This pack is primarily intended for testing and comprehensive usage scenarios.
 */

// Import all expressions from all definitions (alphabetized)
import * as access from "../definitions/access.js";
import * as array from "../definitions/array.js";
import * as conditional from "../definitions/conditional.js";
import * as flow from "../definitions/flow.js";
import * as math from "../definitions/math.js";
import * as object from "../definitions/object.js";
import * as predicate from "../definitions/predicate.js";
import * as string from "../definitions/string.js";

// Export as grouped object containing all expressions (alphabetized)
export const all = {
  ...access,
  ...array,
  ...conditional,
  ...flow,
  ...math,
  ...object,
  ...predicate,
  ...string,
};
