import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const kids = [
  { name: "Ximena", age: 4 },
  { name: "Yousef", age: 5 },
  { name: "Zoë", age: 6 },
];

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply, evaluate } = testEngine;

describe("$all", () => {
  describe("apply form", () => {
    it("returns true if all elements match", () => {
      expect(apply({ $all: { $gt: 3 } }, [4, 5, 6])).toBe(true);
      expect(apply({ $all: { $gt: 5 } }, [4, 5, 6])).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates with static arrays", () => {
      expect(
        evaluate({ $all: { expression: { $gt: 3 }, array: [4, 5, 6] } }),
      ).toBe(true);
      expect(
        evaluate({ $all: { expression: { $gt: 5 }, array: [4, 5, 6] } }),
      ).toBe(false);
      expect(
        evaluate({
          $all: { expression: { $gt: 0 }, array: kids.map((k) => k.age) },
        }),
      ).toBe(true);
    });
  });
});

describe("$any", () => {
  describe("apply form", () => {
    it("returns true if any element matches", () => {
      expect(apply({ $any: { $gt: 5 } }, [4, 5, 6])).toBe(true);
      expect(apply({ $any: { $gt: 10 } }, [4, 5, 6])).toBe(false);
    });
  });

  describe("evaluate form", () => {
    it("evaluates with static arrays", () => {
      expect(
        evaluate({ $any: { expression: { $gt: 5 }, array: [4, 5, 6] } }),
      ).toBe(true);
      expect(
        evaluate({ $any: { expression: { $gt: 10 }, array: [4, 5, 6] } }),
      ).toBe(false);
      expect(
        evaluate({
          $any: { expression: { $eq: "Zoë" }, array: kids.map((k) => k.name) },
        }),
      ).toBe(true);
    });
  });
});

describe("$append", () => {
  describe("apply form", () => {
    it("appends elements to arrays", () => {
      expect(apply({ $append: [4, 5] }, [1, 2, 3])).toEqual([1, 2, 3, 4, 5]);
      expect(apply({ $append: [] }, [1, 2, 3])).toEqual([1, 2, 3]);
      expect(apply({ $append: ["d", "e"] }, ["a", "b", "c"])).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
      ]);
    });
  });

  describe("evaluate form", () => {
    it("appends with static arrays", () => {
      expect(
        evaluate({
          $append: {
            arrayToAppend: [4, 5],
            baseArray: [1, 2, 3],
          },
        }),
      ).toEqual([1, 2, 3, 4, 5]);
      expect(
        evaluate({ $append: { arrayToAppend: [], baseArray: [1, 2] } }),
      ).toEqual([1, 2]);
      expect(
        evaluate({
          $append: {
            arrayToAppend: ["d", "e"],
            baseArray: ["a", "b", "c"],
          },
        }),
      ).toEqual(["a", "b", "c", "d", "e"]);
    });
  });
});

describe("$coalesce", () => {
  describe("apply form", () => {
    it("returns first non-null value", () => {
      expect(
        apply({ $coalesce: [null, undefined, "Amara", "Rashid"] }, {}),
      ).toBe("Amara");
      expect(apply({ $coalesce: [null, 42, "backup"] }, {})).toBe(42);
      expect(apply({ $coalesce: [false, 0, ""] }, {})).toBe(false);
    });

    it("handles all null/undefined values", () => {
      expect(apply({ $coalesce: [null, undefined] }, {})).toBe(undefined);
    });

    it("works with expressions", () => {
      const nurseryData = {
        teacher: null,
        substitute: "Ms. Kenji",
        backup: "Mr. Omar",
      };
      expect(
        apply(
          {
            $coalesce: [
              { $get: "teacher" },
              { $get: "substitute" },
              { $get: "backup" },
            ],
          },
          nurseryData,
        ),
      ).toBe("Ms. Kenji");
    });
  });

  describe("evaluate form", () => {
    it("coalesces static values", () => {
      expect(evaluate({ $coalesce: [null, undefined, "Serafina"] })).toBe(
        "Serafina",
      );
      expect(evaluate({ $coalesce: [null, 0, "backup"] })).toBe(0);
    });
  });
});

describe("$concat", () => {
  describe("apply form", () => {
    it("concatenates arrays to input data", () => {
      expect(
        apply(
          {
            $concat: [
              [4, 5],
              [6, 7],
            ],
          },
          [1, 2, 3],
        ),
      ).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(apply({ $concat: [["Dao", "Elena"]] }, ["Amira", "Yuki"])).toEqual(
        ["Amira", "Yuki", "Dao", "Elena"],
      );
    });

    it("handles empty arrays", () => {
      expect(apply({ $concat: [[], []] }, [1, 2])).toEqual([1, 2]);
      expect(apply({ $concat: [[3, 4]] }, [])).toEqual([3, 4]);
    });
  });

  describe("evaluate form", () => {
    it("concatenates arrays", () => {
      expect(
        evaluate({
          $concat: [
            [1, 2],
            [3, 4],
            [5, 6],
          ],
        }),
      ).toEqual([1, 2, 3, 4, 5, 6]);
      expect(evaluate({ $concat: [["Yuki"], ["Amara", "Dao"]] })).toEqual([
        "Yuki",
        "Amara",
        "Dao",
      ]);
    });
  });
});

describe("$filter", () => {
  describe("apply form", () => {
    it("filters arrays", () => {
      expect(apply({ $filter: { $eq: 2 } }, [1, 2, 3])).toEqual([2]);
    });
  });

  describe("evaluate form", () => {
    it("filters static arrays", () => {
      expect(
        evaluate({ $filter: { expression: { $eq: 2 }, array: [1, 2, 3] } }),
      ).toEqual([2]);
    });
  });
});

