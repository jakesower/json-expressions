import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { object } from "../../src/packs/object.js";

const testEngine = createExpressionEngine({ packs: [object] });
const { apply, evaluate } = testEngine;

const children = [
  { name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
  { name: "Amira", age: 3, status: "inactive", scores: [78, 84, 91] },
  { name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
];

describe("$merge", () => {
  describe("apply form", () => {
    it("merges multiple objects", () => {
      const baseData = { name: "Chen", age: 5 };

      expect(
        apply(
          {
            $merge: [baseData, { status: "active", lastSeen: "today" }],
          },
          baseData,
        ),
      ).toEqual({
        name: "Chen",
        age: 5,
        status: "active",
        lastSeen: "today",
      });
    });

    it("later objects override earlier ones", () => {
      const baseData = { name: "Chen", age: 5, status: "inactive" };

      expect(
        apply(
          {
            $merge: [baseData, { status: "active", age: 6 }],
          },
          baseData,
        ),
      ).toEqual({
        name: "Chen",
        age: 6,
        status: "active",
      });
    });

    it("handles expressions in merge array", () => {
      const userData = {
        profile: { name: "Fatima" },
        meta: { created: "2024-01-01" },
      };

      expect(
        apply(
          {
            $merge: [
              { $get: "profile" },
              { $get: "meta" },
              { updated: "2024-01-02" },
            ],
          },
          userData,
        ),
      ).toEqual({
        name: "Fatima",
        created: "2024-01-01",
        updated: "2024-01-02",
      });
    });

    it("throws error for non-array operand", () => {
      expect(() => apply({ $merge: "not an array" }, {})).toThrow(
        "$merge operand must be an array of objects to merge",
      );
    });
  });

  describe("evaluate form", () => {
    it("merges objects in evaluate mode", () => {
      expect(
        evaluate({
          $merge: [{ name: "Kenji", age: 6 }, { status: "active" }, { age: 7 }],
        }),
      ).toEqual({
        name: "Kenji",
        age: 7,
        status: "active",
      });
    });
  });
});

describe("$pick", () => {
  describe("apply form", () => {
    it("picks specified properties", () => {
      expect(apply({ $pick: ["name", "age"] }, children[0])).toEqual({
        name: "Chen",
        age: 5,
      });
    });

    it("ignores missing properties", () => {
      expect(apply({ $pick: ["name", "missing", "age"] }, children[0])).toEqual(
        {
          name: "Chen",
          age: 5,
        },
      );
    });

    it("handles expressions in property list", () => {
      const propName = "name";
      expect(
        apply({ $pick: [{ $literal: propName }, "age"] }, children[0]),
      ).toEqual({
        name: "Chen",
        age: 5,
      });
    });

    it("throws error for non-array operand", () => {
      expect(() => apply({ $pick: "not an array" }, {})).toThrow(
        "$pick operand must be an array of property names",
      );
    });
  });

  describe("evaluate form", () => {
    it("picks properties from provided object", () => {
      const child = { name: "Zara", age: 4, status: "active", score: 88 };

      expect(
        evaluate({
          $pick: { object: child, properties: ["name", "score"] },
        }),
      ).toEqual({
        name: "Zara",
        score: 88,
      });
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $pick: "not an array" })).toThrow(
        "$pick evaluate form requires object operand: { object, properties }",
      );
    });
  });
});

describe("$omit", () => {
  describe("apply form", () => {
    it("omits specified properties", () => {
      expect(apply({ $omit: ["scores", "status"] }, children[0])).toEqual({
        name: "Chen",
        age: 5,
      });
    });

    it("returns original object if no properties to omit", () => {
      expect(apply({ $omit: ["missing"] }, children[0])).toEqual(children[0]);
    });

    it("handles expressions in property list", () => {
      expect(apply({ $omit: [{ $literal: "scores" }] }, children[0])).toEqual({
        name: "Chen",
        age: 5,
        status: "active",
      });
    });

    it("handles non-object input", () => {
      expect(() => apply({ $omit: ["name"] }, "not an object")).toThrow(
        "$omit must be applied to an object",
      );
    });

    it("throws error for non-array operand", () => {
      expect(() => apply({ $omit: "not an array" }, {})).toThrow(
        "$omit operand must be an array of property names",
      );
    });
  });

  describe("evaluate form", () => {
    it("omits properties from provided object", () => {
      const child = { name: "Omar", age: 4, status: "active", score: 85 };

      expect(
        evaluate({
          $omit: { object: child, properties: ["status", "score"] },
        }),
      ).toEqual({
        name: "Omar",
        age: 4,
      });
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $omit: "not an array" })).toThrow(
        "$omit evaluate form requires object operand: { object, properties }",
      );
    });
  });
});

