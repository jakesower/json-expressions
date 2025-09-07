import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const kids = {
  ximena: { name: "Ximena", age: 4 },
  yousef: { name: "Yousef", age: 5 },
  zoë: { name: "Zoë", age: 6 },
};

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$eq", () => {
  describe("apply form", () => {
    it("is determined deeply", async () => {
      const expression = {
        $eq: [3, { chicken: "butt" }],
      };
      expect(apply(expression, [3, { chicken: "butt" }])).toBe(true);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $eq: [5, 5] })).toBe(true);
      expect(evaluate({ $eq: [5, 10] })).toBe(false);
      expect(evaluate({ $eq: [{ a: 1 }, { a: 1 }] })).toBe(true);
    });
  });
});

describe("$gt", () => {
  describe("apply form", () => {
    it("implements the $gt expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $gt: 5 }] };

      expect(apply(exp, kids.ximena)).toBe(false);
      expect(apply(exp, kids.yousef)).toBe(false);
      expect(apply(exp, kids.zoë)).toBe(true);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $gt: [10, 5] })).toBe(true);
      expect(evaluate({ $gt: [5, 10] })).toBe(false);
      expect(evaluate({ $gt: [5, 5] })).toBe(false);
    });
  });
});

describe("$gte", () => {
  describe("apply form", () => {
    it("implements the $gte expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $gte: 5 }] };

      expect(apply(exp, kids.ximena)).toBe(false);
      expect(apply(exp, kids.yousef)).toBe(true);
      expect(apply(exp, kids.zoë)).toBe(true);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $gte: [10, 5] })).toBe(true);
      expect(evaluate({ $gte: [5, 5] })).toBe(true);
      expect(evaluate({ $gte: [5, 10] })).toBe(false);
    });
  });
});

describe("$lt", () => {
  describe("apply form", () => {
    it("implements the $lt expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $lt: 5 }] };

      expect(apply(exp, kids.ximena)).toBe(true);
      expect(apply(exp, kids.yousef)).toBe(false);
      expect(apply(exp, kids.zoë)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $lt: [5, 10] })).toBe(true);
      expect(evaluate({ $lt: [10, 5] })).toBe(false);
      expect(evaluate({ $lt: [5, 5] })).toBe(false);
    });
  });
});

describe("$lte", () => {
  describe("apply form", () => {
    it("implements the $lte expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $lte: 5 }] };

      expect(apply(exp, kids.ximena)).toBe(true);
      expect(apply(exp, kids.yousef)).toBe(true);
      expect(apply(exp, kids.zoë)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $lte: [5, 10] })).toBe(true);
      expect(evaluate({ $lte: [5, 5] })).toBe(true);
      expect(evaluate({ $lte: [10, 5] })).toBe(false);
    });
  });
});

