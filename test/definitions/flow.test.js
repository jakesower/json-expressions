import { describe, expect, it, vi } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply, evaluate } = testEngine;

describe("$debug", () => {
  it("applies debug expression and logs result", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(apply({ $debug: { $get: "name" } }, { name: "test" })).toEqual(
      "test",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Debug:",
      expect.objectContaining({ result: "test" }),
    );
    consoleSpy.mockRestore();
  });

  it("debugs identity expression", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(apply({ $debug: { $literal: "input" } }, "input")).toEqual("input");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Debug:",
      expect.objectContaining({ result: "input" }),
    );
    consoleSpy.mockRestore();
  });

  describe("evaluate form", () => {
    it("evaluates debug expression and logs result", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      expect(evaluate({ $debug: { $sum: [1, 2, 3] } })).toEqual(6);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Debug (evaluate):",
        expect.objectContaining({ result: 6 }),
      );
      consoleSpy.mockRestore();
    });

    it("debugs literal values", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      expect(evaluate({ $debug: { $literal: "hello" } })).toEqual("hello");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Debug (evaluate):",
        expect.objectContaining({ result: "hello" }),
      );
      consoleSpy.mockRestore();
    });
  });
});

describe("$default", () => {
  const testData = {
    name: "Chen",
    age: 5,
    status: "active",
    profile: {
      email: null,
      phone: undefined,
      contact: "parent@example.com",
    },
  };

  describe("apply form", () => {
    it("returns expression result when not null/undefined", () => {
      expect(
        apply(
          {
            $default: {
              expression: { $get: "profile.contact" },
              default: "fallback",
            },
          },
          testData,
        ),
      ).toBe("parent@example.com");
    });

    it("returns default when expression is null", () => {
      expect(
        apply(
          {
            $default: {
              expression: { $get: "profile.email" },
              default: "no-email@example.com",
            },
          },
          testData,
        ),
      ).toBe("no-email@example.com");
    });

    it("returns default when expression is undefined", () => {
      expect(
        apply(
          {
            $default: {
              expression: { $get: "profile.phone" },
              default: "no-phone",
            },
          },
          testData,
        ),
      ).toBe("no-phone");
    });

    it("returns expression result even if falsy when allowNull is true", () => {
      const data = { empty: "", zero: 0, falsy: false };

      expect(
        apply(
          {
            $default: {
              expression: { $get: "empty" },
              default: "fallback",
              allowNull: true,
            },
          },
          data,
        ),
      ).toBe("");

      expect(
        apply(
          {
            $default: {
              expression: { $get: "zero" },
              default: "fallback",
              allowNull: true,
            },
          },
          data,
        ),
      ).toBe(0);

      expect(
        apply(
          {
            $default: {
              expression: { $get: "falsy" },
              default: "fallback",
              allowNull: true,
            },
          },
          data,
        ),
      ).toBe(false);
    });

    it("returns default when expression is undefined even with allowNull true", () => {
      expect(
        apply(
          {
            $default: {
              expression: { $get: "profile.phone" },
              default: "fallback",
              allowNull: true,
            },
          },
          testData,
        ),
      ).toBe("fallback");
    });

    it("works with literal default values", () => {
      expect(
        apply(
          {
            $default: {
              expression: { $get: "missing" },
              default: { $literal: "default value" },
            },
          },
          testData,
        ),
      ).toBe("default value");
    });

    it("works with complex expressions", () => {
      const children = [
        { name: "Amira", age: 3, group: null },
        { name: "Diego", age: 4, group: "preschool" },
      ];

      const result = apply(
        {
          $map: {
            $default: {
              expression: { $get: "group" },
              default: "unassigned",
            },
          },
        },
        children,
      );

      expect(result).toEqual(["unassigned", "preschool"]);
    });

    it("throws error for invalid operand", () => {
      expect(() => apply({ $default: "not an object" }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("throws error for missing expression property", () => {
      expect(() => apply({ $default: { default: "fallback" } }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("throws error for missing default property", () => {
      expect(() =>
        apply({ $default: { expression: { $get: "name" } } }, {}),
      ).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates expression and returns result when not null/undefined", () => {
      expect(
        evaluate({
          $default: {
            expression: { $literal: "success" },
            default: { $literal: "fallback" },
          },
        }),
      ).toBe("success");
    });

    it("evaluates default when expression is null", () => {
      expect(
        evaluate({
          $default: {
            expression: { $literal: null },
            default: { $literal: "fallback" },
          },
        }),
      ).toBe("fallback");
    });

    it("evaluates default when expression is undefined", () => {
      expect(
        evaluate({
          $default: {
            expression: { $literal: undefined },
            default: { $literal: "fallback" },
          },
        }),
      ).toBe("fallback");
    });

    it("returns expression result even if falsy when allowNull is true", () => {
      expect(
        evaluate({
          $default: {
            expression: { $literal: "" },
            default: { $literal: "fallback" },
            allowNull: true,
          },
        }),
      ).toBe("");

      expect(
        evaluate({
          $default: {
            expression: { $literal: 0 },
            default: { $literal: "fallback" },
            allowNull: true,
          },
        }),
      ).toBe(0);

      expect(
        evaluate({
          $default: {
            expression: { $literal: false },
            default: { $literal: "fallback" },
            allowNull: true,
          },
        }),
      ).toBe(false);
    });

    it("works with complex expressions in both expression and default", () => {
      expect(
        evaluate({
          $default: {
            expression: {
              $get: { object: { missing: null }, path: "missing" },
            },
            default: { $sum: [1, 2, 3] },
          },
        }),
      ).toBe(6);
    });

    it("throws error for invalid operand", () => {
      expect(() => evaluate({ $default: "not an object" })).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("throws error for missing expression property", () => {
      expect(() =>
        evaluate({ $default: { default: { $literal: "fallback" } } }),
      ).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("throws error for missing default property", () => {
      expect(() =>
        evaluate({ $default: { expression: { $literal: "test" } } }),
      ).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });
  });
});

describe("$literal", () => {
  it("doesn't apply to expression operands", () => {
    const expr = { $unknownExpr: "" };
    expect(apply({ $literal: expr })).toEqual(expr);
  });

  it("doesn't allow literals that look like expressions to be evaluated", () => {
    const notExpr = { $literal: { $eq: 4 } };
    expect(apply(notExpr, 4)).toEqual({ $eq: 4 });
  });

  it("doesn't allow literals that look like expressions to be evaluated (2)", () => {
    const notExpr = { $literal: { $eq: 4 } };
    const expr = {
      $case: {
        value: { $get: "value" },
        cases: [{ when: notExpr, then: "Match literal" }],
        default: "No match",
      },
    };

    expect(apply(expr, { value: 4 })).toEqual("No match");
    expect(apply(expr, { value: { $eq: 4 } })).toEqual("Match literal");
  });

  it("doesn't evaluate expression operands", () => {
    const expr = { $unknownExpr: "" };
    expect(evaluate({ $literal: expr })).toEqual(expr);
  });
});

describe("$pipe", () => {
  it("pipes expressions left-to-right (pipeline order)", () => {
    expect(apply({ $pipe: [{ $get: "name" }] }, { name: "Zarina" })).toEqual(
      "Zarina",
    );
  });

  it("pipes multiple expressions in pipeline order", () => {
    // $pipe: [h, g, f] means f(g(h(x))) - pipeline order
    const result = apply(
      {
        $pipe: [
          { $get: "value" }, // h: get value
          { $multiply: 2 }, // g: multiply by 2
          { $add: 0 }, // f: identity (add 0)
        ],
      },
      { value: 5 },
    );
    expect(result).toEqual(10); // 5 * 2 + 0 = 10
  });

  it("pipes nested data extraction", () => {
    const data = { child: { name: "Fatoumata" } };

    const result = apply(
      {
        $pipe: [
          { $get: "child" }, // first: get child object
          { $get: "name" }, // then: get name from child
        ],
      },
      data,
    );

    expect(result).toEqual("Fatoumata");
  });

  it("throws with a non-expression", () => {
    expect(() => {
      evaluate([{ $pipe: "lol" }, { name: "Zarina" }]);
    }).toThrowError();
  });

  it("throws with an invalid expression", () => {
    expect(() => {
      apply({ $pipe: [{ $in: "should be an array" }] }, { name: "Zarina" });
    }).toThrowError();
  });

  it("should preserve literal expressions in pipeline and NOT execute them as data", () => {
    // This should fail - $literal should preserve the expression objects as data, not execute them
    const data = { name: "Kenji" };
    const result = apply({ $pipe: [{ $literal: { $get: "name" } }] }, data);

    expect(result).toEqual({ $get: "name" });
  });

  it("should preserve literal expressions and not evaluate them", () => {
    // This should work - literal expression becomes data for next step
    const result = apply(
      {
        $pipe: [
          { $literal: { expressionType: "$get", path: "name" } }, // Literal object as data
          { $get: "expressionType" }, // Get field from the literal object
        ],
      },
      { name: "ignored" },
    );
    expect(result).toBe("$get");
  });
});

describe("$sort", () => {
  const children = [
    { name: "Diego", age: 4, status: "active", score: 88 },
    { name: "Chen", age: 5, status: "active", score: 92 },
    { name: "Amira", age: 3, status: "inactive", score: 78 },
  ];

  describe("apply form", () => {
    it("sorts by simple field name", () => {
      const result = apply({ $sort: "age" }, children);
      expect(result.map((c) => c.name)).toEqual(["Amira", "Diego", "Chen"]);
    });

    it("sorts by field in descending order", () => {
      const result = apply(
        {
          $sort: { by: "age", desc: true },
        },
        children,
      );
      expect(result.map((c) => c.name)).toEqual(["Chen", "Diego", "Amira"]);
    });

    it("sorts by expression", () => {
      const result = apply(
        {
          $sort: { by: { $get: "score" } },
        },
        children,
      );
      expect(result.map((c) => c.name)).toEqual(["Amira", "Diego", "Chen"]);
    });

    it("sorts by multiple criteria", () => {
      const data = [
        { name: "Ana", group: "A", score: 85 },
        { name: "Ben", group: "B", score: 90 },
        { name: "Carl", group: "A", score: 85 },
        { name: "Diana", group: "B", score: 88 },
      ];

      const result = apply(
        {
          $sort: [{ by: "group" }, { by: "score", desc: true }, { by: "name" }],
        },
        data,
      );

      expect(result.map((c) => c.name)).toEqual([
        "Ana",
        "Carl",
        "Ben",
        "Diana",
      ]);
    });

    it("maintains original array immutability", () => {
      const original = [...children];
      apply({ $sort: "age" }, children);
      expect(children).toEqual(original);
    });

    it("throws error when applied to non-array", () => {
      expect(() => apply({ $sort: "age" }, { name: "not array" })).toThrow(
        "$sort can only be applied to arrays",
      );
    });

    it("throws error for object form without 'by' property", () => {
      expect(() => apply({ $sort: { desc: true } }, children)).toThrow(
        "$sort operand must be string, object with 'by' property, or array of sort criteria",
      );
    });

    it("throws error for invalid operand type", () => {
      expect(() => apply({ $sort: 123 }, children)).toThrow(
        "$sort operand must be string, object with 'by' property, or array of sort criteria",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates sort against provided array", () => {
      const data = [
        { name: "Yuki", age: 6 },
        { name: "Omar", age: 4 },
        { name: "Lila", age: 5 },
      ];

      const result = evaluate({
        $sort: { array: data, sortCriteria: "age" },
      });

      expect(result.map((c) => c.name)).toEqual(["Omar", "Lila", "Yuki"]);
    });

    it("works with complex sort criteria in evaluate form", () => {
      const data = [
        { name: "Sofia", status: "active", score: 85 },
        { name: "Raj", status: "inactive", score: 90 },
        { name: "Emma", status: "active", score: 88 },
      ];

      const result = evaluate({
        $sort: {
          array: data,
          sortCriteria: [{ by: "status" }, { by: "score", desc: true }],
        },
      });

      expect(result.map((c) => c.name)).toEqual(["Emma", "Sofia", "Raj"]);
    });

    it("works with object format in evaluate form", () => {
      const data = [
        { name: "Chen", age: 5 },
        { name: "Amira", age: 3 },
        { name: "Diego", age: 4 },
      ];

      const result = evaluate({
        $sort: { array: data, sortCriteria: { by: "age" } },
      });

      expect(result.map((c) => c.name)).toEqual(["Amira", "Diego", "Chen"]);
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $sort: "not an array" })).toThrow(
        "$sort evaluate form requires object operand: { array, sortCriteria }",
      );
    });
  });
});
