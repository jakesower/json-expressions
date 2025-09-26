import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";
import { isEqual } from "es-toolkit";

const kids = {
  ximena: { name: "Ximena", age: 4 },
  yousef: { name: "Yousef", age: 5 },
  zoë: { name: "Zoë", age: 6 },
};

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply, evaluate } = testEngine;

describe("binary comparitive expressions", () => {
  const binaryComparisonExpressions = {
    $eq: isEqual,
    $ne: (x, y) => !isEqual(x, y),
    $gt: (x, y) => x > y,
    $gte: (x, y) => x >= y,
    $lt: (x, y) => x < y,
    $lte: (x, y) => x <= y,
  };

  describe("common features", () => {
    Object.entries(binaryComparisonExpressions).forEach(([expr, fn]) => {
      describe(expr, () => {
        describe("apply", () => {
          it("applies the comparison to input data in singular value form", () => {
            const exp = { $pipe: [{ $get: "age" }, { [expr]: 5 }] };

            Object.values(kids).forEach((kid) => {
              expect(apply(exp, kid)).toBe(fn(kid.age, 5));
            });
          });

          it("applies the comparison to input data in array value form", () => {
            const exp = { [expr]: [{ $get: "age" }, 5] };

            Object.values(kids).forEach((kid) => {
              expect(apply(exp, kid)).toBe(fn(kid.age, 5));
            });
          });

          it("throws with wrong array length", () => {
            expect(() => apply({ [expr]: [1, 2, 3] }, {})).toThrowError(
              "Comparitive expressions in array form require exactly 2 elements",
            );
          });
        });

        describe("evaluate", () => {
          it("evaluates array form", () => {
            const expFn = (kid) => ({ [expr]: [kid.age, 5] });
            Object.values(kids).forEach((kid) => {
              expect(evaluate(expFn(kid))).toBe(fn(kid.age, 5));
            });
          });

          it("evaluates object form", () => {
            const expFn = (kid) => ({ [expr]: { left: kid.age, right: 5 } });
            Object.values(kids).forEach((kid) => {
              expect(evaluate(expFn(kid))).toBe(fn(kid.age, 5));
            });
          });

          it("throws with wrong array length", () => {
            expect(() => evaluate({ [expr]: [1, 2, 3] })).toThrowError(
              "Comparison evaluate form requires either array or object operand: [left, right] or { left, right }",
            );
          });
        });
      });
    });
  });

  describe("$eq", () => {
    describe("apply form", () => {
      it("handles deep equality", () => {
        const expression = {
          $eq: { $literal: [3, { chicken: "butt" }] },
        };
        expect(apply(expression, [3, { chicken: "butt" }])).toBe(true);
      });
    });
  });

  describe("$ne", () => {
    describe("apply form", () => {
      it("handles deep inequality", () => {
        const expression = {
          $ne: { $literal: [3, { chicken: "butt" }] },
        };
        expect(apply(expression, [3, { chicken: "butt" }])).toBe(false);
      });
    });
  });
});

describe("$in", () => {
  describe("apply form", () => {
    it("implements the $in expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $in: [4, 6] }] };

      expect(apply(exp, kids.ximena)).toBe(true);
      expect(apply(exp, kids.yousef)).toBe(false);
      expect(apply(exp, kids.zoë)).toBe(true);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static array membership", () => {
      expect(evaluate({ $in: { array: [1, 2, 3], value: 2 } })).toBe(true);
      expect(evaluate({ $in: { array: [1, 2, 3], value: 5 } })).toBe(false);
    });

    it("evaluates using object format", () => {
      expect(evaluate({ $in: { array: [1, 2, 3], value: 2 } })).toBe(true);
      expect(evaluate({ $in: { array: [1, 2, 3], value: 5 } })).toBe(false);
    });

    it("throws error for non-array parameter in evaluate", () => {
      expect(() => evaluate({ $in: { array: "not-array", value: 2 } })).toThrow(
        "$in parameter must be an array",
      );
    });

    it("throws error for invalid object format", () => {
      expect(() => evaluate({ $in: "not an object" })).toThrow(
        "$in evaluate form requires object operand: { array, value }",
      );
    });
  });
});

