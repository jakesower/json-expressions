import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
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

    it("works with array path in object operand", () => {
      expect(
        evaluate({
          $get: { object: { user: { name: "Asha" } }, path: ["user", "name"] },
        }),
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

    it("gets nested value using array path", () => {
      expect(
        apply({ $get: ["user", "name"] }, { user: { name: "Chen" } }),
      ).toEqual("Chen");
    });

    it("gets deeply nested value using array path", () => {
      const data = {
        child: { profile: { contact: { email: "test@example.com" } } },
      };
      expect(
        apply({ $get: ["child", "profile", "contact", "email"] }, data),
      ).toEqual("test@example.com");
    });
  });
});

// $isDefined removed - replaced with semantic expressions $isPresent/$isEmpty/$exists


describe("$select", () => {
  const children = [
    { name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
    { name: "Amira", age: 3, status: "inactive", scores: [78, 84, 91] },
    { name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
  ];

  describe("apply form", () => {

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

    it("combines well with map for array projection", () => {
      const result = apply(
        {
          $map: { $select: { name: { $get: "name" }, status: { $get: "status" } } },
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
        "$select operand must be an object with key mappings",
      );
    });
  });

  describe("evaluate form", () => {
    it("evaluates selection against provided object", () => {
      const child = { name: "Kenji", age: 6, status: "active" };

      expect(
        evaluate({
          $select: { object: child, selection: { name: { $get: "name" }, age: { $get: "age" } } },
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
          $select: { object: child, selection: { name: { $get: "name" }, age: { $get: "age" } } },
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

describe("$identity", () => {
  describe("apply form", () => {
    it("returns input data unchanged but processes operand", () => {
      const data = { name: "Amara", age: 4, toys: ["blocks", "dolls"] };
      expect(apply({ $identity: null }, data)).toEqual(data);
      expect(apply({ $identity: "ignored" }, data)).toEqual(data);
    });

    it("works with different input data types", () => {
      expect(apply({ $identity: null }, "hello")).toBe("hello");
      expect(apply({ $identity: null }, 42)).toBe(42);
      expect(apply({ $identity: null }, true)).toBe(true);
      expect(apply({ $identity: null }, null)).toBe(null);
      expect(apply({ $identity: null }, [1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("evaluate form", () => {
    it("evaluates and returns the operand", () => {
      expect(evaluate({ $identity: "test" })).toBe("test");
      expect(evaluate({ $identity: 123 })).toBe(123);
      expect(evaluate({ $identity: { name: "Zara" } })).toEqual({
        name: "Zara",
      });
      expect(evaluate({ $identity: [1, 2, 3] })).toEqual([1, 2, 3]);
    });

    it("evaluates non-literal operands", () => {
      expect(evaluate({ $identity: { $add: [1, 2] } })).toBe(3);
    });

    it("preserves literals", () => {
      expect(evaluate({ $identity: { $literal: "processed" } })).toEqual({
        $literal: "processed",
      });
    });

    it("works with null and undefined", () => {
      expect(evaluate({ $identity: null })).toBe(null);
      expect(evaluate({ $identity: undefined })).toBe(undefined);
    });
  });
});

describe("access expressions - edge cases", () => {
  describe("$get edge cases", () => {
    it("handles dot notation for root access", () => {
      const data = { name: "Luna", age: 3 };
      expect(apply({ $get: "." }, data)).toEqual(data);
    });

    it("handles complex nested paths", () => {
      const data = {
        child: {
          profile: {
            emergency: {
              contact: { name: "Sofia", phone: "555-0123" },
            },
          },
        },
      };
      expect(
        apply({ $get: "child.profile.emergency.contact.name" }, data),
      ).toBe("Sofia");
    });

    it("returns null for non-existent nested paths", () => {
      const data = { child: { name: "Omar" } };
      expect(apply({ $get: "child.profile.missing" }, data)).toBe(null);
      expect(apply({ $get: "nonexistent.path" }, data)).toBe(null);
    });

    it("handles array index access", () => {
      const data = { meals: ["apple", "crackers", "juice"] };
      expect(apply({ $get: "meals.0" }, data)).toBe("apple");
      expect(apply({ $get: "meals.2" }, data)).toBe("juice");
      expect(apply({ $get: "meals.10" }, data)).toBe(null);
    });

    it("handles null and undefined input data", () => {
      expect(apply({ $get: "name" }, null)).toBe(null);
      expect(apply({ $get: "name" }, undefined)).toBe(null);
      expect(apply({ $get: "." }, null)).toBe(null);
      expect(apply({ $get: "." }, undefined)).toBe(null);
    });

    it("handles empty string paths", () => {
      const data = { "": "empty key", name: "Kai" };
      expect(apply({ $get: "" }, data)).toBe("empty key");
    });

    it("handles paths with special characters", () => {
      const data = {
        "child-name": "Zara",
        special_key: "metadata",
        "child[0]": "first",
      };
      expect(apply({ $get: "child-name" }, data)).toBe("Zara");
      expect(apply({ $get: "special_key" }, data)).toBe("metadata");
      expect(apply({ $get: "child[0]" }, data)).toBe("first");
    });

    it("evaluates path expressions in apply form", () => {
      const data = { name: "Iris", age: 4, fieldToGet: "name" };
      expect(apply({ $get: { $get: "fieldToGet" } }, data)).toBe("Iris");
    });

    // Evaluate form edge cases
    it("throws when missing object property in evaluate form", () => {
      expect(() => evaluate({ $get: { path: "name" } })).toThrow(
        "$get evaluate form requires 'object' and 'path' properties",
      );
    });

    it("throws when missing path property in evaluate form", () => {
      expect(() => evaluate({ $get: { object: { name: "test" } } })).toThrow(
        "$get evaluate form requires 'object' and 'path' properties",
      );
    });

    it("handles null/undefined properties in evaluate form", () => {
      expect(() =>
        evaluate({ $get: { object: null, path: undefined } }),
      ).toThrow("$get evaluate form requires 'object' and 'path' properties");
    });

    it("works with expression objects and paths in evaluate form", () => {
      expect(
        evaluate({
          $get: {
            object: { child: { name: "Wei" }, key: "child.name" },
            path: "key",
          },
        }),
      ).toBe("child.name");
    });

    it("handles complex evaluate form scenarios", () => {
      expect(
        evaluate({
          $get: {
            object: {
              teachers: [
                { name: "Elena", room: "rainbow" },
                { name: "Miguel", room: "sunshine" },
              ],
            },
            path: "teachers.0.name",
          },
        }),
      ).toBe("Elena");
    });
  });


  describe("$select edge cases", () => {

    it("handles empty object selection", () => {
      const data = { name: "Fatima", age: 4 };
      expect(apply({ $select: {} }, data)).toEqual({});
    });


    it("handles complex object transformations", () => {
      const data = {
        child: { name: "Diego", age: 4 },
        scores: [95, 87, 92],
        active: true,
      };
      expect(
        apply(
          {
            $select: {
              studentName: { $get: "child.name" },
              isOlderThan3: { $gt: [{ $get: "child.age" }, 3] },
              scoreCount: { $get: "scores.length" },
              status: {
                $if: {
                  if: { $get: "active" },
                  then: "enrolled",
                  else: "inactive",
                },
              },
            },
          },
          data,
        ),
      ).toEqual({
        studentName: "Diego",
        isOlderThan3: true,
        scoreCount: 3,
        status: "enrolled",
      });
    });

    it("preserves original data when using empty selections", () => {
      const data = { name: "Luna", age: 5 };
      const result = apply({ $select: {} }, data);

      expect(result).toEqual({});
      expect(data).toEqual({ name: "Luna", age: 5 }); // Original unchanged
    });

    it("handles null values in object form", () => {
      const data = { name: "Zara", optional: null, missing: undefined };
      expect(
        apply(
          {
            $select: {
              childName: { $get: "name" },
              nullValue: { $get: "optional" },
              missingValue: { $get: "missing" },
            },
          },
          data,
        ),
      ).toEqual({
        childName: "Zara",
        nullValue: null,
        missingValue: null,
      });
    });

    it("throws for null operand", () => {
      expect(() => apply({ $select: null }, {})).toThrow(
        "$select operand must be an object with key mappings",
      );
    });

    it("throws for primitive operands", () => {
      expect(() => apply({ $select: "invalid" }, {})).toThrow(
        "$select operand must be an object with key mappings",
      );
      expect(() => apply({ $select: 123 }, {})).toThrow(
        "$select operand must be an object with key mappings",
      );
      expect(() => apply({ $select: true }, {})).toThrow(
        "$select operand must be an object with key mappings",
      );
    });

    // Evaluate form edge cases
    it("throws when missing object property in evaluate form", () => {
      expect(() => evaluate({ $select: { selection: { name: { $get: "name" } } } })).toThrow(
        "$select evaluate form requires 'object' and 'selection' properties",
      );
    });

    it("throws when missing selection property in evaluate form", () => {
      expect(() => evaluate({ $select: { object: { name: "test" } } })).toThrow(
        "$select evaluate form requires 'object' and 'selection' properties",
      );
    });

    it("handles null/undefined properties in evaluate form", () => {
      expect(() =>
        evaluate({ $select: { object: null, selection: undefined } }),
      ).toThrow(
        "$select evaluate form requires 'object' and 'selection' properties",
      );
    });

    it("works with complex selections in evaluate form", () => {
      expect(
        evaluate({
          $select: {
            object: {
              children: [
                { name: "Anya", age: 3 },
                { name: "Omar", age: 4 },
              ],
              teacher: { name: "Elena", room: "rainbow" },
            },
            selection: {
              firstChild: { $get: "children.0.name" },
              teacherRoom: { $get: "teacher.room" },
              childCount: { $get: "children.length" },
            },
          },
        }),
      ).toEqual({
        firstChild: "Anya",
        teacherRoom: "rainbow",
        childCount: 2,
      });
    });
  });

  describe("$identity edge cases", () => {
    it("handles complex nested data structures", () => {
      const complexData = {
        children: [
          {
            name: "Ravi",
            schedule: { monday: ["art", "play"], tuesday: ["music", "story"] },
            allergies: ["peanuts"],
          },
        ],
        teachers: { rainbow: "Sofia", sunshine: "Miguel" },
        meta: { date: new Date("2024-01-01"), version: 1.2 },
      };
      expect(apply({ $identity: "anything" }, complexData)).toEqual(
        complexData,
      );
    });

    it("preserves object references in apply form", () => {
      const originalData = { name: "Wei", toys: ["blocks"] };
      const result = apply({ $identity: null }, originalData);
      expect(result).toBe(originalData); // Same reference
    });

    it("handles circular references safely", () => {
      const circularData = { name: "Iris" };
      circularData.self = circularData;
      const result = apply({ $identity: "ignored" }, circularData);
      expect(result).toBe(circularData);
      expect(result.self).toBe(circularData);
    });

    it("works with primitive wrapper objects", () => {
      const stringObj = new String("hello");
      const numberObj = new Number(42);
      const booleanObj = new Boolean(true);

      expect(apply({ $identity: null }, stringObj)).toBe(stringObj);
      expect(apply({ $identity: null }, numberObj)).toBe(numberObj);
      expect(apply({ $identity: null }, booleanObj)).toBe(booleanObj);
    });

    it("handles special JavaScript values", () => {
      expect(apply({ $identity: null }, NaN)).toBeNaN();
      expect(apply({ $identity: null }, Infinity)).toBe(Infinity);
      expect(apply({ $identity: null }, -Infinity)).toBe(-Infinity);
      expect(apply({ $identity: null }, -0)).toBe(-0);
    });

    // Evaluate form edge cases
    it("handles expression operands in evaluate form", () => {
      expect(evaluate({ $identity: { $add: [10, 20] } })).toBe(30);
      expect(
        evaluate({
          $identity: { $get: { object: { name: "Kai" }, path: "name" } },
        }),
      ).toBe("Kai");
    });

    it("preserves literal wrapper in evaluate form", () => {
      expect(evaluate({ $identity: { $literal: { $add: [1, 2] } } })).toEqual({
        $literal: { $add: [1, 2] },
      });
    });

    it("handles nested literal expressions", () => {
      expect(
        evaluate({
          $identity: { $literal: { nested: { $get: "value" } } },
        }),
      ).toEqual({
        $literal: { nested: { $get: "value" } },
      });
    });

    it("evaluates complex nested expressions", () => {
      expect(
        evaluate({
          $identity: {
            $select: {
              object: { a: 1, b: 2 },
              selection: { sum: { $add: [{ $get: "a" }, { $get: "b" }] } },
            },
          },
        }),
      ).toEqual({ sum: 3 });
    });
  });

  describe("error handling and validation", () => {
    it("handles malformed operands gracefully", () => {
      expect(() => evaluate({ $get: [] })).toThrow();
      expect(() => evaluate({ $select: [] })).toThrow();
    });

    it("provides helpful error messages", () => {
      expect(() => evaluate({ $get: "string" })).toThrow(
        "$get evaluate form requires object operand: { object, path }",
      );
      expect(() => evaluate({ $select: "string" })).toThrow(
        "$select evaluate form requires object operand: { object, selection }",
      );
    });

    it("handles missing required properties consistently", () => {
      const partialGet = { $get: { object: {} } };
      const partialSelect = { $select: { object: {} } };

      expect(() => evaluate(partialGet)).toThrow(/requires.*properties/);
      expect(() => evaluate(partialSelect)).toThrow(/requires.*properties/);
    });
  });

  describe("integration and compatibility", () => {
    it("works well with other expressions in complex scenarios", () => {
      const data = {
        classroom: {
          children: [
            { name: "Luna", age: 3, active: true },
            { name: "Kai", age: 4, active: false },
            { name: "Zara", age: 5, active: true },
          ],
          teacher: { name: "Sofia", experience: 5 },
        },
      };

      expect(
        apply(
          {
            $select: {
              childrenCount: { $get: "classroom.children.length" },
              teacherName: { $get: "classroom.teacher.name" },
              teacherExperience: { $get: "classroom.teacher.experience" },
              firstChildName: { $get: "classroom.children.0.name" },
            },
          },
          data,
        ),
      ).toEqual({
        childrenCount: 3,
        teacherName: "Sofia",
        teacherExperience: 5,
        firstChildName: "Luna",
      });
    });

    it("maintains consistent behavior across apply and evaluate forms", () => {
      const testData = { child: { name: "Chen", age: 4 } };

      // $get consistency
      expect(apply({ $get: "child.name" }, testData)).toBe(
        evaluate({ $get: { object: testData, path: "child.name" } }),
      );

      // $select consistency
      expect(apply({ $select: { childName: { $get: "child.name" } } }, testData)).toEqual(
        evaluate({ $select: { object: testData, selection: { childName: { $get: "child.name" } } } }),
      );
    });
  });
});
