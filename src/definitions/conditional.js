import { isEqual } from "es-toolkit";

const $if = {
  apply(operand, inputData, { apply }) {
    const condition = apply(operand.if, inputData);
    if (typeof condition !== "boolean") {
      throw new Error(
        `$if.if must be a boolean or an expression that resolves to one, got ${JSON.stringify(condition)}`,
      );
    }

    return condition
      ? apply(operand.then, inputData)
      : apply(operand.else, inputData);
  },
  evaluate: (operand, { evaluate }) => {
    const condition = evaluate(operand.if);
    if (typeof condition !== "boolean") {
      throw new Error(
        `$if.if must be a boolean or an expression that resolves to one, got ${JSON.stringify(condition)}`,
      );
    }

    return condition ? evaluate(operand.then) : evaluate(operand.else);
  },
};

const $switch = {
  apply(operand, inputData, { apply }) {
    // Evaluate the value once
    const value = apply(operand.value, inputData);
    const found = operand.cases.find((caseItem) => {
      if (caseItem.when === undefined) {
        throw new Error("Switch case must have 'when' property");
      }

      return isEqual(apply(caseItem.when, inputData), value);
    });

    // Return default if no case matches
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { evaluate }) {
    const [switchOperand] = operand;
    // Evaluate the value once
    const value = evaluate(switchOperand.value);
    const found = switchOperand.cases.find((caseItem) => {
      if (caseItem.when === undefined) {
        throw new Error("Switch case must have 'when' property");
      }

      return isEqual(evaluate(caseItem.when), value);
    });

    // Return default if no case matches
    return found ? evaluate(found.then) : evaluate(switchOperand.default);
  },
};

const $case = {
  apply(operand, inputData, { apply }) {
    // Evaluate the value once
    const value = apply(operand.value, inputData);
    const found = operand.cases.find((caseItem) => {
      if (caseItem.when === undefined) {
        throw new Error("Case item must have 'when' property");
      }

      const condition = apply(caseItem.when, value);
      if (typeof condition !== "boolean") {
        throw new Error(
          `$case.when must resolve to a boolean, got ${JSON.stringify(condition)}`,
        );
      }
      return condition;
    });

    // Return default if no case matches
    return found
      ? apply(found.then, inputData)
      : apply(operand.default, inputData);
  },
  evaluate(operand, { evaluate }) {
    const [caseOperand] = operand;
    const found = caseOperand.cases.find((caseItem) => {
      if (caseItem.when === undefined) {
        throw new Error("Case item must have 'when' property");
      }

      const condition = evaluate(caseItem.when);
      if (typeof condition !== "boolean") {
        throw new Error(
          `$case.when must resolve to a boolean, got ${JSON.stringify(condition)}`,
        );
      }
      return condition;
    });

    // Return default if no case matches
    return found ? evaluate(found.then) : evaluate(caseOperand.default);
  },
};

export const conditionalDefinitions = { $if, $switch, $case };