describe("$nin", () => {
  describe("apply form", () => {
    it("implements the $nin expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $nin: [4, 6] }] };

      expect(apply(exp, kids.ximena)).toBe(false);
      expect(apply(exp, kids.yousef)).toBe(true);
      expect(apply(exp, kids.zoë)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static array membership", () => {
      expect(evaluate({ $nin: { array: [1, 2, 3], value: 5 } })).toBe(true);
      expect(evaluate({ $nin: { array: [1, 2, 3], value: 2 } })).toBe(false);
    });

    it("throws error for non-array operand in evaluate", () => {
      expect(() => apply({ $nin: 2 })).toThrow();
    });

    it("throws error for non-array parameter in evaluate", () => {
      expect(() =>
        evaluate({ $nin: { array: "not-array", value: 2 } }),
      ).toThrow("$nin parameter must be an array");
    });
  });
});

describe("$matchesRegex", () => {
  describe("apply form", () => {
    it("should match a simple pattern", () => {
      expect(apply({ $matchesRegex: "hello" }, "hello world")).toBe(true);
      expect(apply({ $matchesRegex: "hello" }, "goodbye world")).toBe(false);
    });

    it("should match complex patterns", () => {
      expect(
        apply({ $matchesRegex: "\\d{3}-\\d{2}-\\d{4}" }, "123-45-6789"),
      ).toBe(true);
      expect(
        apply({ $matchesRegex: "\\d{3}-\\d{2}-\\d{4}" }, "12-345-6789"),
      ).toBe(false);
    });

    it("should handle start and end anchors", () => {
      expect(apply({ $matchesRegex: "^hello" }, "hello world")).toBe(true);
      expect(apply({ $matchesRegex: "^hello" }, "say hello")).toBe(false);
      expect(apply({ $matchesRegex: "world$" }, "hello world")).toBe(true);
      expect(apply({ $matchesRegex: "world$" }, "world peace")).toBe(false);
    });

    it("should handle case-sensitive matching by default", () => {
      expect(apply({ $matchesRegex: "Hello" }, "Hello World")).toBe(true);
      expect(apply({ $matchesRegex: "Hello" }, "hello world")).toBe(false);
    });

    it("should support case-insensitive flag", () => {
      expect(apply({ $matchesRegex: "(?i)hello" }, "Hello World")).toBe(true);
      expect(apply({ $matchesRegex: "(?i)hello" }, "HELLO WORLD")).toBe(true);
      expect(apply({ $matchesRegex: "(?i)hello" }, "goodbye")).toBe(false);
    });

    it("should support multiline flag", () => {
      const text = "line1\nline2\nline3";
      expect(apply({ $matchesRegex: "(?m)^line2" }, text)).toBe(true);
      expect(apply({ $matchesRegex: "^line2" }, text)).toBe(false);
    });

    it("should support dotall flag", () => {
      const text = "hello\nworld";
      expect(apply({ $matchesRegex: "(?s)hello.world" }, text)).toBe(true);
      expect(apply({ $matchesRegex: "hello.world" }, text)).toBe(false);
    });

    it("should support combined flags", () => {
      const text = "Hello\nWORLD";
      expect(apply({ $matchesRegex: "(?ims)^hello.world$" }, text)).toBe(true);
      expect(apply({ $matchesRegex: "(?is)hello.world" }, text)).toBe(true);
      expect(apply({ $matchesRegex: "(?i)hello.world" }, text)).toBe(false); // no dotall
    });

    it("should handle unsupported flags gracefully", () => {
      expect(apply({ $matchesRegex: "(?x)hello" }, "hello")).toBe(true); // unsupported flag stripped
      expect(apply({ $matchesRegex: "(?q)test" }, "test")).toBe(true); // unsupported flag stripped
      expect(apply({ $matchesRegex: "hello" }, "hello")).toBe(true); // no flags
    });

    it("should throw when input is not a string", () => {
      expect(() => apply({ $matchesRegex: "pattern" }, 123)).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "pattern" }, null)).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "pattern" }, undefined)).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "pattern" }, [])).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "pattern" }, {})).toThrow(
        "$matchesRegex requires string input",
      );
    });

    it("should handle invalid regex patterns", () => {
      expect(() => apply({ $matchesRegex: "[" }, "test")).toThrow(); // Invalid regex
      expect(() => apply({ $matchesRegex: "(?i)[" }, "test")).toThrow(); // Invalid regex with flags
    });
  });

  describe("evaluate form", () => {
    it("should work with evaluate form", () => {
      expect(
        evaluate({ $matchesRegex: { pattern: "hello", text: "hello world" } }),
      ).toBe(true);
      expect(
        evaluate({
          $matchesRegex: { pattern: "hello", text: "goodbye world" },
        }),
      ).toBe(false);
    });

    it("should work with flags in evaluate form", () => {
      expect(
        evaluate({
          $matchesRegex: { pattern: "(?i)hello", text: "HELLO WORLD" },
        }),
      ).toBe(true);
      expect(
        evaluate({
          $matchesRegex: { pattern: "(?m)^line2", text: "line1\nline2" },
        }),
      ).toBe(true);
    });

    it("should throw with invalid input in evaluate form", () => {
      expect(() =>
        evaluate({ $matchesRegex: { pattern: "pattern", text: 123 } }),
      ).toThrow("$matchesRegex requires string input");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string input", () => {
      expect(apply({ $matchesRegex: "" }, "")).toBe(true);
      expect(apply({ $matchesRegex: "test" }, "")).toBe(false);
      expect(apply({ $matchesRegex: ".*" }, "")).toBe(true);
    });

    it("should handle special regex characters in pattern", () => {
      expect(apply({ $matchesRegex: "\\$\\^\\*\\+\\?\\." }, "$^*+?.")).toBe(
        true,
      );
      expect(apply({ $matchesRegex: "test\\.com" }, "test.com")).toBe(true);
      expect(apply({ $matchesRegex: "test\\.com" }, "testXcom")).toBe(false);
    });

    it("should handle unicode characters", () => {
      expect(apply({ $matchesRegex: "café" }, "café")).toBe(true);
      expect(apply({ $matchesRegex: "(?i)café" }, "CAFÉ")).toBe(true);
    });
  });
});

