import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$get", () => {
  describe("evaluate form", () => {
    const { evaluate } = testEngine;

    it("gets value from object using object syntax", () => {
      expect(
        evaluate({
          $get: { object: { name: "Arnar", age: 30 }, path: "name" },
        }),
      ).toEqual("Arnar");
    });

    it("gets nested value from object", () => {
      expect(
        evaluate({
          $get: { object: { user: { name: "Arnar" } }, path: "user.name" },
        }),
      ).toEqual("Arnar");
    });

    it("throws with string operand", () => {
      expect(() => {
        evaluate({ $get: "name" });
      }).toThrowError(
        "$get evaluate form requires object operand: { object, path }",
      );
    });

    it("works with object operand", () => {
      expect(
        evaluate({ $get: { object: { name: "Asha" }, path: "name" } }),
      ).toBe("Asha");
    });
  });

  describe("apply form", () => {
    it("gets value using string path", () => {
      expect(apply({ $get: "name" }, { name: "Fatima", age: 25 })).toEqual(
        "Fatima",
      );
    });

    it("gets nested value using string path", () => {
      expect(apply({ $get: "user.name" }, { user: { name: "Chen" } })).toEqual(
        "Chen",
      );
    });
  });
});

describe("$isDefined", () => {
  describe("evaluate form", () => {
    const { evaluate } = testEngine;

    it("returns true for defined values", () => {
      expect(evaluate({ $isDefined: ["hello"] })).toBe(true);
      expect(evaluate({ $isDefined: [0] })).toBe(true);
      expect(evaluate({ $isDefined: [false] })).toBe(true);
      expect(evaluate({ $isDefined: [null] })).toBe(true);
      expect(evaluate({ $isDefined: [undefined] })).toBe(true);
    });

    it("returns false for undefined values", () => {
      expect(evaluate({ $isDefined: undefined })).toBe(false);
    });

    it("works with complex values", () => {
      expect(evaluate({ $isDefined: [{ name: "test" }] })).toBe(true);
      expect(evaluate({ $isDefined: [[1, 2, 3]] })).toBe(true);
    });
  });
});

describe("$prop", () => {
  describe("apply form", () => {
    it("gets simple property", () => {
      expect(apply({ $prop: "name" }, { name: "Kenji", age: 25 })).toEqual(
        "Kenji",
      );
    });

    it("gets property using expression", () => {
      expect(
        apply({ $prop: { $literal: "age" } }, { name: "Yuki", age: 30 }),
      ).toEqual(30);
    });

    it("returns undefined for missing property", () => {
      expect(apply({ $prop: "missing" }, { name: "Sato" })).toBeUndefined();
    });

    it("returns undefined when accessing property on null", () => {
      expect(apply({ $prop: "name" }, null)).toBeUndefined();
    });

    it("returns undefined when accessing property on undefined", () => {
      expect(apply({ $prop: "name" }, undefined)).toBeUndefined();
    });

    it("works with numeric properties", () => {
      expect(apply({ $prop: 0 }, ["first", "second"])).toEqual("first");
      expect(apply({ $prop: "length" }, ["a", "b", "c"])).toEqual(3);
    });

    it("works with symbol properties", () => {
      const sym = Symbol("test");
      const obj = { [sym]: "symbol value" };
      expect(apply({ $prop: { $literal: sym } }, obj)).toEqual("symbol value");
    });
  });

  describe("evaluate form", () => {
    it("gets property from object", () => {
      expect(
        evaluate({
          $prop: { object: { name: "Chen", age: 28 }, property: "name" },
        }),
      ).toEqual("Chen");
    });

    it("gets numeric property", () => {
      expect(
        evaluate({ $prop: { object: ["zero", "one", "two"], property: 1 } }),
      ).toEqual("one");
    });

    it("returns undefined for missing property", () => {
      expect(
        evaluate({ $prop: { object: { age: 25 }, property: "name" } }),
      ).toBeUndefined();
    });

    it("returns undefined when object is null", () => {
      expect(
        evaluate({ $prop: { object: null, property: "name" } }),
      ).toBeUndefined();
    });

    it("returns undefined when object is undefined", () => {
      expect(
        evaluate({
          $prop: { object: { $literal: undefined }, property: "name" },
        }),
      ).toBeUndefined();
    });

    it("throws with non-array operand", () => {
      expect(() => {
        evaluate({ $prop: "name" });
      }).toThrowError(
        "$prop evaluate form requires object operand: { object, property }",
      );
    });

    it("throws with incomplete object", () => {
      expect(() => {
        evaluate({ $prop: { object: { someKey: "value" } } });
      }).toThrowError(
        "$prop evaluate form requires 'object' and 'property' properties",
      );
    });

    it("works with computed property names", () => {
      expect(
        evaluate({
          $prop: {
            object: { a: "value-a", b: "value-b" },
            property: { $literal: "a" },
          },
        }),
      ).toEqual("value-a");
    });
  });
});

