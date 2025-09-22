/**
 * Base Pack - Near Universal Expressions
 *
 * Essential expressions used across almost all scenarios:
 * - Data access ($get, $isDefined)
 * - Basic conditionals ($if, $where)
 * - Common comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Operation chaining ($pipe)
 * - Array operations ($filter, $map, $sort)
 * - Object operations ($select)
 * - Utilities ($debug, $literal, $default)
 */

// Import the near universal expressions
import { $get, $isDefined, $where } from "../definitions/access.js";
import {
  $debug,
  $default,
  $literal,
  $pipe,
  $sort,
} from "../definitions/flow.js";
import { $select } from "../definitions/access.js";
import { $if } from "../definitions/conditional.js";
import { $eq, $gt, $gte, $lt, $lte, $ne } from "../definitions/predicate.js";
import { $filter, $map } from "../definitions/array.js";

// Export as grouped object (alphabetized)
export const base = {
  $debug,
  $default,
  $eq,
  $filter,
  $get,
  $gt,
  $gte,
  $if,
  $isDefined,
  $literal,
  $lt,
  $lte,
  $map,
  $ne,
  $pipe,
  $select,
  $sort,
  $where,
};