describe("$between", () => {
  describe("apply form", () => {
    it("should check if student ages are within daycare range", () => {
      expect(apply({ $between: { min: 3, max: 6 } }, 4)).toBe(true);
      expect(apply({ $between: { min: 3, max: 6 } }, 3)).toBe(true);
      expect(apply({ $between: { min: 3, max: 6 } }, 6)).toBe(true);
      expect(apply({ $between: { min: 3, max: 6 } }, 2)).toBe(false);
      expect(apply({ $between: { min: 3, max: 6 } }, 7)).toBe(false);
    });

    it("should work with decimal scores for Fatima's assessment", () => {
      expect(apply({ $between: { min: 80.0, max: 95.5 } }, 85.5)).toBe(true);
      expect(apply({ $between: { min: 80.0, max: 95.5 } }, 80.0)).toBe(true);
      expect(apply({ $between: { min: 80.0, max: 95.5 } }, 95.5)).toBe(true);
      expect(apply({ $between: { min: 80.0, max: 95.5 } }, 79.9)).toBe(false);
      expect(apply({ $between: { min: 80.0, max: 95.5 } }, 95.6)).toBe(false);
    });

    it("should handle negative numbers for Priya's temperature tracking", () => {
      expect(apply({ $between: { min: -10, max: 5 } }, 0)).toBe(true);
      expect(apply({ $between: { min: -10, max: 5 } }, -5)).toBe(true);
      expect(apply({ $between: { min: -10, max: 5 } }, -10)).toBe(true); // Min boundary
      expect(apply({ $between: { min: -10, max: 5 } }, 5)).toBe(true); // Max boundary
      expect(apply({ $between: { min: -10, max: 5 } }, -11)).toBe(false);
      expect(apply({ $between: { min: -10, max: 5 } }, 6)).toBe(false);
    });

    it("should work with simple static operands for Sana's playtime", () => {
      expect(apply({ $between: { min: 30, max: 90 } }, 45)).toBe(true);
      expect(apply({ $between: { min: 30, max: 90 } }, 100)).toBe(false);
      expect(apply({ $between: { min: 30, max: 90 } }, 30)).toBe(true); // boundary
      expect(apply({ $between: { min: 30, max: 90 } }, 90)).toBe(true); // boundary
    });

    it("should handle equal min and max for Rajesh's precise measurements", () => {
      expect(apply({ $between: { min: 100, max: 100 } }, 100)).toBe(true);
      expect(apply({ $between: { min: 100, max: 100 } }, 99)).toBe(false);
      expect(apply({ $between: { min: 100, max: 100 } }, 101)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static between expressions for Nina's grades", () => {
      expect(evaluate({ $between: { value: 85, min: 80, max: 90 } })).toBe(
        true,
      );
      expect(evaluate({ $between: { value: 75, min: 80, max: 90 } })).toBe(
        false,
      );
      expect(evaluate({ $between: { value: 95, min: 80, max: 90 } })).toBe(
        false,
      );
      expect(evaluate({ $between: { value: 80, min: 80, max: 90 } })).toBe(
        true,
      ); // Min boundary
      expect(evaluate({ $between: { value: 90, min: 80, max: 90 } })).toBe(
        true,
      ); // Max boundary
    });

    it("should work with complex nested expressions for Chen's performance", () => {
      const result = evaluate({
        $between: {
          value: { $sum: [70, 15] }, // 85
          min: { $multiply: [2, 40] }, // 80
          max: { $add: [85, 5] }, // 90
        },
      });
      expect(result).toBe(true);
    });

    it("should handle string comparisons for Aria's name length", () => {
      expect(
        evaluate({ $between: { value: "hello", min: "a", max: "z" } }),
      ).toBe(true);
      expect(
        evaluate({ $between: { value: "HELLO", min: "a", max: "z" } }),
      ).toBe(false);
    });

    it("should work with date comparisons for Zahra's enrollment period", () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const checkDate = "2024-06-15";

      expect(
        evaluate({
          $between: { value: checkDate, min: startDate, max: endDate },
        }),
      ).toBe(true);
      expect(
        evaluate({
          $between: { value: "2025-01-01", min: startDate, max: endDate },
        }),
      ).toBe(false);
    });
  });
});