describe("$ne", () => {
  describe("apply form", () => {
    it("implements the $ne expression", () => {
      const exp = { $pipe: [{ $get: "age" }, { $ne: 5 }] };

      expect(apply(exp, kids.ximena)).toBe(true);
      expect(apply(exp, kids.yousef)).toBe(false);
      expect(apply(exp, kids.zoë)).toBe(true);
    });
  });

  describe("evaluate form", () => {
    it("evaluates static comparisons", () => {
      expect(evaluate({ $ne: [5, 10] })).toBe(true);
      expect(evaluate({ $ne: [5, 5] })).toBe(false);
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
      expect(evaluate({ $in: [[1, 2, 3], 2] })).toBe(true);
      expect(evaluate({ $in: [[1, 2, 3], 5] })).toBe(false);
    });

    it("throws error for non-array parameter in evaluate", () => {
      expect(() => evaluate({ $in: ["not-array", 2] })).toThrow(
        "$in parameter must be an array",
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
      expect(evaluate({ $nin: [[1, 2, 3], 5] })).toBe(true);
      expect(evaluate({ $nin: [[1, 2, 3], 2] })).toBe(false);
    });

    it("throws error for non-array operand in evaluate", () => {
      expect(() => apply({ $nin: 2 })).toThrow();
    });

    it("throws error for non-array parameter in evaluate", () => {
      expect(() => evaluate({ $nin: ["not-array", 2] })).toThrow(
        "$nin parameter must be an array",
      );
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
      expect(evaluate({ $matchesRegex: ["hello", "hello world"] })).toBe(true);
      expect(evaluate({ $matchesRegex: ["hello", "goodbye world"] })).toBe(
        false,
      );
    });

    it("should work with flags in evaluate form", () => {
      expect(evaluate({ $matchesRegex: ["(?i)hello", "HELLO WORLD"] })).toBe(
        true,
      );
      expect(evaluate({ $matchesRegex: ["(?m)^line2", "line1\nline2"] })).toBe(
        true,
      );
    });

    it("should throw with invalid input in evaluate form", () => {
      expect(() => evaluate({ $matchesRegex: ["pattern", 123] })).toThrow(
        "$matchesRegex requires string input",
      );
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

describe("$matchesLike", () => {
  it("handles basic LIKE patterns", () => {
    expect(apply({ $matchesLike: "hello%" }, "hello world")).toBe(true);
    expect(apply({ $matchesLike: "hello%" }, "hello")).toBe(true);
    expect(apply({ $matchesLike: "hello%" }, "hi")).toBe(false);

    expect(apply({ $matchesLike: "%world" }, "hello world")).toBe(true);
    expect(apply({ $matchesLike: "%world" }, "world")).toBe(true);
    expect(apply({ $matchesLike: "%world" }, "hi")).toBe(false);

    expect(apply({ $matchesLike: "h_llo" }, "hello")).toBe(true);
    expect(apply({ $matchesLike: "h_llo" }, "hallo")).toBe(true);
    expect(apply({ $matchesLike: "h_llo" }, "hxllo")).toBe(true);
    expect(apply({ $matchesLike: "h_llo" }, "hllo")).toBe(false);
    expect(apply({ $matchesLike: "h_llo" }, "hello world")).toBe(false);
  });

  it("handles email patterns", () => {
    expect(apply({ $matchesLike: "%@gmail.com" }, "test@gmail.com")).toBe(true);
    expect(apply({ $matchesLike: "%@gmail.com" }, "user123@gmail.com")).toBe(
      true,
    );
    expect(apply({ $matchesLike: "%@gmail.com" }, "test@yahoo.com")).toBe(
      false,
    );
  });

  it("escapes regex special characters", () => {
    expect(apply({ $matchesLike: "test.txt" }, "test.txt")).toBe(true);
    expect(apply({ $matchesLike: "test.txt" }, "testXtxt")).toBe(false); // . should be literal
    expect(apply({ $matchesLike: "a+b" }, "a+b")).toBe(true);
    expect(apply({ $matchesLike: "a+b" }, "aab")).toBe(false); // + should be literal
  });
});

describe("$matchesGlob", () => {
  it("handles basic GLOB patterns", () => {
    expect(apply({ $matchesGlob: "hello*" }, "hello world")).toBe(true);
    expect(apply({ $matchesGlob: "hello*" }, "hello")).toBe(true);
    expect(apply({ $matchesGlob: "hello*" }, "hi")).toBe(false);

    expect(apply({ $matchesGlob: "*world" }, "hello world")).toBe(true);
    expect(apply({ $matchesGlob: "*world" }, "world")).toBe(true);
    expect(apply({ $matchesGlob: "*world" }, "hi")).toBe(false);

    expect(apply({ $matchesGlob: "h?llo" }, "hello")).toBe(true);
    expect(apply({ $matchesGlob: "h?llo" }, "hallo")).toBe(true);
    expect(apply({ $matchesGlob: "h?llo" }, "hxllo")).toBe(true);
    expect(apply({ $matchesGlob: "h?llo" }, "hllo")).toBe(false);
    expect(apply({ $matchesGlob: "h?llo" }, "hello world")).toBe(false);
  });

  it("handles character classes", () => {
    expect(apply({ $matchesGlob: "[hw]ello" }, "hello")).toBe(true);
    expect(apply({ $matchesGlob: "[hw]ello" }, "wello")).toBe(true);
    expect(apply({ $matchesGlob: "[hw]ello" }, "bello")).toBe(false);

    expect(apply({ $matchesGlob: "[A-Z]*" }, "Hello")).toBe(true);
    expect(apply({ $matchesGlob: "[A-Z]*" }, "hello")).toBe(false);

    expect(apply({ $matchesGlob: "[!hw]ello" }, "bello")).toBe(true);
    expect(apply({ $matchesGlob: "[!hw]ello" }, "hello")).toBe(false);
    expect(apply({ $matchesGlob: "[!hw]ello" }, "wello")).toBe(false);
  });

  it("handles file extensions", () => {
    expect(apply({ $matchesGlob: "*.txt" }, "file.txt")).toBe(true);
    expect(apply({ $matchesGlob: "*.txt" }, "document.txt")).toBe(true);
    expect(apply({ $matchesGlob: "*.txt" }, "file.pdf")).toBe(false);

    expect(
      apply({ $matchesGlob: "IMG_[0-9][0-9][0-9][0-9]" }, "IMG_1234"),
    ).toBe(true);
    expect(
      apply({ $matchesGlob: "IMG_[0-9][0-9][0-9][0-9]" }, "IMG_abcd"),
    ).toBe(false);
  });

  it("escapes regex special characters", () => {
    expect(apply({ $matchesGlob: "test.txt" }, "test.txt")).toBe(true);
    expect(apply({ $matchesGlob: "test.txt" }, "testXtxt")).toBe(false); // . should be literal
    expect(apply({ $matchesGlob: "a+b" }, "a+b")).toBe(true);
    expect(apply({ $matchesGlob: "a+b" }, "aab")).toBe(false); // + should be literal
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

describe("$isNull", () => {
  describe("apply form", () => {
    it("should detect null values in Arun's medical records", () => {
      expect(apply({ $isNull: null }, null)).toBe(true);
      expect(apply({ $isNull: null }, undefined)).toBe(true); // null == undefined
      expect(apply({ $isNull: null }, 0)).toBe(false);
      expect(apply({ $isNull: null }, "")).toBe(false);
      expect(apply({ $isNull: null }, false)).toBe(false);
      expect(apply({ $isNull: null }, [])).toBe(false);
      expect(apply({ $isNull: null }, {})).toBe(false);
    });

    it("should work with object properties for Maria's emergency contact", () => {
      const student1 = { name: "Maria", emergencyContact: null };
      const student2 = { name: "Elena", emergencyContact: "mom@example.com" };
      const student3 = { name: "Yuki" }; // emergencyContact is undefined

      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isNull: null }] },
          student1,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isNull: null }] },
          student2,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "emergencyContact" }, { $isNull: null }] },
          student3,
        ),
      ).toBe(true);
    });

    it("should ignore operand and work with any input", () => {
      expect(apply({ $isNull: "ignored" }, null)).toBe(true);
      expect(apply({ $isNull: 42 }, undefined)).toBe(true);
      expect(apply({ $isNull: { complex: "object" } }, "not null")).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static null checks for Kenji's allergy information", () => {
      expect(evaluate({ $isNull: null })).toBe(true);
      expect(evaluate({ $isNull: undefined })).toBe(true);
      expect(evaluate({ $isNull: 0 })).toBe(false);
      expect(evaluate({ $isNull: "" })).toBe(false);
      expect(evaluate({ $isNull: false })).toBe(false);
      expect(evaluate({ $isNull: [] })).toBe(false);
      expect(evaluate({ $isNull: {} })).toBe(false);
    });

    it("should work with expressions that return null for Diego's attendance", () => {
      expect(
        evaluate({ $isNull: { $get: { object: {}, path: "missing" } } }),
      ).toBe(true);
      expect(
        evaluate({
          $isNull: { $get: { object: { name: "Diego" }, path: "name" } },
        }),
      ).toBe(false);
    });

    it("should handle complex nested structures", () => {
      expect(
        evaluate({
          $isNull: {
            $get: {
              object: { students: [{ name: "Fatima" }] },
              path: "teachers.primary",
            },
          },
        }),
      ).toBe(true);
    });
  });
});

