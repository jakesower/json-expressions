/**
 * Base Pack - Near Universal Expressions
 *
 * Essential expressions used across almost all scenarios:
 * - Data access ($get, $identity, $exists, $isPresent, $isEmpty)
 * - Basic conditionals ($if, $case, $matches)
 * - Common comparisons ($eq, $ne, $gt, $gte, $lt, $lte)
 * - Boolean logic ($and, $or, $not)
 * - Operation chaining ($pipe)
 * - Array operations ($filter, $filterBy, $map, $sort)
 * - Utilities ($literal, $default)
 */

// Import the near universal expressions
import { $get, $identity } from "../definitions/access.js";
import { $default, $literal, $pipe, $sort } from "../definitions/flow.js";
import { $if, $case } from "../definitions/conditional.js";
import {
  $and,
  $eq,
  $exists,
  $gt,
  $gte,
  $isEmpty,
  $isPresent,
  $lt,
  $lte,
  $matches,
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
  $exists,
  $filter,
  $filterBy,
  $get,
  $gt,
  $gte,
  $identity,
  $if,
  $isEmpty,
  $isPresent,
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