describe("$isPresent", () => {
  describe("apply form", () => {
    it("should detect meaningful values in Arun's medical records", () => {
      expect(apply({ $isPresent: true }, null)).toBe(false);
      expect(apply({ $isPresent: true }, undefined)).toBe(false);
      expect(apply({ $isPresent: true }, 0)).toBe(true);
      expect(apply({ $isPresent: true }, "")).toBe(true);
      expect(apply({ $isPresent: true }, false)).toBe(true);
      expect(apply({ $isPresent: true }, [])).toBe(true);
      expect(apply({ $isPresent: true }, {})).toBe(true);
      expect(apply({ $isPresent: true }, "Arun")).toBe(true);
    });

    it("should work with object properties for Maria's emergency contact", () => {
      const student1 = { name: "Maria", emergencyContact: "555-0123" };
      const student2 = { name: "Elena", emergencyContact: null };
      const student3 = { name: "Yuki" }; // emergencyContact is undefined

      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: true }] },
          student1,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: true }] },
          student2,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: true }] },
          student3,
        ),
      ).toBe(false);
    });

    it("should require boolean operand", () => {
      expect(() => apply({ $isPresent: "invalid" }, "present")).toThrow(
        "$isPresent apply form requires boolean operand (true/false)",
      );
      expect(() => apply({ $isPresent: null }, null)).toThrow(
        "$isPresent apply form requires boolean operand (true/false)",
      );
      expect(() => apply({ $isPresent: { complex: "object" } }, null)).toThrow(
        "$isPresent apply form requires boolean operand (true/false)",
      );
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static value checks for Kenji's allergy information", () => {
      expect(evaluate({ $isPresent: null })).toBe(false);
      expect(evaluate({ $isPresent: undefined })).toBe(false);
      expect(evaluate({ $isPresent: 0 })).toBe(true);
      expect(evaluate({ $isPresent: "" })).toBe(true);
      expect(evaluate({ $isPresent: false })).toBe(true);
      expect(evaluate({ $isPresent: [] })).toBe(true);
      expect(evaluate({ $isPresent: {} })).toBe(true);
      expect(evaluate({ $isPresent: "Kenji" })).toBe(true);
    });

    it("should work with expressions that return values for Diego's attendance", () => {
      expect(
        evaluate({ $isPresent: { $get: { object: {}, path: "missing" } } }),
      ).toBe(false);
      expect(
        evaluate({
          $isPresent: { $get: { object: { name: "Diego" }, path: "name" } },
        }),
      ).toBe(true);
    });

    it("should handle complex nested structures", () => {
      expect(
        evaluate({
          $isPresent: {
            $get: {
              object: { students: [{ name: "Fatima" }] },
              path: "teachers.primary",
            },
          },
        }),
      ).toBe(false);
    });
  });
});

