import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
	packs: [allExpressionsForTesting],
});
const { apply } = testEngine;

describe("$prop", () => {
	describe("basic functionality", () => {
		it("gets simple property from object", () => {
			expect(apply({ $prop: "name" }, { name: "Fatima", age: 25 })).toBe(
				"Fatima",
			);
		});

		it("gets numeric property", () => {
			expect(apply({ $prop: "age" }, { name: "Chen", age: 5 })).toBe(5);
		});

		it("gets array property", () => {
			expect(
				apply({ $prop: "toys" }, { name: "Luna", toys: ["blocks", "dolls"] }),
			).toEqual(["blocks", "dolls"]);
		});

		it("gets object property", () => {
			expect(
				apply({ $prop: "address" }, { name: "Omar", address: { city: "NYC" } }),
			).toEqual({ city: "NYC" });
		});

		it("returns null for non-existent property", () => {
			expect(apply({ $prop: "missing" }, { name: "Zara" })).toBe(null);
		});

		it("returns null for null input", () => {
			expect(apply({ $prop: "name" }, null)).toBe(null);
		});

		it("returns null for undefined input", () => {
			expect(apply({ $prop: "name" }, undefined)).toBe(null);
		});

		it("handles properties with special characters", () => {
			const data = {
				"child-name": "Sofia",
				special_key: "value",
				"prop[0]": "test",
			};
			expect(apply({ $prop: "child-name" }, data)).toBe("Sofia");
			expect(apply({ $prop: "special_key" }, data)).toBe("value");
			expect(apply({ $prop: "prop[0]" }, data)).toBe("test");
		});

		it("gets array element by index", () => {
			const data = ["apple", "banana", "cherry"];
			expect(apply({ $prop: "0" }, data)).toBe("apple");
			expect(apply({ $prop: "2" }, data)).toBe("cherry");
		});

		it("handles boolean properties", () => {
			expect(apply({ $prop: "active" }, { name: "Kai", active: true })).toBe(
				true,
			);
			expect(apply({ $prop: "active" }, { name: "Iris", active: false })).toBe(
				false,
			);
		});

		it("handles null property values", () => {
			expect(
				apply({ $prop: "optional" }, { name: "Wei", optional: null }),
			).toBe(null);
		});

		it("handles undefined property values", () => {
			expect(
				apply({ $prop: "missing" }, { name: "Diego", missing: undefined }),
			).toBe(null);
		});
	});

	describe("limitations (by design)", () => {
		it("does not support dot notation paths", () => {
			const data = { user: { name: "Chen" } };
			// $prop treats "user.name" as a literal key, not a path
			expect(apply({ $prop: "user.name" }, data)).toBe(null);
		});

		it("does not support wildcard access", () => {
			const data = [
				{ name: "Luna", age: 3 },
				{ name: "Kai", age: 4 },
			];
			// $prop treats "$" as a literal key, not a wildcard
			expect(apply({ $prop: "$" }, data)).toBe(null);
		});

		it("does not support array path notation", () => {
			const data = { user: { name: "Amira" } };
			// $prop only accepts string operands, not arrays
			expect(apply({ $prop: ["user", "name"] }, data)).toBe(null);
		});
	});

	describe("edge cases", () => {
		it("handles empty string property", () => {
			const data = { "": "empty key", name: "Ravi" };
			expect(apply({ $prop: "" }, data)).toBe("empty key");
		});

		it("handles numeric string keys", () => {
			const data = { "123": "numeric key", name: "Sofia" };
			expect(apply({ $prop: "123" }, data)).toBe("numeric key");
		});

		it("handles properties that shadow Object.prototype", () => {
			const data = {
				toString: "custom",
				hasOwnProperty: "overridden",
				constructor: "shadowed",
			};
			expect(apply({ $prop: "toString" }, data)).toBe("custom");
			expect(apply({ $prop: "hasOwnProperty" }, data)).toBe("overridden");
			expect(apply({ $prop: "constructor" }, data)).toBe("shadowed");
		});

		it("preserves object references", () => {
			const nestedObj = { city: "Boston" };
			const data = { address: nestedObj };
			const result = apply({ $prop: "address" }, data);
			expect(result).toBe(nestedObj);
		});
	});
});

describe("$get", () => {
	describe("basic functionality", () => {
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

	describe("basic functionality", () => {
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
					$map: {
						$select: { name: { $get: "name" }, status: { $get: "status" } },
					},
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
});

describe("$identity", () => {
	describe("basic functionality", () => {
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

		it("uses $ wildcard to iterate over arrays", () => {
			const data = [
				{ name: "Chen", age: 3 },
				{ name: "Amira", age: 4 },
				{ name: "Diego", age: 5 },
			];
			expect(apply({ $get: "$.name" }, data)).toEqual([
				"Chen",
				"Amira",
				"Diego",
			]);
			expect(apply({ $get: "$.age" }, data)).toEqual([3, 4, 5]);
		});

		it("uses $ wildcard for nested arrays", () => {
			const data = {
				children: [
					{ name: "Luna", toys: ["blocks", "dolls"] },
					{ name: "Kai", toys: ["cars", "puzzles"] },
				],
			};
			expect(apply({ $get: "children.$.name" }, data)).toEqual(["Luna", "Kai"]);
			// Note: flatMap flattens one level, so arrays of arrays become flattened
			expect(apply({ $get: "children.$.toys" }, data)).toEqual([
				"blocks",
				"dolls",
				"cars",
				"puzzles",
			]);
		});

		it("flattens with multiple $ wildcards", () => {
			const data = {
				classrooms: [
					{ children: [{ name: "Sofia" }, { name: "Miguel" }] },
					{ children: [{ name: "Zara" }, { name: "Omar" }] },
				],
			};
			expect(apply({ $get: "classrooms.$.children.$.name" }, data)).toEqual([
				"Sofia",
				"Miguel",
				"Zara",
				"Omar",
			]);
		});

		it("handles $ wildcard with non-array data", () => {
			const data = { name: "Iris", age: 3 };
			expect(apply({ $get: "$.name" }, data)).toEqual(["Iris"]);
		});

		it("handles $ wildcard with empty arrays", () => {
			expect(apply({ $get: "$.name" }, [])).toEqual([]);
			expect(apply({ $get: "items.$.id" }, { items: [] })).toEqual([]);
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
			// Empty string returns the whole object (root access)
			expect(apply({ $get: "" }, data)).toEqual(data);
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

		it("evaluates path expressions", () => {
			const data = { name: "Iris", age: 4, fieldToGet: "name" };
			expect(apply({ $get: { $get: "fieldToGet" } }, data)).toBe("Iris");
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

		it("preserves object references", () => {
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

		it("maintains consistent behavior for access operations", () => {
			const testData = { child: { name: "Chen", age: 4 } };

			// Basic consistency test
			expect(apply({ $get: "child.name" }, testData)).toBe("Chen");
			expect(
				apply({ $select: { childName: { $get: "child.name" } } }, testData),
			).toEqual({ childName: "Chen" });
		});
	});
});
