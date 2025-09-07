/**
 * Base Pack - Near Universal Expressions
 *
 * Essential expressions used across almost all scenarios:
 * - Data access ($get, $prop, $isDefined)
 * - Basic conditionals ($if)
 * - Common comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Operation chaining ($pipe)
 * - Array operations ($filter, $map)
 * - Utilities ($debug, $literal)
 */

// Import the near universal expressions
import {
  $get,
  $pipe,
  $debug,
  $literal,
  $isDefined,
  $prop,
} from "../definitions/core.js";
import { $if } from "../definitions/conditional.js";
import { $eq, $ne, $gt, $gte, $lt, $lte } from "../definitions/comparative.js";
import { $filter, $map } from "../definitions/iterative.js";

// Export as grouped object
export const base = {
  $get,
  $pipe,
  $debug,
  $literal,
  $isDefined,
  $prop,
  $if,
  $eq,
  $ne,
  $gt,
  $gte,
  $lt,
  $lte,
  $filter,
  $map,
};