describe("$isEmpty", () => {
  describe("apply form", () => {
    it("should detect empty/absent values in Amara's progress tracking", () => {
      expect(apply({ $isEmpty: true }, null)).toBe(true);
      expect(apply({ $isEmpty: true }, undefined)).toBe(true);
      expect(apply({ $isEmpty: true }, 0)).toBe(false);
      expect(apply({ $isEmpty: true }, "")).toBe(false);
      expect(apply({ $isEmpty: true }, false)).toBe(false);
      expect(apply({ $isEmpty: true }, [])).toBe(false);
      expect(apply({ $isEmpty: true }, {})).toBe(false);
      expect(apply({ $isEmpty: true }, "Amara")).toBe(false);
    });

    it("should work with object properties for Priya's vaccination records", () => {
      const student1 = { name: "Priya", vaccinations: ["MMR", "DTaP"] };
      const student2 = { name: "Sana", vaccinations: null };
      const student3 = { name: "Rajesh" }; // vaccinations is undefined

      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: true }] },
          student1,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: true }] },
          student2,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: true }] },
          student3,
        ),
      ).toBe(true);
    });

    it("should require boolean operand", () => {
      expect(() => apply({ $isEmpty: "invalid" }, null)).toThrow(
        "$isEmpty apply form requires boolean operand (true/false)",
      );
      expect(() => apply({ $isEmpty: null }, null)).toThrow(
        "$isEmpty apply form requires boolean operand (true/false)",
      );
      expect(() => apply({ $isEmpty: 42 }, "present")).toThrow(
        "$isEmpty apply form requires boolean operand (true/false)",
      );
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static emptiness checks for Nina's dietary restrictions", () => {
      expect(evaluate({ $isEmpty: null })).toBe(true);
      expect(evaluate({ $isEmpty: undefined })).toBe(true);
      expect(evaluate({ $isEmpty: 0 })).toBe(false);
      expect(evaluate({ $isEmpty: "" })).toBe(false);
      expect(evaluate({ $isEmpty: false })).toBe(false);
      expect(evaluate({ $isEmpty: [] })).toBe(false);
      expect(evaluate({ $isEmpty: {} })).toBe(false);
      expect(evaluate({ $isEmpty: "Nina" })).toBe(false);
    });

    it("should work with expressions for Chen's pickup person", () => {
      expect(
        evaluate({
          $isEmpty: {
            $get: { object: { pickupPerson: "dad" }, path: "pickupPerson" },
          },
        }),
      ).toBe(false);
      expect(
        evaluate({
          $isEmpty: { $get: { object: {}, path: "pickupPerson" } },
        }),
      ).toBe(true);
    });

    it("should validate empty fields for Aria's enrollment form", () => {
      const enrollment = {
        studentName: "Aria",
        parentEmail: "parent@example.com",
        emergencyContact: null,
        medicalInfo: "",
      };

      expect(
        evaluate({
          $isEmpty: { $get: { object: enrollment, path: "studentName" } },
        }),
      ).toBe(false);

      expect(
        evaluate({
          $isEmpty: {
            $get: { object: enrollment, path: "emergencyContact" },
          },
        }),
      ).toBe(true);

      expect(
        evaluate({
          $isEmpty: { $get: { object: enrollment, path: "medicalInfo" } },
        }),
      ).toBe(false); // Empty string is not null/undefined
    });
  });
});

