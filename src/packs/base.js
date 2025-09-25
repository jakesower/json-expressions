/**
 * Base Pack - Near Universal Expressions
 *
 * Essential expressions used across almost all scenarios:
 * - Data access ($get, $hasValue, $isEmpty)
 * - Basic conditionals ($if, $matches)
 * - Common comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Boolean logic ($and, $or, $not)
 * - Operation chaining ($pipe)
 * - Array operations ($filter, $filterBy, $map, $sort)
 * - Utilities ($literal, $default)
 */

// Import the near universal expressions
import {
  $get,
  $identity,
  $matches,
} from "../definitions/access.js";
import { $default, $literal, $pipe, $sort } from "../definitions/flow.js";
import { $if, $case } from "../definitions/conditional.js";
import {
  $and,
  $eq,
  $gt,
  $gte,
  $hasValue,
  $isEmpty,
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
  $case,
  $default,
  $eq,
  $filter,
  $filterBy,
  $get,
  $gt,
  $gte,
  $hasValue,
  $identity,
  $if,
  $isEmpty,
  $literal,
  $lt,
  $lte,
  $map,
  $matches,
  $ne,
  $not,
  $or,
  $pipe,
  $sort,
};
