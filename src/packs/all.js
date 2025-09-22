/**
 * All Pack - Complete Expression Library
 *
 * Comprehensive collection of all available expressions:
 * - Access expressions (data access and filtering)
 * - Array operations (transformations, predicates, manipulations)
 * - Conditional expressions (control flow)
 * - Flow expressions (pipeline control and utilities)
 * - Generative operations (random values, UUIDs)
 * - Math operations (arithmetic, statistics)
 * - Object operations (key-value manipulation)
 * - Predicate expressions (boolean logic and comparisons)
 * - String operations (text processing)
 * - Temporal operations (time functions)
 *
 * This pack is primarily intended for testing and comprehensive usage scenarios.
 */

// Import all expressions from all definitions (alphabetized)
import * as access from "../definitions/access.js";
import * as array from "../definitions/array.js";
import * as conditional from "../definitions/conditional.js";
import * as flow from "../definitions/flow.js";
import * as generative from "../definitions/generative.js";
import * as math from "../definitions/math.js";
import * as object from "../definitions/object.js";
import * as predicate from "../definitions/predicate.js";
import * as string from "../definitions/string.js";
import * as temporal from "../definitions/temporal.js";

// Export as grouped object containing all expressions (alphabetized)
export const all = {
  ...access,
  ...array,
  ...conditional,
  ...flow,
  ...generative,
  ...math,
  ...object,
  ...predicate,
  ...string,
  ...temporal,
};