describe("$exists", () => {
  describe("apply form", () => {
    it("should check if properties exist in student records", () => {
      const student = {
        name: "Zara",
        age: 4,
        allergies: null,
        parent: { name: "Amira", phone: "555-0199" },
      };

      expect(apply({ $exists: "name" }, student)).toBe(true);
      expect(apply({ $exists: "age" }, student)).toBe(true);
      expect(apply({ $exists: "allergies" }, student)).toBe(true); // exists but null
      expect(apply({ $exists: "missing" }, student)).toBe(false);
      expect(apply({ $exists: "parent.name" }, student)).toBe(true);
      expect(apply({ $exists: "parent.missing" }, student)).toBe(false);
    });

    it("should work with dynamic path resolution", () => {
      const student = { name: "Omar", skills: { reading: "good" } };

      expect(apply({ $exists: { $literal: "name" } }, student)).toBe(true);
      expect(apply({ $exists: { $literal: "skills.reading" } }, student)).toBe(
        true,
      );
      expect(apply({ $exists: { $literal: "skills.math" } }, student)).toBe(
        false,
      );
    });

    it("should throw error for non-string paths", () => {
      expect(() => apply({ $exists: 123 }, {})).toThrow(
        "$exists operand must resolve to a string path",
      );
    });
  });

  describe("evaluate form", () => {
    it("should check property existence in provided objects", () => {
      const student = { name: "Layla", activities: ["art", "music"] };

      expect(evaluate({ $exists: { object: student, path: "name" } })).toBe(
        true,
      );
      expect(
        evaluate({ $exists: { object: student, path: "activities" } }),
      ).toBe(true);
      expect(evaluate({ $exists: { object: student, path: "missing" } })).toBe(
        false,
      );
      expect(evaluate({ $exists: { object: {}, path: "anything" } })).toBe(
        false,
      );
    });

    it("should work with nested paths", () => {
      const daycare = {
        staff: { teacher: "Nour", assistant: null },
        rooms: { toddler: "Room A" },
      };

      expect(
        evaluate({ $exists: { object: daycare, path: "staff.teacher" } }),
      ).toBe(true);
      expect(
        evaluate({ $exists: { object: daycare, path: "staff.assistant" } }),
      ).toBe(true); // exists but null
      expect(
        evaluate({ $exists: { object: daycare, path: "staff.janitor" } }),
      ).toBe(false);
      expect(
        evaluate({ $exists: { object: daycare, path: "rooms.toddler" } }),
      ).toBe(true);
    });

    it("should require object and path properties", () => {
      expect(() => evaluate({ $exists: { object: {} } })).toThrow(
        "$exists evaluate form requires 'object' and 'path' properties",
      );
      expect(() => evaluate({ $exists: { path: "test" } })).toThrow(
        "$exists evaluate form requires 'object' and 'path' properties",
      );
      expect(() => evaluate({ $exists: "invalid" })).toThrow(
        "$exists evaluate form requires object operand: { object, path }",
      );
    });

    it("should require string paths", () => {
      expect(() => evaluate({ $exists: { object: {}, path: 123 } })).toThrow(
        "$exists path must be a string",
      );
    });
  });
});

describe("$isPresent", () => {
  // ... existing tests stay the same ...

  // NEW: Unary boolean operand tests (failing)
  describe("unary boolean operand", () => {
    it("should use true/false operands for positive/negative checks", () => {
      // Positive checks (value must be present)
      expect(apply({ $isPresent: true }, "Arun")).toBe(true);
      expect(apply({ $isPresent: true }, 0)).toBe(true);
      expect(apply({ $isPresent: true }, "")).toBe(true);
      expect(apply({ $isPresent: true }, null)).toBe(false);
      expect(apply({ $isPresent: true }, undefined)).toBe(false);

      // Negative checks (value must be absent)
      expect(apply({ $isPresent: false }, null)).toBe(true);
      expect(apply({ $isPresent: false }, undefined)).toBe(true);
      expect(apply({ $isPresent: false }, "present")).toBe(false);
      expect(apply({ $isPresent: false }, 0)).toBe(false);
    });

    it("should work with object properties", () => {
      const student1 = { name: "Maria", emergencyContact: "555-0123" };
      const student2 = { name: "Elena", emergencyContact: null };

      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: true }] },
          student1,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: true }] },
          student2,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isPresent: false }] },
          student2,
        ),
      ).toBe(true);
    });

    it("should work in evaluate form unchanged", () => {
      // Original evaluate form - unchanged, checks the operand directly
      expect(evaluate({ $isPresent: "Kenji" })).toBe(true);
      expect(evaluate({ $isPresent: null })).toBe(false);
      expect(evaluate({ $isPresent: undefined })).toBe(false);
      expect(evaluate({ $isPresent: 0 })).toBe(true);
      expect(evaluate({ $isPresent: "" })).toBe(true);
    });
  });
});