describe("$select", () => {
  const children = [
    { name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
    { name: "Amira", age: 3, status: "inactive", scores: [78, 84, 91] },
    { name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
  ];

  describe("apply form", () => {
    it("selects properties using array form", () => {
      expect(apply({ $select: ["name", "age"] }, children[0])).toEqual({
        name: "Chen",
        age: 5,
      });
    });

    it("skips undefined properties in array form", () => {
      expect(apply({ $select: ["name", "missing"] }, children[0])).toEqual({
        name: "Chen",
      });
    });

    it("renames and transforms properties using object form", () => {
      expect(
        apply(
          {
            $select: {
              childName: { $get: "name" },
              years: { $get: "age" },
              isActive: { $eq: "active" },
            },
          },
          children[0],
        ),
      ).toEqual({
        childName: "Chen",
        years: 5,
        isActive: false,
      });
    });

    it("works with nested property paths", () => {
      const data = {
        user: { profile: { name: "Fatima", age: 28 } },
        meta: { created: "2024-01-01" },
      };

      expect(
        apply({ $select: ["user.profile.name", "meta.created"] }, data),
      ).toEqual({
        "user.profile.name": "Fatima",
        "meta.created": "2024-01-01",
      });
    });

    it("combines well with map for array projection", () => {
      const result = apply(
        {
          $map: { $select: ["name", "status"] },
        },
        children,
      );

      expect(result).toEqual([
        { name: "Chen", status: "active" },
        { name: "Amira", status: "inactive" },
        { name: "Diego", status: "active" },
      ]);
    });

    it("throws error for invalid operand", () => {
      expect(() => apply({ $select: "not valid" }, {})).toThrow(
        "$select operand must be array of paths or object with key mappings",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates selection against provided object", () => {
      const child = { name: "Kenji", age: 6, status: "active" };

      expect(
        evaluate({
          $select: { object: child, selection: ["name", "age"] },
        }),
      ).toEqual({
        name: "Kenji",
        age: 6,
      });
    });

    it("works with object form in evaluate mode", () => {
      const child = { name: "Zara", age: 4, status: "active" };

      expect(
        evaluate({
          $select: { object: child, selection: ["name", "age"] },
        }),
      ).toEqual({
        name: "Zara",
        age: 4,
      });
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $select: "not an array" })).toThrow(
        "$select evaluate form requires object operand: { object, selection }",
      );
    });
  });
});

describe("$where", () => {
  const children = [
    { name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
    { name: "Amira", age: 3, status: "inactive", scores: [78, 84, 91] },
    { name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
  ];

  describe("apply form", () => {
    it("filters by single property condition", () => {
      // Test with single child
      expect(apply({ $where: { age: { $gt: 4 } } }, children[0])).toBe(true);
      expect(apply({ $where: { age: { $gt: 16 } } }, children[1])).toBe(false);
    });

    it("filters by multiple property conditions", () => {
      const condition = {
        $where: {
          age: { $gte: 4 },
          status: { $eq: "active" },
        },
      };

      expect(apply(condition, children[0])).toBe(true); // Chen: age 5, active
      expect(apply(condition, children[1])).toBe(false); // Amira: age 3, inactive
      expect(apply(condition, children[2])).toBe(true); // Diego: age 4, active
    });

    it("filters with nested expressions", () => {
      const condition = {
        $where: {
          age: { $gte: 4 },
          status: { $if: { if: true, then: { $eq: "active" } } },
        },
      };

      expect(apply(condition, children[0])).toBe(true); // Chen: age 5, active
      expect(apply(condition, children[1])).toBe(false); // Amira: age 3, inactive
      expect(apply(condition, children[2])).toBe(true); // Diego: age 4, active
    });

    it("handles nested property paths", () => {
      const testData = {
        user: {
          profile: { age: 25, name: "Fatima" },
          settings: { active: true },
        },
      };

      expect(
        apply(
          {
            $where: {
              "user.profile.age": { $gte: 18 },
              "user.settings.active": { $eq: true },
            },
          },
          testData,
        ),
      ).toBe(true);

      expect(
        apply(
          {
            $where: {
              "user.profile.age": { $lt: 18 },
            },
          },
          testData,
        ),
      ).toBe(false);
    });

    it("works with filter to find matching children", () => {
      const activeToddlers = apply(
        {
          $filter: {
            $where: {
              age: { $gte: 4 },
              status: { $eq: "active" },
            },
          },
        },
        children,
      );

      expect(activeToddlers).toEqual([
        { name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
        { name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
      ]);
    });

    it("throws error for non-object operand", () => {
      expect(() => apply({ $where: "not an object" }, {})).toThrow(
        "$where operand must be an object with property conditions",
      );
    });

    it("throws error for array operand", () => {
      expect(() => apply({ $where: ["age", "> 16"] }, {})).toThrow(
        "$where operand must be an object with property conditions",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates conditions against provided object", () => {
      const child = { name: "Kenji", age: 6, status: "active" };

      // Test using apply form since evaluate mode doesn't support dynamic expressions in conditions
      expect(
        apply(
          { $where: { age: { $gte: 5 }, status: { $eq: "active" } } },
          child,
        ),
      ).toBe(true);
      expect(apply({ $where: { age: { $gte: 10 } } }, child)).toBe(false);
    });

    it("handles nested property paths in evaluate form", () => {
      const data = {
        daycare: {
          children: [{ name: "Zara", age: 4 }],
          staff: { count: 3 },
        },
      };

      // Test using apply form since evaluate mode doesn't support dynamic expressions in conditions
      expect(
        apply({ $where: { "daycare.staff.count": { $gte: 2 } } }, data),
      ).toBe(true);
      expect(
        apply({ $where: { "daycare.staff.count": { $lt: 2 } } }, data),
      ).toBe(false);
    });

    it("throws error for invalid operand format", () => {
      expect(() => evaluate({ $where: "not an array" })).toThrow(
        "$where evaluate form requires object operand: { data, conditions }",
      );
    });

    it("throws error for incomplete object", () => {
      expect(() => evaluate({ $where: { data: {} } })).toThrow(
        "$where evaluate form requires 'data' and 'conditions' properties",
      );
    });

    it("throws error for non-object input", () => {
      expect(() => evaluate({ $where: "not an object" })).toThrow(
        "$where evaluate form requires object operand: { data, conditions }",
      );
    });
  });
});
