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
const { apply } = testEngine;

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
      });
    });
  });

  describe("$eq", () => {
    describe("deep equality", () => {
      it("handles deep equality", () => {
        const expression = {
          $eq: { $literal: [3, { chicken: "butt" }] },
        };
        expect(apply(expression, [3, { chicken: "butt" }])).toBe(true);
      });

      it("equates null and undefined", () => {
        const child = { name: "Zoë", petName: null };

        expect(apply({ $eq: [undefined, null] }, {})).toEqual(true);
        expect(apply({ $eq: null }, child.age)).toEqual(true);
        expect(
          apply({ $eq: [{ $get: "petName" }, { $get: "age" }] }, {}),
        ).toEqual(true);
      });
    });
  });

  describe("$ne", () => {
    describe("deep inequality", () => {
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
  describe("basic functionality", () => {
    it("implements the $in expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $in: [4, 6] }] };

      expect(apply(exp, kids.ximena)).toBe(true);
      expect(apply(exp, kids.yousef)).toBe(false);
      expect(apply(exp, kids.zoë)).toBe(true);
    });
  });
});

describe("$nin", () => {
  describe("basic functionality", () => {
    it("implements the $nin expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $nin: [4, 6] }] };

      expect(apply(exp, kids.ximena)).toBe(false);
      expect(apply(exp, kids.yousef)).toBe(true);
      expect(apply(exp, kids.zoë)).toBe(false);
    });
  });
});

describe("$matchesRegex", () => {
  describe("basic functionality", () => {
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
  describe("basic functionality", () => {
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
});

describe("$isPresent", () => {
  describe("basic functionality", () => {
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
        "$isPresent requires boolean operand (true/false)",
      );
      expect(() => apply({ $isPresent: null }, null)).toThrow(
        "$isPresent requires boolean operand (true/false)",
      );
      expect(() => apply({ $isPresent: { complex: "object" } }, null)).toThrow(
        "$isPresent requires boolean operand (true/false)",
      );
    });
  });
});

describe("$isEmpty", () => {
  describe("basic functionality", () => {
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
        "$isEmpty requires boolean operand (true/false)",
      );
      expect(() => apply({ $isEmpty: null }, null)).toThrow(
        "$isEmpty requires boolean operand (true/false)",
      );
      expect(() => apply({ $isEmpty: 42 }, "present")).toThrow(
        "$isEmpty requires boolean operand (true/false)",
      );
    });
  });
});

describe("$exists", () => {
  describe("basic functionality", () => {
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
        "$exists operand must resolve to an array or string path",
      );
    });
  });
});

describe("$isPresent", () => {
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
  });
});

describe("$isEmpty", () => {
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
  });
});