describe("$isNotNull", () => {
  describe("apply form", () => {
    it("should detect non-null values in Amara's progress tracking", () => {
      expect(apply({ $isNotNull: null }, null)).toBe(false);
      expect(apply({ $isNotNull: null }, undefined)).toBe(false); // null == undefined
      expect(apply({ $isNotNull: null }, 0)).toBe(true);
      expect(apply({ $isNotNull: null }, "")).toBe(true);
      expect(apply({ $isNotNull: null }, false)).toBe(true);
      expect(apply({ $isNotNull: null }, [])).toBe(true);
      expect(apply({ $isNotNull: null }, {})).toBe(true);
      expect(apply({ $isNotNull: null }, "Amara")).toBe(true);
    });

    it("should work with object properties for Priya's vaccination records", () => {
      const student1 = { name: "Priya", vaccinations: ["MMR", "DTaP"] };
      const student2 = { name: "Sana", vaccinations: null };
      const student3 = { name: "Rajesh" }; // vaccinations is undefined

      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isNotNull: null }] },
          student1,
        ),
      ).toBe(true);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isNotNull: null }] },
          student2,
        ),
      ).toBe(false);
      expect(
        apply(
          { $pipe: [{ $get: "vaccinations" }, { $isNotNull: null }] },
          student3,
        ),
      ).toBe(false);
    });

    it("should ignore operand and work with any input", () => {
      expect(apply({ $isNotNull: "ignored" }, "present")).toBe(true);
      expect(apply({ $isNotNull: 42 }, 0)).toBe(true);
      expect(apply({ $isNotNull: { complex: "object" } }, null)).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static non-null checks for Nina's dietary restrictions", () => {
      expect(evaluate({ $isNotNull: null })).toBe(false);
      expect(evaluate({ $isNotNull: undefined })).toBe(false);
      expect(evaluate({ $isNotNull: 0 })).toBe(true);
      expect(evaluate({ $isNotNull: "" })).toBe(true);
      expect(evaluate({ $isNotNull: false })).toBe(true);
      expect(evaluate({ $isNotNull: [] })).toBe(true);
      expect(evaluate({ $isNotNull: {} })).toBe(true);
      expect(evaluate({ $isNotNull: "gluten-free" })).toBe(true);
    });

    it("should work with expressions that may return null for Chen's pickup person", () => {
      expect(
        evaluate({
          $isNotNull: {
            $get: { object: { pickupPerson: "dad" }, path: "pickupPerson" },
          },
        }),
      ).toBe(true);
      expect(
        evaluate({
          $isNotNull: { $get: { object: {}, path: "pickupPerson" } },
        }),
      ).toBe(false);
    });

    it("should validate required fields for Aria's enrollment form", () => {
      const enrollment = {
        studentName: "Aria",
        parentEmail: "parent@example.com",
        emergencyContact: null,
        medicalInfo: "",
      };

      expect(
        evaluate({
          $isNotNull: { $get: { object: enrollment, path: "studentName" } },
        }),
      ).toBe(true);

      expect(
        evaluate({
          $isNotNull: {
            $get: { object: enrollment, path: "emergencyContact" },
          },
        }),
      ).toBe(false);

      expect(
        evaluate({
          $isNotNull: { $get: { object: enrollment, path: "medicalInfo" } },
        }),
      ).toBe(true); // Empty string is not null
    });
  });
});
