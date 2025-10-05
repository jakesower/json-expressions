import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../src/index.js";
import { allExpressionsForTesting } from "../src/packs/all.js";

const engine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply } = engine;

describe("Expression Engine", () => {
  it("gives a top path error path", () => {
    expect(() => apply({ $any: "howdy" })).toThrowError("[$any]");
  });

  it("gives a nested path error path", () => {
    expect(() => apply({ $pipe: [{ $any: "howdy" }] })).toThrowError("[$pipe[0].$any]");
  });
});