describe("$and", () => {
  describe("basic functionality", () => {
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
});

describe("$or", () => {
  describe("basic functionality", () => {
    it("returns true when any condition is true", () => {
      const expression = {
        $or: [{ $eq: "apple" }, { $eq: "banana" }],
      };

      expect(apply(expression, "apple")).toBe(true);
      expect(apply(expression, "banana")).toBe(true);
      expect(apply(expression, "cherry")).toBe(false);
    });
  });
});

describe("$not", () => {
  describe("basic functionality", () => {
    it("returns opposite of the condition", () => {
      const expression = {
        $not: { $gt: 5 },
      };

      expect(apply(expression, 3)).toBe(true);
      expect(apply(expression, 7)).toBe(false);
    });
  });
});

describe("$matchesAny", () => {
  describe("basic functionality", () => {
    it("returns true when any single property matches", () => {
      expect(
        apply({ $matchesAny: { name: "Kenji" } }, { name: "Kenji", age: 4 }),
      ).toBe(true);

      expect(
        apply({ $matchesAny: { name: "Kenji" } }, { name: "Amara", age: 4 }),
      ).toBe(false);
    });

    it("returns true when at least one property matches", () => {
      expect(
        apply(
          { $matchesAny: { name: "Amara", age: 5 } },
          { name: "Amara", age: 3, room: "rainbow" },
        ),
      ).toBe(true); // name matches

      expect(
        apply(
          { $matchesAny: { name: "Kenji", age: 3 } },
          { name: "Amara", age: 3, room: "rainbow" },
        ),
      ).toBe(true); // age matches

      expect(
        apply(
          { $matchesAny: { name: "Kenji", age: 5 } },
          { name: "Amara", age: 3, room: "rainbow" },
        ),
      ).toBe(false); // neither matches
    });

    it("handles nested property paths", () => {
      expect(
        apply(
          {
            $matchesAny: {
              "guardian.name": "Fatima",
              "guardian.phone": "555-9999",
            },
          },
          {
            name: "Zara",
            guardian: {
              name: "Fatima",
              phone: "555-0123",
            },
          },
        ),
      ).toBe(true); // name matches even though phone doesn't

      expect(
        apply(
          {
            $matchesAny: {
              "guardian.name": "Unknown",
              "guardian.phone": "555-9999",
            },
          },
          {
            name: "Zara",
            guardian: { name: "Fatima", phone: "555-0123" },
          },
        ),
      ).toBe(false); // neither matches
    });

    it("matches with expression conditions", () => {
      expect(
        apply(
          { $matchesAny: { age: { $gt: 5 }, room: "sunshine" } },
          { name: "Ravi", age: 4, room: "sunshine" },
        ),
      ).toBe(true); // room matches even though age doesn't

      expect(
        apply(
          { $matchesAny: { age: { $gt: 5 }, room: "tulip" } },
          { name: "Ravi", age: 4, room: "sunshine" },
        ),
      ).toBe(false); // neither matches
    });

    it("handles $literal wrapped conditions", () => {
      expect(
        apply(
          { $matchesAny: { status: { $literal: { $active: true } }, age: 10 } },
          { name: "Chen", status: { $active: true }, age: 4 },
        ),
      ).toBe(true); // status matches

      expect(
        apply(
          { $matchesAny: { status: { $literal: { $active: true } }, age: 10 } },
          { name: "Chen", status: { $active: false }, age: 4 },
        ),
      ).toBe(false); // neither matches
    });

    it("handles null and undefined values", () => {
      expect(
        apply(
          { $matchesAny: { notes: null, name: "Unknown" } },
          { name: "Yuki", notes: null },
        ),
      ).toBe(true); // notes matches

      expect(
        apply(
          { $matchesAny: { notes: null, name: "Unknown" } },
          { name: "Yuki", notes: "has allergy note" },
        ),
      ).toBe(false); // neither matches
    });

    it("handles empty object conditions", () => {
      expect(apply({ $matchesAny: {} }, { name: "Ahmed", age: 5 })).toBe(false);
    });

    it("returns false when no property matches", () => {
      expect(
        apply(
          { $matchesAny: { nonExistent: "value", age: 10 } },
          { name: "Sakura", age: 3 },
        ),
      ).toBe(false);
    });

    it("throws error with invalid operand types", () => {
      expect(() => apply({ $matchesAny: null }, {})).toThrow(
        "$matchesAny operand must be an object with property conditions",
      );

      expect(() => apply({ $matchesAny: "not object" }, {})).toThrow(
        "$matchesAny operand must be an object with property conditions",
      );

      expect(() => apply({ $matchesAny: [] }, {})).toThrow(
        "$matchesAny operand must be an object with property conditions",
      );
    });

    it("handles complex boolean expressions as conditions", () => {
      expect(
        apply(
          {
            $matchesAny: {
              age: { $and: [{ $gte: 3 }, { $lt: 6 }] },
              room: "tulip",
            },
          },
          {
            name: "Luna",
            age: 4,
            room: "rose",
            guardian: { name: "Sofia", available: true },
          },
        ),
      ).toBe(true); // age condition matches even though room doesn't

      expect(
        apply(
          {
            $matchesAny: {
              age: { $or: [{ $lt: 2 }, { $gt: 6 }] },
              room: "tulip",
            },
          },
          { name: "Luna", age: 4, room: "rose" },
        ),
      ).toBe(false); // neither matches
    });
  });

  describe("edge cases and error handling", () => {
    it("handles empty conditions object", () => {
      expect(apply({ $matchesAny: {} }, { name: "Taj", age: 3 })).toBe(false);
    });

    it("handles non-existent nested paths", () => {
      expect(
        apply(
          { $matchesAny: { "non.existent.path": "value", age: 10 } },
          { name: "Robin", age: 3 },
        ),
      ).toBe(false);
    });

    it("handles undefined vs null equality", () => {
      expect(
        apply(
          { $matchesAny: { optionalField: undefined, name: "Unknown" } },
          { name: "Zoe" }, // optionalField is undefined (missing)
        ),
      ).toBe(true); // optionalField matches

      expect(
        apply(
          { $matchesAny: { optionalField: null, name: "Unknown" } },
          { name: "Zoe", optionalField: null },
        ),
      ).toBe(true); // optionalField matches
    });

    it("handles type mismatches correctly", () => {
      expect(
        apply(
          { $matchesAny: { age: "4", name: "Maya" } }, // age is string
          { name: "Maya", age: 4 }, // age is number
        ),
      ).toBe(true); // name matches even though age doesn't
    });

    it("preserves order independence", () => {
      const childData = { name: "Alex", age: 5, room: "sunflower" };

      expect(apply({ $matchesAny: { age: 10, name: "Alex" } }, childData)).toBe(
        true,
      ); // name matches

      expect(
        apply({ $matchesAny: { name: "Unknown", age: 5 } }, childData),
      ).toBe(true); // age matches
    });
  });
});

describe("$matches", () => {
  describe("basic functionality", () => {
    it("matches single property with literal value", () => {
      expect(
        apply({ $matches: { name: "Kenji" } }, { name: "Kenji", age: 4 }),
      ).toBe(true);

      expect(
        apply({ $matches: { name: "Kenji" } }, { name: "Amara", age: 4 }),
      ).toBe(false);
    });

    it("matches multiple properties", () => {
      expect(
        apply(
          { $matches: { name: "Amara", age: 3 } },
          { name: "Amara", age: 3, room: "rainbow" },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { name: "Amara", age: 4 } },
          { name: "Amara", age: 3, room: "rainbow" },
        ),
      ).toBe(false);
    });

    it("handles nested property paths", () => {
      expect(
        apply(
          {
            $matches: {
              "guardian.name": "Fatima",
              "guardian.phone": "555-0123",
            },
          },
          {
            name: "Zara",
            guardian: {
              name: "Fatima",
              phone: "555-0123",
              email: "fatima@example.com",
            },
          },
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $matches: {
              "guardian.name": "Fatima",
              "guardian.phone": "555-9999",
            },
          },
          {
            name: "Zara",
            guardian: { name: "Fatima", phone: "555-0123" },
          },
        ),
      ).toBe(false);
    });

    it("matches with expression conditions", () => {
      expect(
        apply(
          { $matches: { age: { $gt: 3 }, room: "sunshine" } },
          { name: "Ravi", age: 4, room: "sunshine" },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { age: { $gt: 5 }, room: "sunshine" } },
          { name: "Ravi", age: 4, room: "sunshine" },
        ),
      ).toBe(false);
    });

    it("handles $literal wrapped conditions", () => {
      expect(
        apply(
          { $matches: { status: { $literal: { $active: true } } } },
          { name: "Chen", status: { $active: true } },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { status: { $literal: { $active: true } } } },
          { name: "Chen", status: { $active: false } },
        ),
      ).toBe(false);
    });

    it("matches complex nested objects", () => {
      const childData = {
        name: "Priya",
        schedule: {
          monday: ["art", "outdoor play"],
          tuesday: ["story time", "music"],
        },
        allergies: ["peanuts", "dairy"],
      };

      expect(
        apply(
          {
            $matches: {
              "schedule.monday": ["art", "outdoor play"],
              allergies: ["peanuts", "dairy"],
            },
          },
          childData,
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $matches: {
              "schedule.monday": ["art", "outdoor play"],
              allergies: ["peanuts"], // different array
            },
          },
          childData,
        ),
      ).toBe(false);
    });

    it("handles null and undefined values", () => {
      expect(
        apply(
          { $matches: { notes: null, emergencyContact: undefined } },
          { name: "Yuki", notes: null, emergencyContact: undefined },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { notes: null } },
          { name: "Yuki", notes: "has allergy note" },
        ),
      ).toBe(false);
    });

    it("handles empty object conditions", () => {
      expect(apply({ $matches: {} }, { name: "Ahmed", age: 5 })).toBe(true);
    });

    it("returns false when property doesn't exist", () => {
      expect(
        apply(
          { $matches: { nonExistent: "value" } },
          { name: "Sakura", age: 3 },
        ),
      ).toBe(false);
    });

    it("handles array property paths", () => {
      expect(
        apply(
          { $matches: { "meals.0": "apple", "meals.1": "crackers" } },
          { name: "Diego", meals: ["apple", "crackers", "juice"] },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { "meals.0": "banana" } },
          { name: "Diego", meals: ["apple", "crackers", "juice"] },
        ),
      ).toBe(false);
    });

    it("throws error with invalid operand types", () => {
      expect(() => apply({ $matches: null }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );

      expect(() => apply({ $matches: "not object" }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );

      expect(() => apply({ $matches: [] }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );
    });

    it("handles complex boolean expressions as conditions", () => {
      expect(
        apply(
          {
            $matches: {
              age: { $and: [{ $gte: 3 }, { $lt: 6 }] },
              "guardian.available": true,
            },
          },
          {
            name: "Luna",
            age: 4,
            guardian: { name: "Sofia", available: true },
          },
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $matches: {
              age: { $or: [{ $lt: 2 }, { $gt: 6 }] },
              room: "tulip",
            },
          },
          { name: "Luna", age: 4, room: "tulip" },
        ),
      ).toBe(false);
    });

    it("handles deep equality correctly", () => {
      const complexChild = {
        name: "Omar",
        profile: {
          dietary: {
            restrictions: ["vegetarian"],
            preferences: { breakfast: "oatmeal", snack: "fruit" },
          },
        },
      };

      expect(
        apply(
          {
            $matches: {
              "profile.dietary.restrictions": ["vegetarian"],
              "profile.dietary.preferences.breakfast": "oatmeal",
            },
          },
          complexChild,
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $matches: {
              "profile.dietary.restrictions": ["vegan"], // different value
            },
          },
          complexChild,
        ),
      ).toBe(false);
    });
  });

  describe("edge cases and error handling", () => {
    it("handles empty conditions object", () => {
      expect(apply({ $matches: {} }, { name: "Taj", age: 3 })).toBe(true);
    });

    it("handles non-existent nested paths", () => {
      expect(
        apply(
          { $matches: { "non.existent.path": "value" } },
          { name: "Robin", existing: "data" },
        ),
      ).toBe(false);
    });

    it("handles circular object references gracefully", () => {
      const circularData = { name: "Javi" };
      circularData.self = circularData;

      expect(apply({ $matches: { name: "Javi" } }, circularData)).toBe(true);
    });

    it("handles undefined vs null equality", () => {
      expect(
        apply(
          { $matches: { optionalField: undefined } },
          { name: "Zoe" }, // optionalField is undefined (missing)
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { optionalField: null } },
          { name: "Zoe", optionalField: null },
        ),
      ).toBe(true);

      expect(
        apply(
          { $matches: { optionalField: null } },
          { name: "Zoe" }, // optionalField is undefined, not null
        ),
      ).toBe(true);
    });

    it("handles type mismatches correctly", () => {
      expect(
        apply(
          { $matches: { age: "4" } }, // string
          { name: "Maya", age: 4 }, // number
        ),
      ).toBe(false);

      expect(
        apply(
          { $matches: { available: 1 } }, // number
          { name: "teacher", available: true }, // boolean
        ),
      ).toBe(false);
    });

    it("preserves order independence", () => {
      const childData = { name: "Alex", age: 5, room: "sunflower" };

      expect(apply({ $matches: { age: 5, name: "Alex" } }, childData)).toBe(
        true,
      );

      expect(apply({ $matches: { name: "Alex", age: 5 } }, childData)).toBe(
        true,
      );
    });

    it("handles empty object matching behavior", () => {
      expect(apply({ $matches: {} }, { name: "Lily", age: 4 })).toBe(true);
    });
  });
});

