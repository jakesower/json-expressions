import { describe, expect, it, vi } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply } = testEngine;

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

  describe("basic functionality", () => {
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

    it("returns default when expression is null (was undefined) even with allowNull true", () => {
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
});

describe("$literal", () => {
  it("doesn't apply to expression operands", () => {
    const expr = { $unknownExpr: "" };
    expect(apply({ $literal: expr }, {})).toEqual(expr);
  });

  it("doesn't allow literals that look like expressions to be evaluated", () => {
    const notExpr = { $literal: { $eq: 4 } };
    expect(apply(notExpr, { value: 4 })).toEqual({ $eq: 4 });
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

  describe("basic functionality", () => {
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
});

describe("flow expressions - edge cases", () => {
  describe("$debug edge cases", () => {
    it("handles null and undefined operands", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      expect(apply({ $debug: null }, { test: "data" })).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Debug:",
        expect.objectContaining({ result: null }),
      );

      expect(apply({ $debug: undefined }, { test: "data" })).toBe(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Debug:",
        expect.objectContaining({ result: undefined }),
      );

      consoleSpy.mockRestore();
    });

    it("handles complex nested expressions", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const data = { user: { name: "Elena", age: 30 } };

      const result = apply(
        {
          $debug: {
            $select: {
              name: { $get: "user.name" },
              isAdult: { $gte: [{ $get: "user.age" }, 18] },
            },
          },
        },
        data,
      );

      expect(result).toEqual({ name: "Elena", isAdult: true });
      expect(consoleSpy).toHaveBeenCalledWith("Debug:", {
        operand: {
          $select: {
            name: { $get: "user.name" },
            isAdult: { $gte: [{ $get: "user.age" }, 18] },
          },
        },
        inputData: data,
        result: { name: "Elena", isAdult: true },
      });

      consoleSpy.mockRestore();
    });

    it("handles error cases gracefully", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      expect(() =>
        apply({ $debug: { $invalidExpression: "test" } }, {}),
      ).toThrow();

      consoleSpy.mockRestore();
    });

    it("preserves original input data", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const originalData = { name: "Chen", toys: ["blocks"] };

      apply({ $debug: { $get: "name" } }, originalData);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Debug:",
        expect.objectContaining({
          inputData: originalData,
          operand: { $get: "name" },
          result: "Chen",
        }),
      );

      consoleSpy.mockRestore();
    });

    it("works with special JavaScript values", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      expect(apply({ $debug: { $literal: NaN } }, {})).toBeNaN();
      expect(apply({ $debug: { $literal: Infinity } }, {})).toBe(Infinity);
      expect(apply({ $debug: { $literal: -0 } }, {})).toBe(-0);

      consoleSpy.mockRestore();
    });
  });

  describe("$default edge cases", () => {
    it("handles null and undefined consistently (null = undefined)", () => {
      const data = { nullValue: null, undefinedValue: undefined };

      // In this system, null = undefined, so both use the default
      expect(
        apply(
          {
            $default: {
              expression: { $get: "nullValue" },
              default: "fallback",
              allowNull: true,
            },
          },
          data,
        ),
      ).toBe("fallback");

      expect(
        apply(
          {
            $default: {
              expression: { $get: "undefinedValue" },
              default: "fallback",
              allowNull: true,
            },
          },
          data,
        ),
      ).toBe("fallback");
    });

    it("handles nested $default expressions", () => {
      const data = { level1: { level2: null } };

      expect(
        apply(
          {
            $default: {
              expression: {
                $default: {
                  expression: { $get: "level1.level2.missing" },
                  default: { $get: "level1.level2" },
                },
              },
              default: "final fallback",
            },
          },
          data,
        ),
      ).toBe("final fallback");
    });

    it("works with expression-based defaults", () => {
      const data = {
        primary: null,
        secondary: "backup",
        tertiary: "last resort",
      };

      expect(
        apply(
          {
            $default: {
              expression: { $get: "primary" },
              default: {
                $default: {
                  expression: { $get: "secondary" },
                  default: { $get: "tertiary" },
                },
              },
            },
          },
          data,
        ),
      ).toBe("backup");
    });

    it("handles various operand validation errors", () => {
      expect(() => apply({ $default: null }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );

      expect(() => apply({ $default: [] }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );

      expect(() => apply({ $default: "string" }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );

      expect(() => apply({ $default: 123 }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("handles empty object operand", () => {
      expect(() => apply({ $default: {} }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("handles operand with only one required property", () => {
      expect(() =>
        apply({ $default: { expression: { $literal: "test" } } }, {}),
      ).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );

      expect(() => apply({ $default: { default: "fallback" } }, {})).toThrow(
        "$default operand must be on object with { expression, default, allowNull? }",
      );
    });

    it("preserves type information in default values", () => {
      const data = { missing: undefined };

      expect(
        apply(
          {
            $default: {
              expression: { $get: "missing" },
              default: { $literal: { type: "object", value: null } },
            },
          },
          data,
        ),
      ).toEqual({ type: "object", value: null });
    });

    it("handles circular default references gracefully", () => {
      const circularData = { name: "test" };
      circularData.self = circularData;

      expect(
        apply(
          {
            $default: {
              expression: { $get: "missing" },
              default: { $get: "self.name" },
            },
          },
          circularData,
        ),
      ).toBe("test");
    });
  });

  describe("$literal edge cases", () => {
    it("handles deeply nested expression-like objects", () => {
      const complexExpr = {
        $select: {
          child: { $get: "nested.path" },
          computed: { $add: [1, { $multiply: [2, 3] }] },
        },
      };

      expect(apply({ $literal: complexExpr }, {})).toEqual(complexExpr);
    });

    it("preserves arrays with expression-like objects", () => {
      const arrayWithExpressions = [
        { $get: "name" },
        { $add: [1, 2] },
        "normal string",
        123,
      ];

      expect(apply({ $literal: arrayWithExpressions }, {})).toEqual(
        arrayWithExpressions,
      );
    });

    it("handles primitive values", () => {
      expect(apply({ $literal: 42 }, {})).toBe(42);
      expect(apply({ $literal: "string" }, {})).toBe("string");
      expect(apply({ $literal: true }, {})).toBe(true);
      expect(apply({ $literal: null }, {})).toBe(null);
      expect(apply({ $literal: undefined }, {})).toBe(undefined);
    });

    it("handles special JavaScript values", () => {
      expect(apply({ $literal: NaN }, {})).toBeNaN();
      expect(apply({ $literal: Infinity }, {})).toBe(Infinity);
      expect(apply({ $literal: -Infinity }, {})).toBe(-Infinity);
      expect(apply({ $literal: -0 }, {})).toBe(-0);
    });

    it("preserves nested literal expressions", () => {
      const nestedLiteral = {
        outer: { $literal: { inner: { $get: "value" } } },
      };

      expect(apply({ $literal: nestedLiteral }, {})).toEqual(nestedLiteral);
    });

    it("works with complex data structures", () => {
      const complexData = {
        children: [
          { name: "Amara", expressions: [{ $get: "age" }] },
          { name: "Diego", expressions: [{ $add: [1, 2] }] },
        ],
        metadata: {
          expressions: { $pipe: [{ $get: "data" }, { $select: ["name"] }] },
        },
      };

      expect(apply({ $literal: complexData }, {})).toEqual(complexData);
    });

    it("handles function objects as literals", () => {
      const funcObj = {
        toString: function () {
          return "custom";
        },
      };
      expect(apply({ $literal: funcObj }, {})).toEqual(funcObj);
    });
  });

  describe("$pipe edge cases", () => {
    it("handles empty array operand", () => {
      const data = { name: "Wei", age: 4 };
      expect(apply({ $pipe: [] }, data)).toEqual(data);
    });

    it("handles single expression in pipeline", () => {
      expect(apply({ $pipe: [{ $get: "name" }] }, { name: "Iris" })).toBe(
        "Iris",
      );
    });

    it("handles complex transformation pipelines", () => {
      const data = {
        children: [
          { name: "Chen", active: true },
          { name: "Yuki", active: false },
          { name: "Omar", active: true },
        ],
      };

      expect(
        apply(
          {
            $pipe: [
              { $get: "children" },
              { $filter: { $get: "active" } },
              { $map: { $get: "name" } },
            ],
          },
          data,
        ),
      ).toEqual(["Chen", "Omar"]);
    });

    it("handles null/undefined intermediate results", () => {
      const data = { nested: null };

      expect(
        apply(
          {
            $pipe: [
              { $get: "nested" },
              {
                $default: {
                  expression: { $get: "missing" },
                  default: "fallback",
                },
              },
            ],
          },
          data,
        ),
      ).toBe("fallback");
    });

    it("preserves type information through pipeline", () => {
      const data = { numbers: [1, 2, 3] };

      expect(
        apply(
          {
            $pipe: [
              { $get: "numbers" },
              { $map: { $multiply: 2 } },
              { $get: "length" },
            ],
          },
          data,
        ),
      ).toBe(3);
    });

    it("throws for non-array operand", () => {
      expect(() => apply({ $pipe: "not array" }, {})).toThrow(
        "$pipe operand must be an array of expressions",
      );

      expect(() => apply({ $pipe: { key: "value" } }, {})).toThrow(
        "$pipe operand must be an array of expressions",
      );

      expect(() => apply({ $pipe: null }, {})).toThrow(
        "$pipe operand must be an array of expressions",
      );
    });

    it("handles literal expressions in pipeline correctly", () => {
      expect(
        apply(
          {
            $pipe: [{ $literal: { status: "processing" } }, { $get: "status" }],
          },
          { original: "data" },
        ),
      ).toBe("processing");
    });
  });

  describe("$sort edge cases", () => {
    it("handles empty array input", () => {
      expect(apply({ $sort: "name" }, [])).toEqual([]);
    });

    it("handles single item array", () => {
      const singleItem = [{ name: "Alone", age: 3 }];
      expect(apply({ $sort: "age" }, singleItem)).toEqual(singleItem);
    });

    it("handles equal values (line 112 coverage)", () => {
      const equalValues = [
        { name: "Ana", score: 85 },
        { name: "Ben", score: 85 },
        { name: "Carl", score: 85 },
      ];

      const result = apply({ $sort: "score" }, equalValues);
      expect(result.map((item) => item.score)).toEqual([85, 85, 85]);
      // Original order should be preserved for equal values
      expect(result.map((item) => item.name)).toEqual(["Ana", "Ben", "Carl"]);
    });

    it("handles mixed data types in sort field", () => {
      const mixedData = [
        { name: "C", value: "string" },
        { name: "A", value: 42 },
        { name: "B", value: null },
      ];

      const result = apply({ $sort: "value" }, mixedData);
      // JavaScript comparison behavior with mixed types
      expect(result.map((item) => item.name)).toEqual(["C", "B", "A"]);
    });

    it("handles missing values in sort field (now null)", () => {
      const withMissing = [
        { name: "A", score: 90 },
        { name: "B" }, // missing score (now returns null instead of undefined)
        { name: "C", score: 85 },
      ];

      const result = apply({ $sort: "score" }, withMissing);
      // JavaScript comparison behavior: null < numbers, so B comes first
      expect(result.map((item) => item.name)).toEqual(["B", "C", "A"]);
    });

    it("handles complex expression-based sorting", () => {
      const data = [
        { name: "Ana", nested: { level: { score: 78 } } },
        { name: "Ben", nested: { level: { score: 92 } } },
        { name: "Carl", nested: { level: { score: 85 } } },
      ];

      const result = apply(
        { $sort: { by: { $get: "nested.level.score" } } },
        data,
      );

      expect(result.map((item) => item.name)).toEqual(["Ana", "Carl", "Ben"]);
    });

    it("handles multiple sort criteria with equal primary values", () => {
      const data = [
        { group: "A", name: "Charlie", score: 85 },
        { group: "A", name: "Alice", score: 85 },
        { group: "A", name: "Bob", score: 85 },
      ];

      const result = apply(
        {
          $sort: [{ by: "group" }, { by: "score", desc: true }, { by: "name" }],
        },
        data,
      );

      expect(result.map((item) => item.name)).toEqual([
        "Alice",
        "Bob",
        "Charlie",
      ]);
    });

    it("handles nested array sorting", () => {
      const data = [
        { name: "Team A", scores: [85, 90, 88] },
        { name: "Team B", scores: [92, 87, 89] },
        { name: "Team C", scores: [78, 85, 82] },
      ];

      const result = apply({ $sort: { by: { $get: "scores.0" } } }, data);

      expect(result.map((item) => item.name)).toEqual([
        "Team C",
        "Team A",
        "Team B",
      ]);
    });

    it("maintains immutability with nested objects", () => {
      const original = [
        { name: "Test", nested: { value: 1 } },
        { name: "Other", nested: { value: 2 } },
      ];
      const originalCopy = JSON.parse(JSON.stringify(original));

      apply({ $sort: "nested.value" }, original);

      expect(original).toEqual(originalCopy);
    });

    it("throws for invalid sort criteria in array", () => {
      const data = [{ name: "Test1" }, { name: "Test2" }];

      expect(() => apply({ $sort: [{ invalidKey: "value" }] }, data)).toThrow(
        "$sort operand must be string, object with 'by' property, or array of sort criteria",
      );

      expect(() => apply({ $sort: ["string-in-array"] }, data)).toThrow(
        "$sort operand must be string, object with 'by' property, or array of sort criteria",
      );
    });

    it("handles boolean desc flag variations", () => {
      const data = [
        { name: "A", score: 85 },
        { name: "B", score: 92 },
        { name: "C", score: 78 },
      ];

      // desc: false (explicit)
      expect(
        apply({ $sort: { by: "score", desc: false } }, data).map((i) => i.name),
      ).toEqual(["C", "A", "B"]);

      // desc: true
      expect(
        apply({ $sort: { by: "score", desc: true } }, data).map((i) => i.name),
      ).toEqual(["B", "A", "C"]);

      // no desc property (defaults to false)
      expect(
        apply({ $sort: { by: "score" } }, data).map((i) => i.name),
      ).toEqual(["C", "A", "B"]);
    });
  });

  describe("error handling and validation", () => {
    it("handles malformed operands gracefully", () => {
      expect(() => apply({ $pipe: "string" }, {})).toThrow();
      expect(() => apply({ $sort: [] }, []));
    });
  });

  describe("integration and compatibility", () => {
    it("works well with other expressions in complex scenarios", () => {
      const data = {
        classroom: {
          students: [
            { name: "Elena", scores: [92, 87, 95], active: true },
            { name: "Miguel", scores: [78, 84, 91], active: false },
            { name: "Sofia", scores: [88, 85, 89], active: true },
          ],
        },
      };

      expect(
        apply(
          {
            $pipe: [
              { $get: "classroom.students" },
              { $filter: { $get: "active" } },
              {
                $map: {
                  $select: {
                    name: { $get: "name" },
                    avgScore: {
                      $divide: [
                        { $sum: { $get: "scores" } },
                        { $get: "scores.length" },
                      ],
                    },
                  },
                },
              },
              { $sort: { by: "avgScore", desc: true } },
            ],
          },
          data,
        ),
      ).toEqual([
        { name: "Elena", avgScore: 91.33333333333333 },
        { name: "Sofia", avgScore: 87.33333333333333 },
      ]);
    });

    it("maintains consistent behavior for sorting", () => {
      const testData = {
        items: [
          { value: 3 },
          { value: 1 },
          { value: 4 },
          { value: 1 },
          { value: 5 },
        ],
      };

      // $pipe with sorting
      expect(
        apply({ $pipe: [{ $get: "items" }, { $sort: "value" }] }, testData),
      ).toEqual([
        { value: 1 },
        { value: 1 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
      ]);

      // $sort with objects
      expect(apply({ $sort: "value" }, testData.items)).toEqual([
        { value: 1 },
        { value: 1 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
      ]);
    });
  });
});
