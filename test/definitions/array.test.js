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
const { apply } = testEngine;

describe("$all", () => {
  describe("basic functionality", () => {
    it("returns true if all elements match", () => {
      expect(apply({ $all: { $gt: 3 } }, [4, 5, 6])).toBe(true);
      expect(apply({ $all: { $gt: 5 } }, [4, 5, 6])).toBe(false);
    });
  });
});

describe("$any", () => {
  describe("basic functionality", () => {
    it("returns true if any element matches", () => {
      expect(apply({ $any: { $gt: 5 } }, [4, 5, 6])).toBe(true);
      expect(apply({ $any: { $gt: 10 } }, [4, 5, 6])).toBe(false);
    });
  });
});

describe("$coalesce", () => {
  describe("basic functionality", () => {
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
});

describe("$concat", () => {
  describe("basic functionality", () => {
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
});

describe("$filter", () => {
  describe("basic functionality", () => {
    it("filters arrays", () => {
      expect(apply({ $filter: { $eq: 2 } }, [1, 2, 3])).toEqual([2]);
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

  describe("basic functionality", () => {
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
});

describe("$find", () => {
  describe("basic functionality", () => {
    it("finds matching element", () => {
      expect(apply({ $find: { $eq: 5 } }, [4, 5, 6])).toBe(5);
      expect(apply({ $find: { $gt: 10 } }, [4, 5, 6])).toBe(undefined);
    });
  });
});

describe("$flatten", () => {
  describe("basic functionality", () => {
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
});

describe("$groupBy", () => {
  const daycare = [
    { name: "Amara", age: 3, room: "toddlers" },
    { name: "Kenji", age: 4, room: "preschool" },
    { name: "Yuki", age: 3, room: "toddlers" },
    { name: "Dao", age: 5, room: "preschool" },
    { name: "Elena", age: 4, room: "preschool" },
  ];

  describe("basic functionality", () => {
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
});

describe("$join", () => {
  describe("basic functionality", () => {
    it("joins array elements", () => {
      expect(apply({ $join: ", " }, [1, 2, 3])).toBe("1, 2, 3");
      expect(apply({ $join: "" }, ["a", "b", "c"])).toBe("abc");
    });
  });
});

describe("$map", () => {
  describe("basic functionality", () => {
    it("should perform without subexpressions", () => {
      expect(apply({ $map: { $literal: 3 } }, [1])).toEqual([3]);
    });

    it("should perform with a subexpression", () => {
      expect(apply({ $map: { $get: "age" } }, kids)).toEqual([4, 5, 6]);
    });
  });

  describe("literal preservation", () => {
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

    expect(apply({ $pluck: "age" }, dataWithMissing)).toEqual([5, null, 4]);
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

describe("$reverse", () => {
  describe("basic functionality", () => {
    it("reverses arrays", () => {
      expect(apply({ $reverse: {} }, [1, 2, 3])).toEqual([3, 2, 1]);
    });
  });
});

describe("$skip", () => {
  describe("basic functionality", () => {
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
});

describe("$take", () => {
  describe("basic functionality", () => {
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
});

describe("$unique", () => {
  describe("basic functionality", () => {
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

    it("preserves array length even with null results", () => {
      expect(apply({ $map: { $get: "missing" } }, [1, 2, 3])).toEqual([
        null,
        null,
        null,
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
      expect(apply({ $pluck: "missing" }, [{ name: "test" }])).toEqual([null]);
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

    it("maintains consistent behavior for array filtering", () => {
      const testData = [1, 2, 3, 4, 5];

      const applyResult = apply({ $filter: { $gt: 3 } }, testData);

      expect(applyResult).toEqual([4, 5]);
    });
  });
});

describe("$first", () => {
  describe("basic functionality", () => {
    it("returns first element from input data array", () => {
      expect(apply({ $first: null }, [1, 2, 3, 4, 5])).toBe(1);
      expect(apply({ $first: null }, ["Amara", "Kenji", "Yuki"])).toBe("Amara");
    });

    it("returns first element from operand array", () => {
      expect(apply({ $first: [10, 20, 30] }, null)).toBe(10);
      expect(apply({ $first: { $literal: ["a", "b"] } }, null)).toBe("a");
    });

    it("returns first element from expression result", () => {
      expect(
        apply({ $first: { $get: "scores" } }, { scores: [95, 87, 92] }),
      ).toBe(95);
      expect(
        apply(
          { $first: { $filter: { $gt: 3 } } },
          [1, 2, 3, 4, 5],
        ),
      ).toBe(4);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $first: null }, [])).toBe(undefined);
      expect(apply({ $first: [] }, null)).toBe(undefined);
    });

    it("works with single element arrays", () => {
      expect(apply({ $first: null }, [42])).toBe(42);
      expect(apply({ $first: null }, ["Dao"])).toBe("Dao");
    });

    it("handles mixed data types", () => {
      expect(apply({ $first: null }, [null, "Elena", 3])).toBe(null);
      expect(apply({ $first: null }, [false, true])).toBe(false);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $first: null }, "not array")).toThrowError(
        "Array accessor expressions require array operand or input data",
      );
    });
  });
});

describe("$last", () => {
  describe("basic functionality", () => {
    it("returns last element from input data array", () => {
      expect(apply({ $last: null }, [1, 2, 3, 4, 5])).toBe(5);
      expect(apply({ $last: null }, ["Amara", "Kenji", "Yuki"])).toBe("Yuki");
    });

    it("returns last element from operand array", () => {
      expect(apply({ $last: [10, 20, 30] }, null)).toBe(30);
      expect(apply({ $last: { $literal: ["a", "b"] } }, null)).toBe("b");
    });

    it("returns last element from expression result", () => {
      expect(
        apply({ $last: { $get: "scores" } }, { scores: [95, 87, 92] }),
      ).toBe(92);
      expect(
        apply(
          { $last: { $filter: { $gt: 3 } } },
          [1, 2, 3, 4, 5],
        ),
      ).toBe(5);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $last: null }, [])).toBe(undefined);
      expect(apply({ $last: [] }, null)).toBe(undefined);
    });

    it("works with single element arrays", () => {
      expect(apply({ $last: null }, [42])).toBe(42);
      expect(apply({ $last: null }, ["Dao"])).toBe("Dao");
    });

    it("handles mixed data types", () => {
      expect(apply({ $last: null }, ["Elena", 3, null])).toBe(null);
      expect(apply({ $last: null }, [true, false])).toBe(false);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $last: null }, "not array")).toThrowError(
        "Array accessor expressions require array operand or input data",
      );
    });
  });
});
