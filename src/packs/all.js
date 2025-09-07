/**
 * All Pack - Complete Expression Library
 *
 * Comprehensive collection of all available expressions:
 * - Base expressions (data access, conditionals, comparisons, utilities)
 * - Math operations (arithmetic, mathematical functions)
 * - Aggregation functions (statistics, array reduction)
 * - Logic operations (boolean logic, conditionals)
 * - Comparison operations (scalar comparisons, range/existence checks)
 * - Array operations (transformations, predicates, manipulations)
 * - String operations (pattern matching, transformations)
 * - Time operations (temporal functions, calculations, formatting)
 * - Generative operations (random values, UUIDs)
 *
 * This pack is primarily intended for testing and comprehensive usage scenarios.
 */

// Import all expressions from all definitions
import * as core from "../definitions/core.js";
import * as math from "../definitions/math.js";
import * as aggregative from "../definitions/aggregative.js";
import * as logical from "../definitions/logical.js";
import * as conditional from "../definitions/conditional.js";
import * as comparative from "../definitions/comparative.js";
import * as iterative from "../definitions/iterative.js";
import * as string from "../definitions/string.js";
import * as temporal from "../definitions/temporal.js";
import * as generative from "../definitions/generative.js";

// Export as grouped object containing all expressions
export const all = {
  ...core,
  ...math,
  ...aggregative,
  ...logical,
  ...conditional,
  ...comparative,
  ...iterative,
  ...string,
  ...temporal,
  ...generative,
};