describe("$isEmpty", () => {
  // ... existing tests stay the same ...

  // NEW: Unary boolean operand tests (failing)
  describe("unary boolean operand", () => {
    it("should use true/false operands for positive/negative checks", () => {
      // Positive checks (value must be empty)
      expect(apply({ $isEmpty: true }, null)).toBe(true);
      expect(apply({ $isEmpty: true }, undefined)).toBe(true);
      expect(apply({ $isEmpty: true }, "Amara")).toBe(false);
      expect(apply({ $isEmpty: true }, 0)).toBe(false);

      // Negative checks (value must not be empty)
      expect(apply({ $isEmpty: false }, null)).toBe(false);
      expect(apply({ $isEmpty: false }, undefined)).toBe(false);
      expect(apply({ $isEmpty: false }, "present")).toBe(true);
      expect(apply({ $isEmpty: false }, 0)).toBe(true);
    });

    it("should work with object properties", () => {
      const student1 = { name: "Priya", vaccinations: ["MMR", "DTaP"] };
      const student2 = { name: "Sana", vaccinations: null };

      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: true }] },
          student2,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: true }] },
          student1,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isEmpty: false }] },
          student1,
        ),
      ).toBe(true);
    });

    it("should work in evaluate form unchanged", () => {
      // Original evaluate form - unchanged, checks the operand directly
      expect(evaluate({ $isEmpty: null })).toBe(true);
      expect(evaluate({ $isEmpty: undefined })).toBe(true);
      expect(evaluate({ $isEmpty: "Nina" })).toBe(false);
      expect(evaluate({ $isEmpty: 0 })).toBe(false);
      expect(evaluate({ $isEmpty: "" })).toBe(false);
    });
  });
});

describe("$and", () => {
  describe("apply form", () => {
    it("returns true when all conditions are true", () => {
      const expression = {
        $and: [{ $gte: 4 }, { $lte: 6 }],
      };

      expect(apply(expression, 5)).toBe(true);
    });

    it("returns false when any condition is false", () => {
      const expression = {
        $and: [{ $gte: 4 }, { $lte: 6 }],
      };

      expect(apply(expression, 3)).toBe(false);
      expect(apply(expression, 7)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static boolean arrays", () => {
      expect(evaluate({ $and: [true, true, true] })).toBe(true);
      expect(evaluate({ $and: [true, false, true] })).toBe(false);
      expect(evaluate({ $and: [false, false, false] })).toBe(false);
      expect(evaluate({ $and: [] })).toBe(true); // empty array
    });
  });
});

describe("$or", () => {
  describe("apply form", () => {
    it("returns true when any condition is true", () => {
      const expression = {
        $or: [{ $eq: "apple" }, { $eq: "banana" }],
      };

      expect(apply(expression, "apple")).toBe(true);
      expect(apply(expression, "banana")).toBe(true);
      expect(apply(expression, "cherry")).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static boolean arrays", () => {
      expect(evaluate({ $or: [false, false, true] })).toBe(true);
      expect(evaluate({ $or: [true, false, false] })).toBe(true);
      expect(evaluate({ $or: [false, false, false] })).toBe(false);
      expect(evaluate({ $or: [] })).toBe(false); // empty array
    });
  });
});

describe("$not", () => {
  describe("apply form", () => {
    it("returns opposite of the condition", () => {
      const expression = {
        $not: { $gt: 5 },
      };

      expect(apply(expression, 3)).toBe(true);
      expect(apply(expression, 7)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluate with boolean", () => {
      expect(evaluate({ $not: true })).toBe(false);
      expect(evaluate({ $not: false })).toBe(true);
    });

    it("evaluate with expression", () => {
      expect(evaluate({ $not: { $eq: [5, 5] } })).toBe(false);
      expect(evaluate({ $not: { $eq: [5, 10] } })).toBe(true);
    });
  });
});
