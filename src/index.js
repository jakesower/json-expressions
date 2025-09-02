import didYouMean from "didyoumean";
import { coreDefinitions } from "./definitions/core.js";
import { aggregativeDefinitions } from "./definitions/aggregative.js";
import { comparativeDefinitions } from "./definitions/comparative.js";
import { conditionalDefinitions } from "./definitions/conditional.js";
import { generativeDefinitions } from "./definitions/generative.js";
import { iterativeDefinitions } from "./definitions/iterative.js";
import { logicalDefinitions } from "./definitions/logical.js";
import { temporalDefinitions } from "./definitions/temporal.js";
import { mathDefinitions } from "./definitions/math.js";
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
 * @param {object} definitions
 * @param {boolean} [mergeDefaults=true] whether or not to include the core definitions in the engine
 *
 * @returns {ExpressionEngine}
 */
export function createExpressionEngine(definitions, mergeDefaults = true) {
  const expressions = mergeDefaults
    ? { ...coreDefinitions, ...definitions }
    : definitions;

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

export const defaultExpressions = {
  ...coreDefinitions,
  ...aggregativeDefinitions,
  ...comparativeDefinitions,
  ...conditionalDefinitions,
  ...generativeDefinitions,
  ...iterativeDefinitions,
  ...logicalDefinitions,
  ...mathDefinitions,
  ...temporalDefinitions,
};

export const defaultExpressionEngine =
  createExpressionEngine(defaultExpressions);

// Export individual definition groups
export {
  coreDefinitions,
  aggregativeDefinitions,
  comparativeDefinitions,
  conditionalDefinitions,
  generativeDefinitions,
  iterativeDefinitions,
  logicalDefinitions,
  mathDefinitions,
  temporalDefinitions,
};
