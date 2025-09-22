// useful for function that are _almost_ identical -- breaks if anything needs
// to be done with the input data or the operands differ at all
export function createDualExpression(fn) {
  return {
    apply: (operand, inputData, { apply }) =>
      fn(operand, (val) => apply(val, inputData)),
    evaluate: (operand, { evaluate }) => fn(operand, evaluate),
  };
}
