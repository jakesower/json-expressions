import { isEqual } from "../helpers.js";

const $case = (
  operand,
  inputData,
  { apply, isExpression, isWrappedLiteral },
) => {
  const value = apply(operand.value, inputData, "value");

  let foundIdx = -1;
  const found = operand.cases.find((caseItem, idx) => {
    const { when } = caseItem;

    if (when === undefined) {
      throw new Error("Case item must have 'when' property");
    }

    if (isWrappedLiteral(when)) {
      const result = isEqual(value, when.$literal);
      if (result) foundIdx = idx;
      return result;
    }

    if (isExpression(when)) {
      const applied = apply(when, value, ["cases", idx, "when"]);
      if (typeof applied !== "boolean") {
        throw new Error(
          "Only expressions that return true or false may be used in when clauses",
        );
      }

      if (applied) foundIdx = idx;
      return applied;
    }

    const result = isEqual(value, when);
    if (result) foundIdx = idx;
    return result;
  });

  return found
    ? apply(found.then, inputData, ["cases", foundIdx, "then"])
    : apply(operand.default, inputData, "default");
};

const $if = (operand, inputData, { apply }) => {
  const condition = apply(operand.if, inputData, "if");

  if (typeof condition !== "boolean") {
    throw new Error(
      `$if.if must be a boolean or an expression that resolves to one, got ${JSON.stringify(condition)}`,
    );
  }

  return condition
    ? apply(operand.then, inputData, "then")
    : apply(operand.else, inputData, "else");
};

// Individual exports for tree shaking
export { $case, $if };
