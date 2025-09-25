/**
 * Object Pack - Key-Value Manipulation
 *
 * Complete toolkit for object/dictionary operations:
 * - Object projection ($select)
 * - Property access ($prop)
 * - Object combination ($merge)
 * - Property selection ($pick, $omit)
 * - Object introspection ($keys, $values, $pairs, $fromPairs)
 */

// Import existing object-focused expressions
import { $prop, $select } from "../definitions/access.js";
import * as objectExpressions from "../definitions/object.js";

// Export as grouped object
export const object = {
  $select,
  $prop,
  ...objectExpressions,
};
