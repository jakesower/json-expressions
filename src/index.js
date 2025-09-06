import didYouMean from "didyoumean";
import { base } from "./packs/base.js";
import { mapValues } from "es-toolkit";

/**
 * @typedef {object} ApplicativeExpression
 */

/**
 * @typedef {object} Expression
 */

/**
 * @template Args, Input, Output
 * @typedef {object} Expression
 * @property {function(any, Input): Output} apply
 * @property {function(Args, Input, any): Output} [applyImplicit]
 * @property {function(Input): Output} evaluate
 * @property {string} [name]
 * @property {object} schema
 */

/**
 * @typedef {object} ExpressionEngine
 * @property {function(Expression, any): any} apply
 * @property {function(Expression): any} evaluate
 * @property {string[]} expressionNames
 * @property {function(Expression): boolean} isExpression
 */

/**
 * @template Args, Input, Output
 * @typedef {function(...any): Expression} FunctionExpression
 */

function looksLikeExpression(val) {
  return (
    val !== null &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    Object.keys(val).length === 1 &&
    Object.keys(val)[0].startsWith("$")
  );
}

/**
 * @typedef {object} ExpressionEngineConfig
 * @property {object[]} [packs] - Array of expression pack objects to include
 * @property {object} [custom] - Custom expression definitions
 * @property {string[]} [exclude] - Expression names to exclude from final engine
 * @property {boolean} [includeBase=true] - Whether to include base expressions
 */

/**
 * @param {ExpressionEngineConfig} [config={}] - Configuration object for the expression engine
 * @returns {ExpressionEngine}
 */
export function createExpressionEngine(config = {}) {
  const { packs = [], custom = {}, exclude = [], includeBase = true } = config;

  // Start with base expressions if included
  let expressions = includeBase ? { ...base } : {};

  // Merge in pack expressions (later packs override earlier ones)
  for (const pack of packs) {
    expressions = { ...expressions, ...pack };
  }

  // Merge in custom expressions (override packs)
  expressions = { ...expressions, ...custom };

  // Remove excluded expressions
  for (const excludeName of exclude) {
    delete expressions[excludeName];
  }

  const isExpression = (val) =>
    looksLikeExpression(val) && Object.keys(val)[0] in expressions;

  const checkLooksLikeExpression = (val) => {
    if (looksLikeExpression(val)) {
      const [invalidOp] = Object.keys(val);
      const availableOps = Object.keys(expressions);

      const suggestion = didYouMean(invalidOp, availableOps);
      const helpText = suggestion
        ? `Did you mean "${suggestion}"?`
        : `Available operators: ${availableOps
            .slice(0, 8)
            .join(", ")}${availableOps.length > 8 ? ", ..." : ""}.`;

      const message = `Unknown expression operator: "${invalidOp}". ${helpText} Use { $literal: ${JSON.stringify(val)} } if you meant this as a literal value.`;

      throw new Error(message);
    }
  };

  const apply = (val, inputData) => {
    if (isExpression(val)) {
      const [expressionName, operand] = Object.entries(val)[0];
      const expressionDef = expressions[expressionName];

      return expressionDef.apply(operand, inputData, { isExpression, apply });
    }

    checkLooksLikeExpression(val);

    return Array.isArray(val)
      ? val.map((v) => apply(v, inputData))
      : val !== null && typeof val === "object"
        ? mapValues(val, (v) => apply(v, inputData))
        : val;
  };

  const evaluate = (val) => {
    if (isExpression(val)) {
      const [expressionName, operand] = Object.entries(val)[0];
      const expressionDef = expressions[expressionName];

      return expressionDef.evaluate(operand, { isExpression, evaluate, apply });
    }

    checkLooksLikeExpression(val);

    return Array.isArray(val)
      ? val.map(evaluate)
      : val !== null && typeof val === "object"
        ? mapValues(val, evaluate)
        : val;
  };

  return {
    apply,
    evaluate,
    expressionNames: Object.keys(expressions),
    isExpression,
  };
}

export const defaultExpressionEngine = createExpressionEngine();
