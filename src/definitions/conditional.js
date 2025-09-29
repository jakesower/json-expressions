import { isEqual } from "../helpers.js";

const $case = (
  operand,
  inputData,
  { apply, isExpression, isWrappedLiteral },
) => {
  const value = apply(operand.value, inputData);

  const found = operand.cases.find((caseItem) => {
    const { when } = caseItem;

    if (when === undefined) {
      throw new Error("Case item must have 'when' property");
    }

    if (isWrappedLiteral(when)) {
      return isEqual(value, when.$literal);
    }

    if (isExpression(when)) {
      const applied = apply(when, value);
      if (typeof applied !== "boolean") {
        throw new Error(
          "Only expressions that return true or false may be used in when clauses",
        );
      }

      return applied;
    }

    return isEqual(value, when);
  });

  return found
    ? apply(found.then, inputData)
    : apply(operand.default, inputData);
};

const $if = (operand, inputData, { apply }) => {
  const condition = apply(operand.if, inputData);

  if (typeof condition !== "boolean") {
    throw new Error(
      `$if.if must be a boolean or an expression that resolves to one, got ${JSON.stringify(condition)}`,
    );
  }

  return condition
    ? apply(operand.then, inputData)
    : apply(operand.else, inputData);
};

// Individual exports for tree shaking
export { $case, $if };