describe("predicate expressions - edge cases", () => {
  describe("$and edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $and: [] }, {})).toBe(true);
    });

    it("handles single element arrays", () => {
      expect(apply({ $and: [true] }, {})).toBe(true);
      expect(apply({ $and: [false] }, {})).toBe(false);
    });

    it("handles complex nested expressions", () => {
      const data = { user: { age: 25, active: true, role: "admin" } };
      expect(
        apply(
          {
            $and: [
              { $gte: [{ $get: "user.age" }, 18] },
              { $get: "user.active" },
              { $eq: [{ $get: "user.role" }, "admin"] },
            ],
          },
          data,
        ),
      ).toBe(true);
    });

    it("short-circuits on first false value", () => {
      expect(
        apply(
          {
            $and: [
              false,
              { $get: "nonexistent.path" }, // Would error if evaluated
            ],
          },
          {},
        ),
      ).toBe(false);
    });
  });

  describe("$or edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $or: [] }, {})).toBe(false);
    });

    it("handles single element arrays", () => {
      expect(apply({ $or: [true] }, {})).toBe(true);
      expect(apply({ $or: [false] }, {})).toBe(false);
    });

    it("handles complex nested expressions", () => {
      const data = { user: { age: 16, role: "guest", verified: false } };
      expect(
        apply(
          {
            $or: [
              { $gte: [{ $get: "user.age" }, 18] },
              { $eq: [{ $get: "user.role" }, "admin"] },
              { $get: "user.verified" },
            ],
          },
          data,
        ),
      ).toBe(false);
    });

    it("short-circuits on first true value", () => {
      expect(
        apply(
          {
            $or: [
              true,
              { $get: "nonexistent.path" }, // Would error if evaluated
            ],
          },
          {},
        ),
      ).toBe(true);
    });
  });

  describe("$not edge cases", () => {
    it("handles truthy and falsy values", () => {
      expect(apply({ $not: true }, {})).toBe(false);
      expect(apply({ $not: false }, {})).toBe(true);
      expect(apply({ $not: 0 }, {})).toBe(true);
      expect(apply({ $not: "" }, {})).toBe(true);
      expect(apply({ $not: null }, {})).toBe(true);
      expect(apply({ $not: undefined }, {})).toBe(true);
    });

    it("handles complex expressions", () => {
      expect(apply({ $not: { $eq: [1, 2] } }, {})).toBe(true);
      expect(apply({ $not: { $eq: [1, 1] } }, {})).toBe(false);
    });
  });

  describe("comparison expressions edge cases", () => {
    it("handles array form with exactly 2 elements", () => {
      expect(apply({ $eq: [1, 1] }, {})).toBe(true);
      expect(apply({ $gt: [5, 3] }, {})).toBe(true);
      expect(apply({ $lt: [2, 8] }, {})).toBe(true);
    });

    it("throws error for array form with wrong number of elements", () => {
      expect(() => apply({ $eq: [1] }, {})).toThrow(
        "Comparitive expressions in array form require exactly 2 elements",
      );
      expect(() => apply({ $eq: [1, 2, 3] }, {})).toThrow(
        "Comparitive expressions in array form require exactly 2 elements",
      );
    });

    it("handles wrapped literal comparisons", () => {
      expect(apply({ $eq: { $literal: 5 } }, 5)).toBe(true);
      expect(apply({ $eq: { $literal: "test" } }, "test")).toBe(true);
      expect(apply({ $gt: { $literal: 10 } }, 5)).toBe(false);
    });

    it("handles complex object comparisons", () => {
      const obj1 = { name: "Aria", scores: [85, 90] };
      const obj2 = { name: "Aria", scores: [85, 90] };
      const obj3 = { name: "Chen", scores: [85, 90] };

      expect(apply({ $eq: obj1 }, obj2)).toBe(true);
      expect(apply({ $eq: obj1 }, obj3)).toBe(false);
      expect(apply({ $ne: obj1 }, obj3)).toBe(true);
    });

    it("handles null and undefined comparisons", () => {
      expect(apply({ $eq: null }, null)).toBe(true);
      expect(apply({ $eq: null }, undefined)).toBe(true);
      expect(apply({ $eq: undefined }, undefined)).toBe(true);
      expect(apply({ $ne: null }, undefined)).toBe(false);
    });

    it("handles special number comparisons", () => {
      expect(apply({ $eq: 0 }, -0)).toBe(true);
      expect(apply({ $eq: Infinity }, Infinity)).toBe(true);
      expect(apply({ $gt: Infinity }, 1000000)).toBe(false);
    });
  });

  describe("$between edge cases", () => {
    it("handles inclusive range checks", () => {
      expect(apply({ $between: { min: 1, max: 10 } }, 1)).toBe(true);
      expect(apply({ $between: { min: 1, max: 10 } }, 10)).toBe(true);
      expect(apply({ $between: { min: 1, max: 10 } }, 5)).toBe(true);
      expect(apply({ $between: { min: 1, max: 10 } }, 0)).toBe(false);
      expect(apply({ $between: { min: 1, max: 10 } }, 11)).toBe(false);
    });

    it("handles edge case ranges", () => {
      expect(apply({ $between: { min: 5, max: 5 } }, 5)).toBe(true);
      expect(apply({ $between: { min: 5, max: 5 } }, 4)).toBe(false);
      expect(apply({ $between: { min: -10, max: -5 } }, -7)).toBe(true);
    });

    it("handles decimal numbers", () => {
      expect(apply({ $between: { min: 1.5, max: 2.5 } }, 2.0)).toBe(true);
      expect(apply({ $between: { min: 1.5, max: 2.5 } }, 1.5)).toBe(true);
      expect(apply({ $between: { min: 1.5, max: 2.5 } }, 2.5)).toBe(true);
    });

    it("handles complex expressions in range", () => {
      const data = { score: 85, passing: 60, excellent: 90 };
      expect(
        apply(
          {
            $between: {
              min: { $get: "passing" },
              max: { $get: "excellent" },
            },
          },
          data,
        ),
      ).toBe(false); // $between expects score as inputData, not as field in data
    });
  });

  describe("$in/$nin edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $in: [] }, "test")).toBe(false);
      expect(apply({ $nin: [] }, "test")).toBe(true);
    });

    it("handles arrays with null and undefined", () => {
      expect(apply({ $in: [null, undefined, "test"] }, null)).toBe(true);
      expect(apply({ $in: [null, undefined, "test"] }, undefined)).toBe(true);
      expect(apply({ $nin: [null, undefined] }, "test")).toBe(true);
    });

    it("handles arrays with mixed types", () => {
      expect(apply({ $in: [1, "1", true] }, 1)).toBe(true);
      expect(apply({ $in: [1, "1", true] }, "1")).toBe(true);
      expect(apply({ $in: [1, "1", true] }, true)).toBe(true);
      expect(apply({ $in: [1, "1", true] }, false)).toBe(false);
    });

    it("handles object and array inclusion", () => {
      const obj = { name: "test" };
      const arr = [1, 2, 3];
      expect(apply({ $in: [obj, arr] }, obj)).toBe(false);
      expect(apply({ $in: [obj, arr] }, arr)).toBe(false);
      expect(apply({ $in: [obj, arr] }, { name: "test" })).toBe(false); // Different reference
    });

    it("throws error when operand is not an array", () => {
      expect(() => apply({ $in: "not array" }, "test")).toThrow(
        "$in parameter must be an array",
      );
      expect(() => apply({ $nin: { not: "array" } }, "test")).toThrow(
        "$nin parameter must be an array",
      );
    });
  });

  describe("$exists edge cases", () => {
    it("handles simple property existence", () => {
      expect(apply({ $exists: "name" }, { name: "Aria", age: 25 })).toBe(true);
      expect(apply({ $exists: "missing" }, { name: "Aria", age: 25 })).toBe(
        false,
      );
    });

    it("handles nested property paths", () => {
      const data = { user: { profile: { email: "test@example.com" } } };
      expect(apply({ $exists: "user.profile.email" }, data)).toBe(true);
      expect(apply({ $exists: "user.profile.phone" }, data)).toBe(false);
      expect(apply({ $exists: "user.settings.theme" }, data)).toBe(false);
    });

    it("handles array index access", () => {
      const data = { scores: [85, 90, 88] };
      expect(apply({ $exists: "scores.0" }, data)).toBe(true);
      expect(apply({ $exists: "scores.2" }, data)).toBe(true);
      expect(apply({ $exists: "scores.5" }, data)).toBe(false);
    });

    it("distinguishes undefined from null", () => {
      expect(apply({ $exists: "value" }, { value: null })).toBe(true);
      expect(apply({ $exists: "value" }, { value: undefined })).toBe(false); // undefined values don't exist
      expect(apply({ $exists: "missing" }, {})).toBe(false);
    });

    it("handles dynamic path resolution", () => {
      const data = { field: "name", name: "Chen", age: 30 };
      expect(apply({ $exists: { $get: "field" } }, data)).toBe(true);
    });

    it("throws error for non-string paths", () => {
      expect(() => apply({ $exists: 123 }, {})).toThrow(
        "$exists operand must resolve to an array or string path",
      );
      expect(() => apply({ $exists: null }, {})).toThrow(
        "$exists operand must resolve to an array or string path",
      );
    });
  });

  describe("$isEmpty/$isPresent edge cases", () => {
    it("handles null and undefined correctly", () => {
      expect(apply({ $isEmpty: true }, null)).toBe(true);
      expect(apply({ $isEmpty: true }, undefined)).toBe(true);
      expect(apply({ $isEmpty: false }, null)).toBe(false);
      expect(apply({ $isEmpty: false }, undefined)).toBe(false);

      expect(apply({ $isPresent: true }, null)).toBe(false);
      expect(apply({ $isPresent: true }, undefined)).toBe(false);
      expect(apply({ $isPresent: false }, null)).toBe(true);
      expect(apply({ $isPresent: false }, undefined)).toBe(true);
    });

    it("handles falsy values that are not null/undefined", () => {
      expect(apply({ $isEmpty: true }, 0)).toBe(false);
      expect(apply({ $isEmpty: true }, false)).toBe(false);
      expect(apply({ $isEmpty: true }, "")).toBe(false);
      expect(apply({ $isEmpty: true }, [])).toBe(false);

      expect(apply({ $isPresent: true }, 0)).toBe(true);
      expect(apply({ $isPresent: true }, false)).toBe(true);
      expect(apply({ $isPresent: true }, "")).toBe(true);
      expect(apply({ $isPresent: true }, [])).toBe(true);
    });

    it("handles truthy values", () => {
      expect(apply({ $isEmpty: true }, "test")).toBe(false);
      expect(apply({ $isEmpty: false }, "test")).toBe(true);
      expect(apply({ $isPresent: true }, "test")).toBe(true);
      expect(apply({ $isPresent: false }, "test")).toBe(false);
    });

    it("throws error for non-boolean operands", () => {
      expect(() => apply({ $isEmpty: "string" }, null)).toThrow(
        "$isEmpty requires boolean operand (true/false)",
      );
      expect(() => apply({ $isPresent: 123 }, null)).toThrow(
        "$isPresent requires boolean operand (true/false)",
      );
    });
  });

  describe("$matches edge cases", () => {
    it("handles empty condition objects", () => {
      expect(apply({ $matches: {} }, { name: "test", age: 25 })).toBe(true);
    });

    it("handles null and undefined value matches", () => {
      expect(
        apply(
          { $matches: { optional: null } },
          { name: "test", optional: null },
        ),
      ).toBe(true);
      expect(apply({ $matches: { optional: null } }, { name: "test" })).toBe(
        true,
      );
    });

    it("handles nested property matching", () => {
      const data = { user: { profile: { name: "Aria", age: 25 } } };
      expect(apply({ $matches: { "user.profile.name": "Aria" } }, data)).toBe(
        true,
      );
      expect(apply({ $matches: { "user.profile.age": 30 } }, data)).toBe(false);
    });

    it("handles wrapped literal conditions", () => {
      expect(
        apply(
          { $matches: { test: { $literal: { complex: "object" } } } },
          { test: { complex: "object" } },
        ),
      ).toBe(true);
    });

    it("handles expression-based conditions", () => {
      const data = { score: 85, threshold: 80 };
      expect(
        apply(
          {
            $matches: {
              score: { $gte: 80 },
            },
          },
          data,
        ),
      ).toBe(true);
    });

    it("handles complex mixed conditions", () => {
      const data = {
        user: { name: "Chen", age: 28, active: true },
        config: { minAge: 18 },
      };
      expect(
        apply(
          {
            $matches: {
              "user.name": "Chen",
              "user.age": { $gte: 18 },
              "user.active": true,
            },
          },
          data,
        ),
      ).toBe(true);
    });

    it("throws error for invalid operand types", () => {
      expect(() => apply({ $matches: "string" }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );
      expect(() => apply({ $matches: [] }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );
      expect(() => apply({ $matches: null }, {})).toThrow(
        "$matches operand must be an object with property conditions",
      );
    });
  });

  describe("$matchesRegex edge cases", () => {
    it("handles basic pattern matching", () => {
      expect(apply({ $matchesRegex: "^test" }, "testing")).toBe(true);
      expect(apply({ $matchesRegex: "^test" }, "not testing")).toBe(false);
      expect(apply({ $matchesRegex: "\\d+" }, "abc123def")).toBe(true);
    });

    it("handles inline flags", () => {
      expect(apply({ $matchesRegex: "(?i)TEST" }, "test")).toBe(true);
      expect(apply({ $matchesRegex: "(?i)TEST" }, "TEST")).toBe(true);
      expect(apply({ $matchesRegex: "(?m)^line" }, "first\nline")).toBe(true);
      expect(apply({ $matchesRegex: "(?s)a.b" }, "a\nb")).toBe(true);
    });

    it("handles multiple inline flags", () => {
      expect(apply({ $matchesRegex: "(?im)^TEST" }, "test")).toBe(true);
      expect(apply({ $matchesRegex: "(?ims)test.end" }, "TEST\nEND")).toBe(
        true,
      );
    });

    it("handles unsupported inline flags gracefully", () => {
      expect(apply({ $matchesRegex: "(?x)test" }, "test")).toBe(true);
      expect(apply({ $matchesRegex: "(?u)test" }, "test")).toBe(true);
    });

    it("handles complex regex patterns", () => {
      expect(
        apply(
          {
            $matchesRegex: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
          "test@example.com",
        ),
      ).toBe(true);
      expect(
        apply(
          {
            $matchesRegex: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
          "invalid-email",
        ),
      ).toBe(false);
    });

    it("handles special regex characters", () => {
      expect(apply({ $matchesRegex: "\\$\\{.*\\}" }, "${variable}")).toBe(true);
      expect(apply({ $matchesRegex: "\\[\\d+\\]" }, "[123]")).toBe(true);
      expect(apply({ $matchesRegex: "a\\.b" }, "a.b")).toBe(true);
    });

    it("throws error for non-string input", () => {
      expect(() => apply({ $matchesRegex: "test" }, 123)).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "test" }, null)).toThrow(
        "$matchesRegex requires string input",
      );
      expect(() => apply({ $matchesRegex: "test" }, undefined)).toThrow(
        "$matchesRegex requires string input",
      );
    });

    it("handles edge case patterns", () => {
      expect(apply({ $matchesRegex: "" }, "anything")).toBe(true); // Empty pattern matches everything
      expect(apply({ $matchesRegex: ".*" }, "")).toBe(true); // Match everything including empty
      expect(apply({ $matchesRegex: "^$" }, "")).toBe(true); // Match only empty string
      expect(apply({ $matchesRegex: "^$" }, "nonempty")).toBe(false);
    });
  });

  describe("error handling and validation", () => {
    it("handles malformed operands gracefully", () => {
      expect(() => apply({ $eq: {} }, 5)).not.toThrow();
      expect(() => apply({ $and: "not array" }, {})).toThrow();
    });

    it("provides helpful error messages", () => {
      expect(() => apply({ $in: "not array" }, 5)).toThrow(
        "$in parameter must be an array",
      );
    });

    it("validates operand types appropriately", () => {
      expect(() => apply({ $isEmpty: "not boolean" }, null)).toThrow(
        "$isEmpty requires boolean operand (true/false)",
      );
      expect(() => apply({ $exists: 123 }, {})).toThrow(
        "$exists operand must resolve to an array or string path",
      );
    });
  });

  describe("integration and compatibility", () => {
    it("works well with other expressions in complex scenarios", () => {
      const data = {
        users: [
          { name: "Aria", age: 25, active: true, role: "admin" },
          { name: "Chen", age: 17, active: false, role: "user" },
          { name: "Zara", age: 30, active: true, role: "user" },
        ],
      };

      expect(
        apply(
          {
            $and: [
              { $gte: [{ $get: "age" }, 18] },
              { $get: "active" },
              {
                $or: [
                  { $eq: [{ $get: "role" }, "admin"] },
                  { $eq: [{ $get: "role" }, "moderator"] },
                ],
              },
            ],
          },
          data.users[0],
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $and: [
              { $gte: [{ $get: "age" }, 18] },
              { $get: "active" },
              {
                $or: [
                  { $eq: [{ $get: "role" }, "admin"] },
                  { $eq: [{ $get: "role" }, "moderator"] },
                ],
              },
            ],
          },
          data.users[2],
        ),
      ).toBe(false); // Active and adult but not admin/moderator
    });

    it("maintains consistent behavior for operations", () => {
      const applyResult = apply({ $and: [{ $gt: 5 }, { $lt: 10 }] }, 7);

      expect(applyResult).toBe(true);
    });

    it("handles complex nested predicate compositions", () => {
      const userData = {
        profile: { age: 28, verified: true },
        preferences: { theme: "dark", notifications: true },
        permissions: ["read", "write"],
      };

      expect(
        apply(
          {
            $and: [
              { $gte: [{ $get: "profile.age" }, 18] },
              { $get: "profile.verified" },
              {
                $or: [
                  { $eq: [{ $get: "preferences.theme" }, "dark"] },
                  { $eq: [{ $get: "preferences.theme" }, "light"] },
                ],
              },
              { $get: "preferences.notifications" },
            ],
          },
          userData,
        ),
      ).toBe(true);
    });
  });
});
