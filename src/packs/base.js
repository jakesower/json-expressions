/**
 * Base Pack - Near Universal Expressions
 *
 * Essential expressions used across almost all scenarios:
 * - Data access ($get, $isDefined)
 * - Basic conditionals ($if, $where)
 * - Common comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Boolean logic ($and, $or, $not)
 * - Operation chaining ($pipe)
 * - Array operations ($filter, $filterBy, $map, $sort)
 * - Utilities ($literal, $default)
 */

// Import the near universal expressions
import { $get, $isDefined, $where } from "../definitions/access.js";
import { $default, $literal, $pipe, $sort } from "../definitions/flow.js";
import { $if } from "../definitions/conditional.js";
import {
  $and,
  $eq,
  $gt,
  $gte,
  $lt,
  $lte,
  $ne,
  $not,
  $or,
} from "../definitions/predicate.js";
import { $filter, $filterBy, $map } from "../definitions/array.js";

// Export as grouped object (alphabetized)
export const base = {
  $and,
  $default,
  $eq,
  $filter,
  $filterBy,
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
  $not,
  $or,
  $pipe,
  $sort,
  $where,
};