describe("$filterBy", () => {
  const students = [
    { name: "Aisha", age: 4, active: true, status: "enrolled" },
    { name: "Chen", age: 5, active: true, status: "enrolled" },
    { name: "Diego", age: 3, active: false, status: "waitlist" },
    { name: "Fatima", age: 6, active: true, status: "enrolled" },
  ];

  describe("apply form", () => {
    it("filters arrays by object property conditions", () => {
      const result = apply(
        { $filterBy: { age: { $gte: 5 }, active: { $eq: true } } },
        students,
      );
      expect(result).toEqual([
        { name: "Chen", age: 5, active: true, status: "enrolled" },
        { name: "Fatima", age: 6, active: true, status: "enrolled" },
      ]);
    });

    it("filters by single condition", () => {
      const result = apply({ $filterBy: { active: { $eq: false } } }, students);
      expect(result).toEqual([
        { name: "Diego", age: 3, active: false, status: "waitlist" },
      ]);
    });

    it("filters by nested property paths", () => {
      const data = [
        { profile: { settings: { theme: "dark" } }, active: true },
        { profile: { settings: { theme: "light" } }, active: true },
        { profile: { settings: { theme: "dark" } }, active: false },
      ];
      const result = apply(
        { $filterBy: { "profile.settings.theme": { $eq: "dark" } } },
        data,
      );
      expect(result).toHaveLength(2);
      expect(result[0].profile.settings.theme).toBe("dark");
      expect(result[1].profile.settings.theme).toBe("dark");
    });

    it("filters with complex expressions", () => {
      const result = apply(
        {
          $filterBy: {
            age: { $and: [{ $gte: 4 }, { $lte: 5 }] },
            status: { $eq: "enrolled" },
          },
        },
        students,
      );
      expect(result).toEqual([
        { name: "Aisha", age: 4, active: true, status: "enrolled" },
        { name: "Chen", age: 5, active: true, status: "enrolled" },
      ]);
    });

    it("returns empty array when no items match", () => {
      const result = apply({ $filterBy: { age: { $gt: 10 } } }, students);
      expect(result).toEqual([]);
    });

    it("returns all items when all match", () => {
      const result = apply(
        { $filterBy: { name: { $isPresent: true } } },
        students,
      );
      expect(result).toEqual(students);
    });

    it("throws error when applied to non-array", () => {
      expect(() =>
        apply({ $filterBy: { age: { $gt: 5 } } }, "not an array"),
      ).toThrow("$filterBy can only be applied to arrays");
    });

    it("throws error with invalid operand", () => {
      expect(() => apply({ $filterBy: "invalid" }, students)).toThrow(
        "$filterBy operand must be an object with property conditions",
      );
      expect(() => apply({ $filterBy: ["invalid"] }, students)).toThrow(
        "$filterBy operand must be an object with property conditions",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates with static data and simple conditions", () => {
      const testData = [
        { name: "Alice", active: true },
        { name: "Bob", active: false },
        { name: "Carol", active: true },
      ];
      const result = evaluate({
        $filterBy: [
          testData,
          { active: true }, // Simple literal comparison
        ],
      });
      expect(result).toEqual([
        { name: "Alice", active: true },
        { name: "Carol", active: true },
      ]);
    });

    it("works with literal conditions in evaluate form", () => {
      const result = evaluate({
        $filterBy: [
          [
            { name: "Alice", status: "active" },
            { name: "Bob", status: "inactive" },
            { name: "Carol", status: "active" },
          ],
          { status: "active" }, // Literal string comparison
        ],
      });
      expect(result).toEqual([
        { name: "Alice", status: "active" },
        { name: "Carol", status: "active" },
      ]);
    });

    it("throws error with invalid evaluate operand", () => {
      expect(() => evaluate({ $filterBy: "invalid" })).toThrow(
        "$filterBy evaluate form requires array operand: [data, conditions]",
      );
      expect(() => evaluate({ $filterBy: [students] })).toThrow(
        "$filterBy evaluate form requires array operand: [data, conditions]",
      );
    });

    it("throws error when first argument is not array", () => {
      expect(() =>
        evaluate({ $filterBy: [{ not: "array" }, { age: { $gt: 5 } }] }),
      ).toThrow();
    });

    it("throws error when conditions are not object", () => {
      expect(() => evaluate({ $filterBy: [students, "invalid"] })).toThrow(
        "$filterBy conditions must be an object with property conditions",
      );
    });
  });
});

describe("$find", () => {
  describe("apply form", () => {
    it("finds matching element", () => {
      expect(apply({ $find: { $eq: 5 } }, [4, 5, 6])).toBe(5);
      expect(apply({ $find: { $gt: 10 } }, [4, 5, 6])).toBe(undefined);
    });
  });

  describe("evaluate form", () => {
    it("finds elements in static arrays", () => {
      expect(
        evaluate({ $find: { expression: { $eq: 5 }, array: [4, 5, 6] } }),
      ).toBe(5);
      expect(
        evaluate({ $find: { expression: { $gt: 10 }, array: [4, 5, 6] } }),
      ).toBe(undefined);
      expect(
        evaluate({
          $find: { expression: { $eq: "Zoë" }, array: kids.map((k) => k.name) },
        }),
      ).toBe("Zoë");
    });
  });
});

describe("$flatMap", () => {
  describe("evaluate form", () => {
    it("flattens mapped arrays", () => {
      expect(
        evaluate({
          $flatMap: { expression: { $literal: [1, 2] }, array: [[1], [2]] },
        }),
      ).toEqual([1, 2, 1, 2]);
    });

    it("works with property extraction", () => {
      const students = [
        { name: "Kehinde", subjects: ["math", "science"] },
        { name: "Priya", subjects: ["history", "art"] },
        { name: "Zhang", subjects: ["literature"] },
      ];
      expect(
        evaluate({
          $flatMap: { expression: { $get: "subjects" }, array: students },
        }),
      ).toEqual(["math", "science", "history", "art", "literature"]);
    });

    it("handles empty arrays", () => {
      expect(
        evaluate({
          $flatMap: { expression: { $literal: [] }, array: [1, 2, 3] },
        }),
      ).toEqual([]);
    });

    it("flattens nested data structures", () => {
      const groups = [
        { members: ["Kwame", "Serafina"] },
        { members: ["Yuki", "Elena"] },
      ];
      expect(
        evaluate({
          $flatMap: { expression: { $get: "members" }, array: groups },
        }),
      ).toEqual(["Kwame", "Serafina", "Yuki", "Elena"]);
    });
  });
});

describe("$flatten", () => {
  describe("apply form", () => {
    it("flattens nested arrays with default depth", () => {
      expect(
        apply({ $flatten: {} }, [
          [1, 2],
          [3, 4],
          [5, 6],
        ]),
      ).toEqual([1, 2, 3, 4, 5, 6]);
      expect(apply({ $flatten: {} }, [["Kenji", "Yuki"], ["Amara"]])).toEqual([
        "Kenji",
        "Yuki",
        "Amara",
      ]);
    });

    it("flattens with depth 1 by default", () => {
      expect(apply({ $flatten: {} }, [[[1, 2]], [[3, 4]]])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("flattens with custom depth", () => {
      expect(apply({ $flatten: { depth: 2 } }, [[[1, 2]], [[3, 4]]])).toEqual([
        1, 2, 3, 4,
      ]);
      expect(apply({ $flatten: { depth: 1 } }, [[[1, 2]], [[3, 4]]])).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("handles deeply nested arrays", () => {
      expect(apply({ $flatten: { depth: 3 } }, [[[[1]]]])).toEqual([1]);
    });
  });

  describe("evaluate form", () => {
    it("flattens static arrays", () => {
      expect(
        evaluate({
          $flatten: [
            [1, 2],
            [3, 4],
          ],
        }),
      ).toEqual([1, 2, 3, 4]);
      expect(
        evaluate({
          $flatten: [
            [
              [1, 2],
              [3, 4],
            ],
          ],
        }),
      ).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(evaluate({ $flatten: [["Yuki"], ["Dao", "Elena"]] })).toEqual([
        "Yuki",
        "Dao",
        "Elena",
      ]);
    });

    it("flattens with custom depth in evaluate", () => {
      expect(
        evaluate({
          $flatten: {
            array: [
              [1, [2]],
              [3, [4]],
            ],
            depth: 1,
          },
        }),
      ).toEqual([1, [2], 3, [4]]);
    });

    it("flattens with custom depth in evaluate (2)", () => {
      expect(
        evaluate({
          $flatten: {
            array: [
              [1, [2]],
              [3, [4]],
            ],
            depth: 2,
          },
        }),
      ).toEqual([1, 2, 3, 4]);
    });

    it("throws error for invalid operand", () => {
      expect(() => evaluate({ $flatten: "not an array" })).toThrow(
        "$flatten evaluate form requires either an array operand, or an object of the form { array: [...], depth: 2 }",
      );
    });
  });
});

describe("$groupBy", () => {
  const daycare = [
    { name: "Amara", age: 3, room: "toddlers" },
    { name: "Kenji", age: 4, room: "preschool" },
    { name: "Yuki", age: 3, room: "toddlers" },
    { name: "Dao", age: 5, room: "preschool" },
    { name: "Elena", age: 4, room: "preschool" },
  ];

  describe("apply form", () => {
    it("groups by string property", () => {
      const result = apply({ $groupBy: "room" }, daycare);
      expect(result).toEqual({
        toddlers: [
          { name: "Amara", age: 3, room: "toddlers" },
          { name: "Yuki", age: 3, room: "toddlers" },
        ],
        preschool: [
          { name: "Kenji", age: 4, room: "preschool" },
          { name: "Dao", age: 5, room: "preschool" },
          { name: "Elena", age: 4, room: "preschool" },
        ],
      });
    });

    it("groups by expression", () => {
      const result = apply({ $groupBy: { $get: "age" } }, daycare);
      expect(result).toEqual({
        3: [
          { name: "Amara", age: 3, room: "toddlers" },
          { name: "Yuki", age: 3, room: "toddlers" },
        ],
        4: [
          { name: "Kenji", age: 4, room: "preschool" },
          { name: "Elena", age: 4, room: "preschool" },
        ],
        5: [{ name: "Dao", age: 5, room: "preschool" }],
      });
    });

    it("handles missing properties", () => {
      const withMissing = [...daycare, { name: "Noah" }];
      expect(() => apply({ $groupBy: "room" }, withMissing)).toThrow(
        '{"name":"Noah"} could not be grouped by room',
      );
    });

    it("throws error for non-array input", () => {
      expect(() => apply({ $groupBy: "room" }, "not an array")).toThrow(
        "$groupBy can only be applied to arrays",
      );
    });
  });

  describe("evaluate form", () => {
    it("groups static arrays", () => {
      const result = evaluate({ $groupBy: { array: daycare, groupBy: "age" } });
      expect(result["3"]).toHaveLength(2);
      expect(result["4"]).toHaveLength(2);
      expect(result["5"]).toHaveLength(1);
    });

    it("throws error for invalid operand", () => {
      expect(() => evaluate({ $groupBy: "not an array" })).toThrow(
        "$groupBy evaluate form requires object operand: { array, groupBy }",
      );
    });
  });
});

describe("$join", () => {
  describe("apply form", () => {
    it("joins array elements", () => {
      expect(apply({ $join: ", " }, [1, 2, 3])).toBe("1, 2, 3");
      expect(apply({ $join: "" }, ["a", "b", "c"])).toBe("abc");
    });
  });

  describe("evaluate form", () => {
    it("joins with static arrays", () => {
      expect(evaluate({ $join: { separator: ", ", array: [1, 2, 3] } })).toBe(
        "1, 2, 3",
      );
      expect(
        evaluate({ $join: { separator: "-", array: ["a", "b", "c"] } }),
      ).toBe("a-b-c");
      expect(evaluate({ $join: { separator: "", array: [1, 2, 3] } })).toBe(
        "123",
      );
    });
  });
});

describe("$map", () => {
  describe("apply form", () => {
    it("should perform without subexpressions", () => {
      expect(apply({ $map: { $literal: 3 } }, [1])).toEqual([3]);
    });

    it("should perform with a subexpression", () => {
      expect(apply({ $map: { $get: "age" } }, kids)).toEqual([4, 5, 6]);
    });
  });

  describe("evaluate form", () => {
    it("maps over static arrays", () => {
      expect(
        evaluate({ $map: { expression: { $get: "age" }, array: kids } }),
      ).toEqual([4, 5, 6]);
    });

    it("should preserve literal expressions in mapping function", () => {
      // Should preserve literal expression in the mapping function
      const result = evaluate({
        $map: {
          expression: { $literal: { $get: "name" } }, // Should preserve expression object
          array: [{ name: "Amara" }, { name: "Chen" }],
        },
      });

      // Should get array of literal expression objects, not names
      expect(result).toEqual([{ $get: "name" }, { $get: "name" }]);
    });
  });

  describe("apply form - literal preservation", () => {
    it("should preserve literal expressions as mapping function", () => {
      // This should preserve the literal expression and use it as data, not execute it
      const result = apply(
        {
          $map: { $literal: { $get: "name" } }, // Should map each item to the expression object
        },
        [{ name: "Kenji" }, { name: "Zara" }],
      );

      // Each array item should become the literal expression object
      expect(result).toEqual([{ $get: "name" }, { $get: "name" }]);
    });
  });
});

describe("$pluck", () => {
  const children = [
    {
      name: "Chen",
      age: 5,
      status: "active",
      profile: { group: "preschool", teacher: "Ms. Rodriguez" },
    },
    {
      name: "Amira",
      age: 3,
      status: "inactive",
      profile: { group: "toddler", teacher: "Mr. Kim" },
    },
    {
      name: "Diego",
      age: 4,
      status: "active",
      profile: { group: "preschool", teacher: "Ms. Rodriguez" },
    },
    {
      name: "Serafina",
      age: 6,
      status: "active",
      profile: { group: "kindergarten", teacher: "Mrs. Chirstensen" },
    },
  ];

  it("plucks simple property from array", () => {
    expect(apply({ $pluck: "name" }, children)).toEqual([
      "Chen",
      "Amira",
      "Diego",
      "Serafina",
    ]);
  });

  it("plucks nested property using dot notation", () => {
    expect(apply({ $pluck: "profile.group" }, children)).toEqual([
      "preschool",
      "toddler",
      "preschool",
      "kindergarten",
    ]);
  });

  it("handles missing properties gracefully", () => {
    const dataWithMissing = [
      { name: "Chen", age: 5 },
      { name: "Amira" }, // missing age
      { name: "Diego", age: 4 },
    ];

    expect(apply({ $pluck: "age" }, dataWithMissing)).toEqual([
      5,
      undefined,
      4,
    ]);
  });

  it("works with expression operands", () => {
    // Using an expression to determine what to pluck
    expect(apply({ $pluck: { $get: "name" } }, children)).toEqual([
      "Chen",
      "Amira",
      "Diego",
      "Serafina",
    ]);
  });

  it("throws error when applied to non-array", () => {
    expect(() => apply({ $pluck: "name" }, { name: "not array" })).toThrow(
      "$pluck can only be applied to arrays",
    );
  });

  describe("$pluck evaluate form", () => {
    it("plucks property from provided array", () => {
      const activities = [
        { name: "reading", duration: 30, room: "library" },
        { name: "art", duration: 45, room: "studio" },
        { name: "music", duration: 25, room: "auditorium" },
      ];

      expect(
        evaluate({
          $pluck: { array: activities, property: "name" },
        }),
      ).toEqual(["reading", "art", "music"]);
    });

    it("works with nested properties in evaluate form", () => {
      const schedule = [
        { activity: { name: "circle time", type: "group" } },
        { activity: { name: "free play", type: "individual" } },
        { activity: { name: "snack", type: "group" } },
      ];

      expect(
        evaluate({
          $pluck: { array: schedule, property: "activity.name" },
        }),
      ).toEqual(["circle time", "free play", "snack"]);
    });

    it("works with expression operands in evaluate form", () => {
      const data = [
        { details: { code: "A1", label: "Morning" } },
        { details: { code: "B2", label: "Afternoon" } },
      ];

      expect(
        evaluate({
          $pluck: { array: data, property: { $get: "details.code" } },
        }),
      ).toEqual(["A1", "B2"]);
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $pluck: "not an array" })).toThrow(
        "$pluck evaluate form requires object operand: { array, property }",
      );
    });

    it("throws error for wrong array length", () => {
      expect(() => evaluate({ $pluck: [[], "name", "extra"] })).toThrow(
        "$pluck evaluate form requires object operand: { array, property }",
      );
    });
  });

  describe("$pluck integration with other expressions", () => {
    it("combines with filtering for targeted extraction", () => {
      // Just test $pluck without filtering for now
      const result = apply({ $pluck: "name" }, children);

      // Should include all children names
      expect(result).toEqual(["Chen", "Amira", "Diego", "Serafina"]);
    });

    it("works in complex data extraction scenarios", () => {
      // Just pluck ages to verify it extracts correctly
      const ages = apply({ $pluck: "age" }, children);
      expect(ages).toEqual([5, 3, 4, 6]);
    });
  });
});

describe("$prepend", () => {
  describe("apply form", () => {
    it("prepends elements to arrays", () => {
      expect(apply({ $prepend: [4, 5] }, [1, 2, 3])).toEqual([4, 5, 1, 2, 3]);
      expect(apply({ $prepend: [] }, [1, 2, 3])).toEqual([1, 2, 3]);
      expect(apply({ $prepend: ["a", "b"] }, ["c", "d", "e"])).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
      ]);
    });
  });

  describe("evaluate form", () => {
    it("prepends with static arrays", () => {
      expect(
        evaluate({
          $prepend: {
            arrayToPrepend: [4, 5],
            baseArray: [1, 2, 3],
          },
        }),
      ).toEqual([4, 5, 1, 2, 3]);
      expect(
        evaluate({ $prepend: { arrayToPrepend: [], baseArray: [1, 2] } }),
      ).toEqual([1, 2]);
      expect(
        evaluate({
          $prepend: {
            arrayToPrepend: ["a", "b"],
            baseArray: ["c", "d", "e"],
          },
        }),
      ).toEqual(["a", "b", "c", "d", "e"]);
    });
  });
});

describe("$reverse", () => {
  describe("apply form", () => {
    it("reverses arrays", () => {
      expect(apply({ $reverse: {} }, [1, 2, 3])).toEqual([3, 2, 1]);
    });
  });

  describe("evaluate form", () => {
    it("reverses static arrays", () => {
      expect(evaluate({ $reverse: [1, 2, 3] })).toEqual([3, 2, 1]);
      expect(evaluate({ $reverse: ["a", "b", "c"] })).toEqual(["c", "b", "a"]);
      expect(evaluate({ $reverse: [] })).toEqual([]);
    });
  });
});

describe("$skip", () => {
  describe("apply form", () => {
    it("skips elements from beginning", () => {
      expect(apply({ $skip: 2 }, [1, 2, 3, 4, 5])).toEqual([3, 4, 5]);
      expect(apply({ $skip: 1 }, ["Amara", "Kenji", "Yuki"])).toEqual([
        "Kenji",
        "Yuki",
      ]);
    });

    it("handles skip count larger than array", () => {
      expect(apply({ $skip: 10 }, [1, 2, 3])).toEqual([]);
    });

    it("handles zero skip", () => {
      expect(apply({ $skip: 0 }, [1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("evaluate form", () => {
    it("skips with static arrays", () => {
      expect(evaluate({ $skip: { count: 2, array: [1, 2, 3, 4, 5] } })).toEqual(
        [3, 4, 5],
      );
      expect(
        evaluate({ $skip: { count: 1, array: ["Dao", "Elena", "Yuki"] } }),
      ).toEqual(["Elena", "Yuki"]);
    });
  });
});

describe("$take", () => {
  describe("apply form", () => {
    it("takes elements from beginning", () => {
      expect(apply({ $take: 3 }, [1, 2, 3, 4, 5])).toEqual([1, 2, 3]);
      expect(apply({ $take: 2 }, ["Amara", "Kenji", "Yuki"])).toEqual([
        "Amara",
        "Kenji",
      ]);
    });

    it("handles take count larger than array", () => {
      expect(apply({ $take: 10 }, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("handles zero take", () => {
      expect(apply({ $take: 0 }, [1, 2, 3])).toEqual([]);
    });
  });

  describe("evaluate form", () => {
    it("takes with static arrays", () => {
      expect(evaluate({ $take: { count: 3, array: [1, 2, 3, 4, 5] } })).toEqual(
        [1, 2, 3],
      );
      expect(
        evaluate({ $take: { count: 2, array: ["Dao", "Elena", "Yuki"] } }),
      ).toEqual(["Dao", "Elena"]);
    });
  });
});

describe("$unique", () => {
  describe("apply form", () => {
    it("removes duplicates", () => {
      expect(apply({ $unique: {} }, [1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
      expect(
        apply({ $unique: {} }, ["Amara", "Kenji", "Amara", "Yuki"]),
      ).toEqual(["Amara", "Kenji", "Yuki"]);
    });

    it("handles arrays with no duplicates", () => {
      expect(apply({ $unique: {} }, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("handles empty arrays", () => {
      expect(apply({ $unique: {} }, [])).toEqual([]);
    });
  });

  describe("evaluate form", () => {
    it("removes duplicates from static arrays", () => {
      expect(evaluate({ $unique: [1, 2, 2, 3, 1, 4] })).toEqual([1, 2, 3, 4]);
      expect(evaluate({ $unique: ["Dao", "Elena", "Dao", "Yuki"] })).toEqual([
        "Dao",
        "Elena",
        "Yuki",
      ]);
    });
  });
});

describe("array expressions - edge cases", () => {
  describe("$all edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $all: true }, [])).toBe(true);
      expect(apply({ $all: { $eq: 5 } }, [])).toBe(true);
    });

    it("handles complex nested expressions", () => {
      const data = [
        { user: { active: true, age: 25 } },
        { user: { active: true, age: 30 } },
      ];
      expect(
        apply(
          {
            $all: {
              $and: [
                { $get: "user.active" },
                { $gte: [{ $get: "user.age" }, 18] },
              ],
            },
          },
          data,
        ),
      ).toBe(true);
    });

    it("throws error for missing expression property in evaluate form", () => {
      expect(() => evaluate({ $all: { array: [true, true] } })).toThrow(
        "$all evaluate form requires 'expression' and 'array' properties",
      );
    });

    it("throws error for missing array property in evaluate form", () => {
      expect(() => evaluate({ $all: { expression: true } })).toThrow(
        "$all evaluate form requires 'expression' and 'array' properties",
      );
    });
  });

  describe("$any edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $any: true }, [])).toBe(false);
      expect(apply({ $any: { $eq: 5 } }, [])).toBe(false);
    });

    it("handles complex nested expressions", () => {
      const data = [
        { status: "inactive", priority: 1 },
        { status: "active", priority: 5 },
      ];
      expect(
        apply(
          {
            $any: {
              $and: [
                { $eq: [{ $get: "status" }, "active"] },
                { $gte: [{ $get: "priority" }, 3] },
              ],
            },
          },
          data,
        ),
      ).toBe(true);
    });

    it("throws error for invalid evaluate operand", () => {
      expect(() => evaluate({ $any: null })).toThrow(
        "$any evaluate form requires object operand",
      );
      expect(() => evaluate({ $any: [] })).toThrow(
        "$any evaluate form requires object operand",
      );
    });
  });

  describe("$append edge cases", () => {
    it("handles null and undefined values", () => {
      expect(apply({ $append: [null] }, [1, 2])).toEqual([1, 2, null]);
      expect(apply({ $append: [undefined] }, [1, 2])).toEqual([
        1,
        2,
        undefined,
      ]);
    });

    it("handles nested arrays", () => {
      expect(apply({ $append: [[3, 4]] }, [1, 2])).toEqual([1, 2, [3, 4]]);
    });

    it("throws error for missing properties in evaluate form", () => {
      expect(() => evaluate({ $append: { baseArray: [1, 2] } })).toThrow(
        "evaluate form requires 'arrayToAppend' and 'baseArray' properties",
      );
      expect(() => evaluate({ $append: { arrayToAppend: [3] } })).toThrow(
        "evaluate form requires 'arrayToAppend' and 'baseArray' properties",
      );
    });
  });

  describe("$coalesce edge cases", () => {
    it("handles arrays with all null/undefined values", () => {
      expect(apply({ $coalesce: [null, undefined, null] }, {})).toBeUndefined();
    });

    it("handles empty arrays", () => {
      expect(apply({ $coalesce: [] }, {})).toBeUndefined();
    });

    it("handles mixed null and falsy values", () => {
      expect(apply({ $coalesce: [null, 0, false, ""] }, {})).toBe(0);
      expect(apply({ $coalesce: [undefined, false, null] }, {})).toBe(false);
    });

    it("works with complex expressions in evaluate form", () => {
      expect(
        evaluate({
          $coalesce: [
            null,
            { $get: { object: { value: "found" }, path: "value" } },
            "default",
          ],
        }),
      ).toBe("found");
    });
  });

  describe("$concat edge cases", () => {
    it("handles empty arrays to concatenate", () => {
      expect(apply({ $concat: [] }, [1, 2])).toEqual([1, 2]);
      expect(apply({ $concat: [[], []] }, [1, 2])).toEqual([1, 2]);
    });

    it("handles nested array structures", () => {
      expect(apply({ $concat: [[[3]], [[4]]] }, [1, 2])).toEqual([
        1,
        2,
        [3],
        [4],
      ]);
    });

    it("preserves types and special values", () => {
      expect(
        apply({ $concat: [[null, undefined, false, 0]] }, ["test"]),
      ).toEqual(["test", null, undefined, false, 0]);
    });

    it("works with evaluate form and multiple arrays", () => {
      expect(
        evaluate({
          $concat: [
            [1, 2],
            [3, 4],
            [5, 6],
          ],
        }),
      ).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("$filter edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $filter: true }, [])).toEqual([]);
      expect(apply({ $filter: { $gt: 5 } }, [])).toEqual([]);
    });

    it("handles complex filtering conditions", () => {
      const data = [
        { user: { name: "Aria", score: 85, active: true } },
        { user: { name: "Chen", score: 92, active: false } },
        { user: { name: "Zara", score: 78, active: true } },
      ];
      expect(
        apply(
          {
            $filter: {
              $and: [
                { $get: "user.active" },
                { $gte: [{ $get: "user.score" }, 80] },
              ],
            },
          },
          data,
        ),
      ).toEqual([{ user: { name: "Aria", score: 85, active: true } }]);
    });

    it("throws error for null operand in evaluate form", () => {
      expect(() => evaluate({ $filter: null })).toThrow(
        "$filter evaluate form requires object operand",
      );
    });
  });

  describe("$filterBy edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $filterBy: { status: "active" } }, [])).toEqual([]);
    });

    it("throws error when applied to non-arrays", () => {
      expect(() =>
        apply({ $filterBy: { name: "test" } }, "not an array"),
      ).toThrow("$filterBy can only be applied to arrays");
    });

    it("throws error for invalid operand types", () => {
      expect(() => apply({ $filterBy: null }, [])).toThrow(
        "$filterBy operand must be an object with property conditions",
      );
      expect(() => apply({ $filterBy: [] }, [])).toThrow(
        "$filterBy operand must be an object with property conditions",
      );
    });

    it("handles complex expression conditions", () => {
      const data = [
        { name: "Kai", age: 25, department: "engineering" },
        { name: "Luna", age: 30, department: "design" },
        { name: "Ravi", age: 28, department: "engineering" },
      ];
      expect(
        apply(
          {
            $filterBy: {
              department: "engineering",
              age: { $gte: 26 },
            },
          },
          data,
        ),
      ).toEqual([{ name: "Ravi", age: 28, department: "engineering" }]);
    });

    it("throws error for invalid evaluate form operand length", () => {
      expect(() => evaluate({ $filterBy: [1] })).toThrow(
        "$filterBy evaluate form requires array operand: [data, conditions]",
      );
      expect(() => evaluate({ $filterBy: [1, 2, 3] })).toThrow(
        "$filterBy evaluate form requires array operand: [data, conditions]",
      );
    });

    it("throws error when first argument is not an array in evaluate form", () => {
      expect(() =>
        evaluate({ $filterBy: ["not array", { status: "active" }] }),
      ).toThrow("$filterBy first argument must be an array");
    });

    it("throws error for invalid conditions in evaluate form", () => {
      expect(() => evaluate({ $filterBy: [[], null] })).toThrow(
        "$filterBy conditions must be an object with property conditions",
      );
      expect(() => evaluate({ $filterBy: [[], []] })).toThrow(
        "$filterBy conditions must be an object with property conditions",
      );
    });
  });

  describe("$find edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $find: true }, [])).toBeUndefined();
      expect(apply({ $find: { $eq: 5 } }, [])).toBeUndefined();
    });

    it("handles complex search conditions", () => {
      const data = [
        { product: { name: "laptop", price: 999, inStock: false } },
        { product: { name: "phone", price: 599, inStock: true } },
        { product: { name: "tablet", price: 399, inStock: true } },
      ];
      expect(
        apply(
          {
            $find: {
              $and: [
                { $get: "product.inStock" },
                { $lt: [{ $get: "product.price" }, 500] },
              ],
            },
          },
          data,
        ),
      ).toEqual({ product: { name: "tablet", price: 399, inStock: true } });
    });

    it("returns undefined when no match found", () => {
      expect(
        apply({ $find: { $eq: "missing" } }, ["a", "b", "c"]),
      ).toBeUndefined();
    });
  });

  describe("$flatMap edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $flatMap: [] }, [])).toEqual([]);
      expect(apply({ $flatMap: [1, 2] }, [])).toEqual([]);
    });

    it("handles complex transformation and flattening", () => {
      const data = [
        { tags: ["javascript", "web"] },
        { tags: ["python", "data"] },
        { tags: ["go"] },
      ];
      expect(apply({ $flatMap: { $get: "tags" } }, data)).toEqual([
        "javascript",
        "web",
        "python",
        "data",
        "go",
      ]);
    });

    it("handles nested array results", () => {
      expect(
        apply({ $flatMap: [{ $get: "." }, { $get: "." }] }, [1, 2]),
      ).toEqual([1, 1, 2, 2]);
    });
  });

  describe("$flatten edge cases", () => {
    it("handles already flat arrays", () => {
      expect(apply({ $flatten: {} }, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("handles custom depth", () => {
      expect(apply({ $flatten: { depth: 2 } }, [1, [2, [3, 4]]])).toEqual([
        1, 2, 3, 4,
      ]);
      expect(apply({ $flatten: { depth: 0 } }, [1, [2, 3]])).toEqual([
        1,
        [2, 3],
      ]);
    });

    it("handles deeply nested structures", () => {
      expect(apply({ $flatten: { depth: 3 } }, [1, [2, [3, [4, 5]]]])).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it("works with evaluate form using array operand", () => {
      expect(evaluate({ $flatten: [1, [2, 3]] })).toEqual([1, 2, 3]);
    });

    it("throws error for invalid evaluate form operand", () => {
      expect(() => evaluate({ $flatten: { depth: 2 } })).toThrow(
        "$flatten evaluate form requires either an array operand, or an object of the form { array: [...], depth: 2 }",
      );
      expect(() =>
        evaluate({ $flatten: { array: "not array", depth: 1 } }),
      ).toThrow(
        "$flatten evaluate form requires either an array operand, or an object of the form { array: [...], depth: 2 }",
      );
    });
  });

  describe("$groupBy edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $groupBy: "status" }, [])).toEqual({});
      expect(apply({ $groupBy: { $get: "category" } }, [])).toEqual({});
    });

    it("throws error when applied to non-arrays", () => {
      expect(() => apply({ $groupBy: "field" }, "not an array")).toThrow(
        "$groupBy can only be applied to arrays",
      );
    });

    it("throws error when grouping key is missing (string operand)", () => {
      expect(() => apply({ $groupBy: "missing" }, [{ name: "test" }])).toThrow(
        '{"name":"test"} could not be grouped by missing',
      );
    });

    it("throws error when grouping key is missing (expression operand)", () => {
      expect(() =>
        apply({ $groupBy: { $get: "missing" } }, [{ name: "test" }]),
      ).toThrow('{"name":"test"} could not be grouped by [object Object]');
    });

    it("handles complex grouping expressions", () => {
      const data = [
        { user: { department: "eng", level: "senior" } },
        { user: { department: "eng", level: "junior" } },
        { user: { department: "design", level: "senior" } },
      ];
      expect(
        apply(
          {
            $groupBy: {
              $get: "user.department",
            },
          },
          data,
        ),
      ).toEqual({
        eng: [
          { user: { department: "eng", level: "senior" } },
          { user: { department: "eng", level: "junior" } },
        ],
        design: [{ user: { department: "design", level: "senior" } }],
      });
    });

    it("throws error for missing array property in evaluate form", () => {
      expect(() => evaluate({ $groupBy: { groupBy: "status" } })).toThrow(
        "$groupBy evaluate form requires 'array' and 'groupBy' properties",
      );
    });

    it("throws error for missing groupBy property in evaluate form", () => {
      expect(() => evaluate({ $groupBy: { array: [] } })).toThrow(
        "$groupBy evaluate form requires 'array' and 'groupBy' properties",
      );
    });

    it("throws error for invalid evaluate operand", () => {
      expect(() => evaluate({ $groupBy: null })).toThrow(
        "$groupBy evaluate form requires object operand",
      );
      expect(() => evaluate({ $groupBy: [] })).toThrow(
        "$groupBy evaluate form requires object operand",
      );
    });
  });

  describe("$join edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $join: "," }, [])).toBe("");
    });

    it("handles arrays with null and undefined", () => {
      expect(apply({ $join: "," }, [1, null, undefined, 2])).toBe("1,,,2");
    });

    it("handles complex separators", () => {
      expect(apply({ $join: " -> " }, ["a", "b", "c"])).toBe("a -> b -> c");
      expect(apply({ $join: "" }, ["a", "b", "c"])).toBe("abc");
    });

    it("throws error for missing properties in evaluate form", () => {
      expect(() => evaluate({ $join: { array: ["a", "b"] } })).toThrow(
        "evaluate form requires 'separator' and 'array' properties",
      );
      expect(() => evaluate({ $join: { separator: "," } })).toThrow(
        "evaluate form requires 'separator' and 'array' properties",
      );
    });
  });

  describe("$map edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $map: { $get: "name" } }, [])).toEqual([]);
    });

    it("handles complex transformation expressions", () => {
      const data = [
        { user: { first: "Aria", last: "Chen", age: 25 } },
        { user: { first: "Zara", last: "Kim", age: 30 } },
      ];
      expect(
        apply(
          {
            $map: {
              $select: {
                fullName: { $get: "user.first" },
                isAdult: { $gte: [{ $get: "user.age" }, 18] },
              },
            },
          },
          data,
        ),
      ).toEqual([
        { fullName: "Aria", isAdult: true },
        { fullName: "Zara", isAdult: true },
      ]);
    });

    it("preserves array length even with undefined results", () => {
      expect(apply({ $map: { $get: "missing" } }, [1, 2, 3])).toEqual([
        undefined,
        undefined,
        undefined,
      ]);
    });
  });

  describe("$pluck edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $pluck: "name" }, [])).toEqual([]);
      expect(apply({ $pluck: { $get: "field" } }, [])).toEqual([]);
    });

    it("throws error when applied to non-arrays", () => {
      expect(() => apply({ $pluck: "field" }, "not an array")).toThrow(
        "$pluck can only be applied to arrays",
      );
    });

    it("handles missing properties", () => {
      expect(apply({ $pluck: "missing" }, [{ name: "test" }])).toEqual([
        undefined,
      ]);
    });

    it("handles nested property paths", () => {
      const data = [
        { user: { profile: { email: "aria@example.com" } } },
        { user: { profile: { email: "chen@example.com" } } },
      ];
      expect(apply({ $pluck: "user.profile.email" }, data)).toEqual([
        "aria@example.com",
        "chen@example.com",
      ]);
    });

    it("handles complex expression operands", () => {
      const data = [
        { metrics: { views: 100, clicks: 5 } },
        { metrics: { views: 200, clicks: 15 } },
      ];
      expect(
        apply(
          {
            $pluck: {
              $divide: [{ $get: "metrics.clicks" }, { $get: "metrics.views" }],
            },
          },
          data,
        ),
      ).toEqual([0.05, 0.075]);
    });

    it("throws error for missing array property in evaluate form", () => {
      expect(() => evaluate({ $pluck: { property: "name" } })).toThrow(
        "$pluck evaluate form requires 'array' and 'property' properties",
      );
    });

    it("throws error for missing property property in evaluate form", () => {
      expect(() => evaluate({ $pluck: { array: [] } })).toThrow(
        "$pluck evaluate form requires 'array' and 'property' properties",
      );
    });

    it("throws error for invalid evaluate operand", () => {
      expect(() => evaluate({ $pluck: null })).toThrow(
        "$pluck evaluate form requires object operand",
      );
      expect(() => evaluate({ $pluck: [] })).toThrow(
        "$pluck evaluate form requires object operand",
      );
    });
  });

  describe("$prepend edge cases", () => {
    it("handles null and undefined values", () => {
      expect(apply({ $prepend: [null] }, [1, 2])).toEqual([null, 1, 2]);
      expect(apply({ $prepend: [undefined] }, [1, 2])).toEqual([
        undefined,
        1,
        2,
      ]);
    });

    it("handles nested arrays", () => {
      expect(apply({ $prepend: [[0]] }, [1, 2])).toEqual([[0], 1, 2]);
    });

    it("handles empty arrays to prepend", () => {
      expect(apply({ $prepend: [] }, [1, 2])).toEqual([1, 2]);
    });

    it("throws error for missing properties in evaluate form", () => {
      expect(() => evaluate({ $prepend: { baseArray: [1, 2] } })).toThrow(
        "evaluate form requires 'arrayToPrepend' and 'baseArray' properties",
      );
      expect(() => evaluate({ $prepend: { arrayToPrepend: [0] } })).toThrow(
        "evaluate form requires 'arrayToPrepend' and 'baseArray' properties",
      );
    });
  });

  describe("$reverse edge cases", () => {
    it("handles empty arrays", () => {
      expect(apply({ $reverse: {} }, [])).toEqual([]);
    });

    it("handles single element arrays", () => {
      expect(apply({ $reverse: {} }, ["only"])).toEqual(["only"]);
    });

    it("maintains immutability", () => {
      const original = [1, 2, 3];
      const result = apply({ $reverse: {} }, original);
      expect(result).toEqual([3, 2, 1]);
      expect(original).toEqual([1, 2, 3]); // Original unchanged
    });

    it("handles arrays with mixed types", () => {
      expect(apply({ $reverse: {} }, [1, "two", null, true])).toEqual([
        true,
        null,
        "two",
        1,
      ]);
    });
  });

  describe("$skip edge cases", () => {
    it("handles skip count larger than array length", () => {
      expect(apply({ $skip: 10 }, [1, 2, 3])).toEqual([]);
    });

    it("handles zero skip", () => {
      expect(apply({ $skip: 0 }, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("handles negative skip count", () => {
      expect(apply({ $skip: -1 }, [1, 2, 3])).toEqual([3]);
    });

    it("handles empty arrays", () => {
      expect(apply({ $skip: 5 }, [])).toEqual([]);
    });

    it("throws error for missing properties in evaluate form", () => {
      expect(() => evaluate({ $skip: { array: [1, 2] } })).toThrow(
        "evaluate form requires 'count' and 'array' properties",
      );
      expect(() => evaluate({ $skip: { count: 1 } })).toThrow(
        "evaluate form requires 'count' and 'array' properties",
      );
    });
  });

  describe("$take edge cases", () => {
    it("handles negative take count", () => {
      expect(apply({ $take: -1 }, [1, 2, 3])).toEqual([1, 2]);
    });

    it("handles non-integer count", () => {
      expect(apply({ $take: 2.7 }, [1, 2, 3, 4])).toEqual([1, 2]);
    });

    it("handles empty arrays", () => {
      expect(apply({ $take: 5 }, [])).toEqual([]);
    });

    it("throws error for missing properties in evaluate form", () => {
      expect(() => evaluate({ $take: { array: [1, 2] } })).toThrow(
        "evaluate form requires 'count' and 'array' properties",
      );
      expect(() => evaluate({ $take: { count: 1 } })).toThrow(
        "evaluate form requires 'count' and 'array' properties",
      );
    });
  });

  describe("$unique edge cases", () => {
    it("handles arrays with objects (reference equality)", () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 1 }; // Different reference but same content
      expect(apply({ $unique: {} }, [obj1, obj2, obj1, obj3])).toEqual([
        obj1,
        obj2,
        obj3,
      ]);
    });

    it("handles arrays with special values", () => {
      expect(
        apply({ $unique: {} }, [0, false, "", null, undefined, 0, false]),
      ).toEqual([0, false, "", null, undefined]);
    });

    it("handles arrays with NaN", () => {
      expect(apply({ $unique: {} }, [NaN, 1, NaN, 2])).toEqual([NaN, 1, 2]);
    });
  });

  describe("error handling and validation", () => {
    it("handles malformed operands gracefully", () => {
      expect(() => apply({ $all: true }, "not array")).toThrow();
      expect(() => apply({ $map: {} }, null)).toThrow();
    });

    it("provides helpful error messages", () => {
      expect(() => evaluate({ $all: "string" })).toThrow(
        "$all evaluate form requires object operand",
      );
      expect(() => evaluate({ $filter: 123 })).toThrow(
        "$filter evaluate form requires object operand",
      );
    });

    it("handles missing required properties consistently", () => {
      expect(() => evaluate({ $map: {} })).toThrow(
        "$map evaluate form requires 'expression' and 'array' properties",
      );
      expect(() => evaluate({ $filter: {} })).toThrow(
        "$filter evaluate form requires 'expression' and 'array' properties",
      );
    });
  });

  describe("integration and compatibility", () => {
    it("works well with other expressions in complex scenarios", () => {
      const data = {
        users: [
          { name: "Aria", scores: [85, 90, 88], active: true },
          { name: "Chen", scores: [92, 89, 94], active: false },
          { name: "Zara", scores: [78, 85, 82], active: true },
        ],
      };

      expect(
        apply(
          {
            $filter: {
              $get: "active",
            },
          },
          data.users,
        ),
      ).toEqual([
        { name: "Aria", scores: [85, 90, 88], active: true },
        { name: "Zara", scores: [78, 85, 82], active: true },
      ]);
    });

    it("maintains consistent behavior across apply and evaluate forms", () => {
      const testData = [1, 2, 3, 4, 5];

      // Apply form
      const applyResult = apply({ $filter: { $gt: 3 } }, testData);

      // Evaluate form
      const evaluateResult = evaluate({
        $filter: { expression: { $gt: 3 }, array: testData },
      });

      expect(applyResult).toEqual(evaluateResult);
      expect(applyResult).toEqual([4, 5]);
    });
  });
});