describe("$keys", () => {
  describe("apply form", () => {
    it("gets object keys", () => {
      const result = apply({ $keys: null }, children[0]);
      expect(result.sort()).toEqual(["age", "name", "scores", "status"]);
    });

    it("throws error for non-object input", () => {
      expect(() => apply({ $keys: null }, "not an object")).toThrow(
        "$keys can only be applied to objects",
      );
    });
  });

  describe("evaluate form", () => {
    it("gets keys from provided object", () => {
      const data = { teacher: "Ms. Rodriguez", room: "B2", capacity: 20 };

      const result = evaluate({ $keys: data });
      expect(result.sort()).toEqual(["capacity", "room", "teacher"]);
    });

    it("throws error for non-object in evaluate form", () => {
      expect(() => evaluate({ $keys: "not an object" })).toThrow(
        "$keys can only be applied to objects",
      );
    });
  });
});

describe("$values", () => {
  describe("apply form", () => {
    it("gets object values", () => {
      const simpleObject = { name: "Chen", age: 5 };
      const result = apply({ $values: null }, simpleObject);
      expect(result).toEqual(["Chen", 5]);
    });

    it("throws error for non-object input", () => {
      expect(() => apply({ $values: null }, [])).toThrow(
        "$values can only be applied to objects",
      );
    });
  });

  describe("evaluate form", () => {
    it("gets values from provided object", () => {
      const data = { morning: "reading", afternoon: "art", evening: "play" };

      expect(evaluate({ $values: data })).toEqual(["reading", "art", "play"]);
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $values: "not an array" })).toThrow(
        "$values can only be applied to objects",
      );
    });
  });
});

describe("$pairs", () => {
  describe("apply form", () => {
    it("converts object to key-value pairs", () => {
      const simpleObject = { name: "Diego", age: 4 };
      const result = apply({ $pairs: null }, simpleObject);
      expect(result).toEqual([
        ["name", "Diego"],
        ["age", 4],
      ]);
    });

    it("throws error for non-object input", () => {
      expect(() => apply({ $pairs: null }, "not an object")).toThrow(
        "$pairs can only be applied to objects",
      );
    });
  });

  describe("evaluate form", () => {
    it("converts provided object to pairs", () => {
      const schedule = {
        "9:00": "circle time",
        "10:00": "snack",
        "11:00": "outdoor play",
      };

      expect(evaluate({ $pairs: schedule })).toEqual([
        ["9:00", "circle time"],
        ["10:00", "snack"],
        ["11:00", "outdoor play"],
      ]);
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $pairs: "not an array" })).toThrow(
        "$pairs can only be applied to objects",
      );
    });
  });
});

describe("$fromPairs", () => {
  describe("apply form", () => {
    it("converts pairs to object", () => {
      const pairs = [
        ["name", "Lila"],
        ["age", 3],
        ["group", "toddlers"],
      ];

      expect(apply({ $fromPairs: null }, pairs)).toEqual({
        name: "Lila",
        age: 3,
        group: "toddlers",
      });
    });

    it("throws error for non-array input", () => {
      expect(() => apply({ $fromPairs: null }, "not an array")).toThrow(
        "$fromPairs can only be applied to arrays of [key, value] pairs",
      );
    });

    it("throws error for invalid pair format", () => {
      expect(() =>
        apply({ $fromPairs: null }, [["key"], ["incomplete"]]),
      ).toThrow("$fromPairs requires array of [key, value] pairs");
    });
  });

  describe("evaluate form", () => {
    it("converts pairs to object in evaluate mode", () => {
      const pairs = [
        ["activity", { $get: { object: { key: "painting" }, path: "key" } }],
        ["duration", "30 min"],
        ["materials", "watercolors"],
      ];

      expect(evaluate({ $fromPairs: pairs })).toEqual({
        activity: "painting",
        duration: "30 min",
        materials: "watercolors",
      });
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $fromPairs: "not an array" })).toThrow(
        "$fromPairs can only be applied to arrays of [key, value] pairs",
      );
    });
  });
});

describe("Integration with other expressions", () => {
  it("works with pipe for complex object transformations", () => {
    const userData = {
      profile: { name: "Sofia", age: 4 },
      preferences: { snack: "apple", activity: "blocks" },
      metadata: { created: "2024-01-01", lastActive: "2024-01-05" },
    };

    const result = apply(
      {
        $pipe: [
          { $merge: [{ $get: "profile" }, { $get: "preferences" }] },
          { $omit: ["snack"] },
        ],
      },
      userData,
    );

    expect(result).toEqual({
      name: "Sofia",
      age: 4,
      activity: "blocks",
    });
  });

  it("roundtrip: object to pairs and back", () => {
    const original = { classroom: "Rainbow", teacher: "Ms. Chen", count: 15 };

    const result = apply(
      {
        $pipe: [{ $pairs: null }, { $fromPairs: null }],
      },
      original,
    );

    expect(result).toEqual(original);
  });
});
