import { get } from "es-toolkit/compat";

/**
 * Creates a simple transformation expression that applies a function to the resolved operand.
 * @param {function(any): any} transformFn - Function that transforms the resolved operand
 * @param {string} evaluateErrorMessage - Error message for non-array operands in evaluate form
 * @returns {object} Expression object with apply and evaluate methods
 */
const createSimpleExpression = (transformFn, evaluateErrorMessage) => ({
  apply: (operand, inputData, { apply }) =>
    transformFn(apply(operand, inputData)),
  evaluate: (operand, { evaluate }) => {
    if (!Array.isArray(operand)) {
      throw new Error(evaluateErrorMessage);
    }
    const [value] = operand;
    return transformFn(evaluate(value));
  },
});

const $isDefined = createSimpleExpression(
  (value) => value !== undefined,
  "$isDefined evaluate form requires array operand: [value]",
);

const $ensurePath = {
  apply: (operand, inputData, { apply }) => {
    const path = apply(operand, inputData);
    const go = (curValue, paths, used = []) => {
      if (paths.length === 0) return;

      const [head, ...tail] = paths;
      if (!(head in curValue)) {
        throw new Error(
          `"${head}" was not found along the path ${used.join(".")}`,
        );
      }

      go(curValue[head], tail, [...used, head]);
    };

    go(inputData, path.split("."));
    return inputData;
  },
  evaluate: (operand, { evaluate }) => {
    if (!Array.isArray(operand)) {
      throw new Error(
        "$ensurePath evaluate form requires array operand: [object, path]",
      );
    }
    const [object, path] = operand;
    const evaluatedObject = evaluate(object);
    const evaluatedPath = evaluate(path);
    const go = (curValue, paths, used = []) => {
      if (paths.length === 0) return;

      const [head, ...tail] = paths;
      if (!(head in curValue)) {
        throw new Error(
          `"${head}" was not found along the path ${used.join(".")}`,
        );
      }

      go(curValue[head], tail, [...used, head]);
    };

    go(evaluatedObject, evaluatedPath.split("."));
    return evaluatedObject;
  },
};

const $get = {
  apply: (operand, inputData, { apply }) => {
    if (typeof operand === "string") {
      return get(inputData, operand);
    }
    if (typeof operand === "object" && !Array.isArray(operand)) {
      const { path, default: defaultValue } = operand;
      if (path === undefined) {
        throw new Error("$get object form requires 'path' property");
      }
      const evaluatedPath = apply(path, inputData);
      const result = get(inputData, evaluatedPath);
      return result !== undefined
        ? result
        : defaultValue !== undefined
          ? apply(defaultValue, inputData)
          : undefined;
    }
    throw new Error(
      "$get operand must be string or object with {path, default?}",
    );
  },
  evaluate: (operand, { evaluate }) => {
    if (typeof operand !== "object" || Array.isArray(operand)) {
      throw new Error(
        "$get evaluate form requires object operand: {object, path, default?}",
      );
    }

    const { object, path, default: defaultValue } = operand;
    if (object === undefined || path === undefined) {
      throw new Error(
        "$get evaluate form requires 'object' and 'path' properties",
      );
    }

    const result = get(evaluate(object), evaluate(path));
    return result !== undefined
      ? result
      : defaultValue !== undefined
        ? evaluate(defaultValue)
        : undefined;
  },
};

const $prop = {
  apply: (operand, inputData, { apply }) => {
    const property = apply(operand, inputData);
    return inputData[property];
  },
  evaluate: (operand, { evaluate }) => {
    if (!Array.isArray(operand)) {
      throw new Error(
        "$prop evaluate form requires array operand: [object, property]",
      );
    }
    const [object, property] = operand;
    const evaluatedObject = evaluate(object);
    const evaluatedProperty = evaluate(property);
    return evaluatedObject[evaluatedProperty];
  },
};

const $literal = {
  apply: (operand) => operand,
  evaluate: (operand) => operand,
};

const $debug = {
  apply: (operand, inputData, { apply }) => {
    const value = apply(operand, inputData);
    console.log(value);
    return value;
  },
  evaluate: (operand, { evaluate }) => {
    const value = evaluate(operand);
    console.log(value);
    return value;
  },
};

/**
 * Creates a composition expression that chains expressions together.
 * @param {function(Array, function): any} composeFn - Function that takes (expressions, reduceFn) and returns result
 * @returns {object} Expression object with apply and evaluate methods
 */
const createCompositionExpression = (composeFn) => ({
  apply: (operand, inputData, { apply, isExpression }) => {
    // Validate that all elements are expressions
    operand.forEach((expr) => {
      if (!isExpression(expr)) {
        throw new Error(`${JSON.stringify(expr)} is not a valid expression`);
      }
    });
    return composeFn(operand, (acc, expr) => apply(expr, acc), inputData);
  },
  evaluate: (operand, { apply, isExpression }) => {
    const [expressions, initialValue] = operand;
    // Validate that all elements are expressions
    expressions.forEach((expr) => {
      if (!isExpression(expr)) {
        throw new Error(`${JSON.stringify(expr)} is not a valid expression`);
      }
    });
    return composeFn(
      expressions,
      (acc, expr) => apply(expr, acc),
      initialValue,
    );
  },
});

const $compose = createCompositionExpression(
  (expressions, reduceFn, initialValue) =>
    expressions.reduceRight(reduceFn, initialValue),
);

const $pipe = createCompositionExpression(
  (expressions, reduceFn, initialValue) =>
    expressions.reduce(reduceFn, initialValue),
);

// Individual exports for tree shaking
export {
  $compose,
  $debug,
  $get,
  $isDefined,
  $literal,
  $pipe,
  $prop,
  $ensurePath,
};

// Grouped export for compatibility
export const coreDefinitions = {
  $compose,
  $debug,
  $get,
  $isDefined,
  $literal,
  $pipe,
  $prop,
  $ensurePath,
};
