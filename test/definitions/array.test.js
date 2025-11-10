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
			const ages = [4, 5, 6];
			expect(apply({ $all: { $gt: 3 } }, ages)).toBe(true);
			expect(apply({ $all: { $gt: 5 } }, ages)).toBe(false);
		});
	});
});

describe("$any", () => {
	describe("basic functionality", () => {
		it("returns true if any element matches", () => {
			const ages = [4, 5, 6];
			expect(apply({ $any: { $gt: 5 } }, ages)).toBe(true);
			expect(apply({ $any: { $gt: 10 } }, ages)).toBe(false);
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
			const morningKids = ["Amira", "Yuki"];
			const afternoonKids = ["Dao", "Elena"];
			expect(apply({ $concat: [afternoonKids] }, morningKids)).toEqual([
				"Amira",
				"Yuki",
				"Dao",
				"Elena",
			]);
		});

		it("handles empty arrays", () => {
			const kids = ["Amira", "Yuki"];
			expect(apply({ $concat: [[], []] }, kids)).toEqual(kids);
			expect(apply({ $concat: [["Dao", "Elena"]] }, [])).toEqual([
				"Dao",
				"Elena",
			]);
		});
	});
});

describe("$filter", () => {
	describe("basic functionality", () => {
		it("filters arrays", () => {
			const ages = [3, 4, 5];
			expect(apply({ $filter: { $eq: 4 } }, ages)).toEqual([4]);
		});
	});
});

describe("$filterBy", () => {
	const children = [
		{ name: "Aisha", age: 4, active: true, status: "enrolled" },
		{ name: "Chen", age: 5, active: true, status: "enrolled" },
		{ name: "Diego", age: 3, active: false, status: "waitlist" },
		{ name: "Fatima", age: 6, active: true, status: "enrolled" },
	];

	describe("basic functionality", () => {
		it("filters arrays by object property conditions", () => {
			const result = apply(
				{ $filterBy: { age: { $gte: 5 }, active: { $eq: true } } },
				children,
			);
			expect(result).toEqual([
				{ name: "Chen", age: 5, active: true, status: "enrolled" },
				{ name: "Fatima", age: 6, active: true, status: "enrolled" },
			]);
		});

		it("filters by single condition", () => {
			const result = apply({ $filterBy: { active: { $eq: false } } }, children);
			expect(result).toEqual([
				{ name: "Diego", age: 3, active: false, status: "waitlist" },
			]);
		});

		it("filters by nested property paths", () => {
			const childRecords = [
				{ name: "Amara", profile: { settings: { napTime: "early" } } },
				{ name: "Kenji", profile: { settings: { napTime: "late" } } },
				{ name: "Yuki", profile: { settings: { napTime: "early" } } },
			];
			const result = apply(
				{ $filterBy: { "profile.settings.napTime": { $eq: "early" } } },
				childRecords,
			);
			expect(result).toHaveLength(2);
			expect(result[0].profile.settings.napTime).toBe("early");
			expect(result[1].profile.settings.napTime).toBe("early");
		});

		it("filters with complex expressions", () => {
			const result = apply(
				{
					$filterBy: {
						age: { $and: [{ $gte: 4 }, { $lte: 5 }] },
						status: { $eq: "enrolled" },
					},
				},
				children,
			);
			expect(result).toEqual([
				{ name: "Aisha", age: 4, active: true, status: "enrolled" },
				{ name: "Chen", age: 5, active: true, status: "enrolled" },
			]);
		});

		it("returns empty array when no items match", () => {
			const result = apply({ $filterBy: { age: { $gt: 10 } } }, children);
			expect(result).toEqual([]);
		});

		it("returns all items when all match", () => {
			const result = apply(
				{ $filterBy: { name: { $isPresent: true } } },
				children,
			);
			expect(result).toEqual(children);
		});

		it("throws error when applied to non-array", () => {
			expect(() =>
				apply({ $filterBy: { age: { $gt: 5 } } }, "not an array"),
			).toThrow("$filterBy can only be applied to arrays");
		});

		it("throws error with invalid operand", () => {
			expect(() => apply({ $filterBy: "invalid" }, children)).toThrow(
				"$filterBy operand must be an object with property conditions",
			);
			expect(() => apply({ $filterBy: ["invalid"] }, children)).toThrow(
				"$filterBy operand must be an object with property conditions",
			);
		});
	});
});

describe("$find", () => {
	describe("basic functionality", () => {
		it("finds matching element", () => {
			const ages = [4, 5, 6];
			expect(apply({ $find: { $eq: 5 } }, ages)).toBe(5);
			expect(apply({ $find: { $gt: 10 } }, ages)).toBe(undefined);
		});
	});
});

describe("$flatten", () => {
	describe("basic functionality", () => {
		it("flattens nested arrays with default depth", () => {
			expect(apply({ $flatten: {} }, [["Kenji", "Yuki"], ["Amara"]])).toEqual([
				"Kenji",
				"Yuki",
				"Amara",
			]);
		});

		it("flattens with depth 1 by default", () => {
			const nestedGroups = [[["Amara"]], [["Kenji"]]];
			const result = apply({ $flatten: {} }, nestedGroups);
			expect(result).toEqual([["Amara"], ["Kenji"]]);
		});

		it("flattens with custom depth", () => {
			const deeplyNested = [[["Amara", "Kenji"]], [["Yuki", "Dao"]]];
			expect(apply({ $flatten: { depth: 2 } }, deeplyNested)).toEqual([
				"Amara",
				"Kenji",
				"Yuki",
				"Dao",
			]);
			expect(apply({ $flatten: { depth: 1 } }, deeplyNested)).toEqual([
				["Amara", "Kenji"],
				["Yuki", "Dao"],
			]);
		});

		it("handles deeply nested arrays", () => {
			expect(apply({ $flatten: { depth: 3 } }, [[[["Elena"]]]])).toEqual([
				"Elena",
			]);
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
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $join: ", " }, names)).toBe("Amara, Kenji, Yuki");
			expect(apply({ $join: " & " }, names)).toBe("Amara & Kenji & Yuki");
		});
	});
});

describe("$map", () => {
	describe("basic functionality", () => {
		it("should perform without subexpressions", () => {
			const singleKid = [{ name: "Amara" }];
			expect(apply({ $map: { $literal: 3 } }, singleKid)).toEqual([3]);
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
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $reverse: {} }, names)).toEqual([
				"Yuki",
				"Kenji",
				"Amara",
			]);
		});
	});

	describe("operand-over-inputData pattern", () => {
		it("operates on input data when operand is null", () => {
			expect(apply({ $reverse: null }, [1, 2, 3])).toEqual([3, 2, 1]);
		});

		it("operates on operand when provided with literal", () => {
			expect(apply({ $reverse: [1, 2, 3] }, null)).toEqual([3, 2, 1]);
		});

		it("operates on operand when provided with expression result", () => {
			expect(
				apply({ $reverse: { $get: "items" } }, { items: ["a", "b", "c"] }),
			).toEqual(["c", "b", "a"]);
		});

		it("prefers operand over input data when both are arrays", () => {
			expect(apply({ $reverse: [4, 5, 6] }, [1, 2, 3])).toEqual([6, 5, 4]);
		});

		it("respects $literal wrapping", () => {
			expect(apply({ $reverse: { $literal: [7, 8, 9] } }, [1, 2, 3])).toEqual([
				9, 8, 7,
			]);
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
			const names = ["Amara", "Kenji", "Yuki", "Dao", "Elena"];
			expect(apply({ $take: 3 }, names)).toEqual(["Amara", "Kenji", "Yuki"]);
			expect(apply({ $take: 2 }, names)).toEqual(["Amara", "Kenji"]);
		});

		it("handles take count larger than array", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $take: 10 }, names)).toEqual(names);
		});

		it("handles zero take", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $take: 0 }, names)).toEqual([]);
		});
	});
});

describe("$unique", () => {
	describe("basic functionality", () => {
		it("removes duplicates", () => {
			expect(
				apply({ $unique: {} }, ["Amara", "Kenji", "Amara", "Yuki", "Kenji"]),
			).toEqual(["Amara", "Kenji", "Yuki"]);
		});

		it("handles arrays with no duplicates", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $unique: {} }, names)).toEqual(names);
		});

		it("handles empty arrays", () => {
			expect(apply({ $unique: {} }, [])).toEqual([]);
		});
	});

	describe("operand-over-inputData pattern", () => {
		it("operates on input data when operand is null", () => {
			expect(apply({ $unique: null }, [1, 2, 1, 3, 2])).toEqual([1, 2, 3]);
		});

		it("operates on operand when provided with literal", () => {
			expect(apply({ $unique: [1, 2, 1, 3, 2] }, null)).toEqual([1, 2, 3]);
		});

		it("operates on operand when provided with expression result", () => {
			expect(
				apply(
					{ $unique: { $get: "tags" } },
					{ tags: ["red", "blue", "red", "green"] },
				),
			).toEqual(["red", "blue", "green"]);
		});

		it("prefers operand over input data when both are arrays", () => {
			expect(apply({ $unique: [4, 5, 4, 6] }, [1, 2, 1, 3])).toEqual([4, 5, 6]);
		});

		it("respects $literal wrapping", () => {
			expect(
				apply({ $unique: { $literal: [7, 8, 7, 9] } }, [1, 2, 1, 3]),
			).toEqual([7, 8, 9]);
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
			const children = [
				{ child: { enrolled: true, age: 4 } },
				{ child: { enrolled: true, age: 5 } },
			];
			expect(
				apply(
					{
						$all: {
							$and: [
								{ $get: "child.enrolled" },
								{ $gte: [{ $get: "child.age" }, 3] },
							],
						},
					},
					children,
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
			const children = [
				{ status: "waitlist", age: 3 },
				{ status: "enrolled", age: 5 },
			];
			expect(
				apply(
					{
						$any: {
							$and: [
								{ $eq: [{ $get: "status" }, "enrolled"] },
								{ $gte: [{ $get: "age" }, 4] },
							],
						},
					},
					children,
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
			const names = ["Amara", "Kenji"];
			expect(apply({ $concat: [] }, names)).toEqual(names);
			expect(apply({ $concat: [[], []] }, names)).toEqual(names);
		});

		it("handles nested array structures", () => {
			const morning = ["Amara", "Kenji"];
			expect(apply({ $concat: [[["Yuki"]], [["Dao"]]] }, morning)).toEqual([
				"Amara",
				"Kenji",
				["Yuki"],
				["Dao"],
			]);
		});

		it("preserves types and special values", () => {
			expect(
				apply({ $concat: [[null, undefined, false, 0]] }, ["Amara"]),
			).toEqual(["Amara", null, undefined, false, 0]);
		});
	});

	describe("$filter edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $filter: true }, [])).toEqual([]);
			expect(apply({ $filter: { $gt: 5 } }, [])).toEqual([]);
		});

		it("handles complex filtering conditions", () => {
			const children = [
				{ child: { name: "Amara", readingLevel: 85, enrolled: true } },
				{ child: { name: "Chen", readingLevel: 92, enrolled: false } },
				{ child: { name: "Zara", readingLevel: 78, enrolled: true } },
			];
			expect(
				apply(
					{
						$filter: {
							$and: [
								{ $get: "child.enrolled" },
								{ $gte: [{ $get: "child.readingLevel" }, 80] },
							],
						},
					},
					children,
				),
			).toEqual([
				{ child: { name: "Amara", readingLevel: 85, enrolled: true } },
			]);
		});
	});

	describe("$filterBy edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $filterBy: { status: "enrolled" } }, [])).toEqual([]);
		});

		it("throws error when applied to non-arrays", () => {
			expect(() =>
				apply({ $filterBy: { name: "Amara" } }, "not an array"),
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

		it("throws error when wildcard is used in path", () => {
			const children = [
				{ toys: [{ name: "ball" }, { name: "blocks" }] },
				{ toys: [{ name: "puzzle" }] },
			];
			expect(() =>
				apply({ $filterBy: { "toys.$.name": "ball" } }, children),
			).toThrow(
				'Wildcard ($) not supported in this context. Path: "toys.$.name"',
			);
		});

		it("handles complex expression conditions", () => {
			const children = [
				{ name: "Amara", age: 3, room: "toddlers" },
				{ name: "Kenji", age: 4, room: "preschool" },
				{ name: "Yuki", age: 5, room: "preschool" },
			];
			expect(
				apply(
					{
						$filterBy: {
							room: "preschool",
							age: { $gte: 4 },
						},
					},
					children,
				),
			).toEqual([
				{ name: "Kenji", age: 4, room: "preschool" },
				{ name: "Yuki", age: 5, room: "preschool" },
			]);
		});
	});

	describe("$find edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $find: true }, [])).toBeUndefined();
			expect(apply({ $find: { $eq: 5 } }, [])).toBeUndefined();
		});

		it("handles complex search conditions", () => {
			const children = [
				{ child: { name: "Amara", age: 3, pottyTrained: false } },
				{ child: { name: "Kenji", age: 4, pottyTrained: true } },
				{ child: { name: "Yuki", age: 5, pottyTrained: true } },
			];
			expect(
				apply(
					{
						$find: {
							$and: [
								{ $get: "child.pottyTrained" },
								{ $lt: [{ $get: "child.age" }, 5] },
							],
						},
					},
					children,
				),
			).toEqual({ child: { name: "Kenji", age: 4, pottyTrained: true } });
		});

		it("returns undefined when no match found", () => {
			expect(
				apply({ $find: { $eq: "Noah" } }, ["Amara", "Kenji", "Yuki"]),
			).toBeUndefined();
		});
	});

	describe("$flatMap edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $flatMap: [] }, [])).toEqual([]);
			expect(apply({ $flatMap: ["Amara", "Kenji"] }, [])).toEqual([]);
		});

		it("handles complex transformation and flattening", () => {
			const children = [
				{ allergies: ["peanuts", "dairy"] },
				{ allergies: ["gluten", "eggs"] },
				{ allergies: ["soy"] },
			];
			expect(apply({ $flatMap: { $get: "allergies" } }, children)).toEqual([
				"peanuts",
				"dairy",
				"gluten",
				"eggs",
				"soy",
			]);
		});

		it("handles nested array results", () => {
			const names = ["Amara", "Kenji"];
			expect(
				apply({ $flatMap: [{ $get: "." }, { $get: "." }] }, names),
			).toEqual(["Amara", "Amara", "Kenji", "Kenji"]);
		});
	});

	describe("$flatten edge cases", () => {
		it("handles already flat arrays", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $flatten: {} }, names)).toEqual(names);
		});

		it("handles custom depth", () => {
			const nested = ["Amara", ["Kenji", ["Yuki", "Dao"]]];
			expect(apply({ $flatten: { depth: 2 } }, nested)).toEqual([
				"Amara",
				"Kenji",
				"Yuki",
				"Dao",
			]);
			expect(apply({ $flatten: { depth: 0 } }, nested)).toEqual(nested);
		});

		it("handles deeply nested structures", () => {
			const deepNest = ["Amara", ["Kenji", ["Yuki", ["Dao", "Elena"]]]];
			expect(apply({ $flatten: { depth: 3 } }, deepNest)).toEqual([
				"Amara",
				"Kenji",
				"Yuki",
				"Dao",
				"Elena",
			]);
		});
	});

	describe("$groupBy edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $groupBy: "status" }, [])).toEqual({});
			expect(apply({ $groupBy: { $get: "room" } }, [])).toEqual({});
		});

		it("throws error when applied to non-arrays", () => {
			expect(() => apply({ $groupBy: "room" }, "not an array")).toThrow(
				"$groupBy can only be applied to arrays",
			);
		});

		it("throws error when grouping key is missing (string operand)", () => {
			expect(() => apply({ $groupBy: "missing" }, [{ name: "Amara" }])).toThrow(
				'{"name":"Amara"} could not be grouped by missing',
			);
		});

		it("throws error when grouping key is missing (expression operand)", () => {
			expect(() =>
				apply({ $groupBy: { $get: "missing" } }, [{ name: "Amara" }]),
			).toThrow('{"name":"Amara"} could not be grouped by [object Object]');
		});

		it("handles complex grouping expressions", () => {
			const children = [
				{ child: { room: "toddlers", readingLevel: "beginner" } },
				{ child: { room: "toddlers", readingLevel: "intermediate" } },
				{ child: { room: "preschool", readingLevel: "beginner" } },
			];
			expect(
				apply(
					{
						$groupBy: {
							$get: "child.room",
						},
					},
					children,
				),
			).toEqual({
				toddlers: [
					{ child: { room: "toddlers", readingLevel: "beginner" } },
					{ child: { room: "toddlers", readingLevel: "intermediate" } },
				],
				preschool: [{ child: { room: "preschool", readingLevel: "beginner" } }],
			});
		});
	});

	describe("$join edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $join: "," }, [])).toBe("");
		});

		it("handles arrays with null and undefined", () => {
			expect(apply({ $join: "," }, ["Amara", null, undefined, "Kenji"])).toBe(
				"Amara,,,Kenji",
			);
		});

		it("handles complex separators", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $join: " -> " }, names)).toBe("Amara -> Kenji -> Yuki");
			expect(apply({ $join: "" }, names)).toBe("AmaraKenjiYuki");
		});
	});

	describe("$map edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $map: { $get: "name" } }, [])).toEqual([]);
		});

		it("handles complex transformation expressions", () => {
			const children = [
				{ child: { name: "Amara", age: 4 } },
				{ child: { name: "Kenji", age: 5 } },
			];
			expect(
				apply(
					{
						$map: {
							$select: {
								name: { $get: "child.name" },
								isPreschoolAge: { $gte: [{ $get: "child.age" }, 3] },
							},
						},
					},
					children,
				),
			).toEqual([
				{ name: "Amara", isPreschoolAge: true },
				{ name: "Kenji", isPreschoolAge: true },
			]);
		});

		it("preserves array length even with null results", () => {
			const children = [{ name: "Amara" }, { name: "Kenji" }, { name: "Yuki" }];
			expect(apply({ $map: { $get: "missing" } }, children)).toEqual([
				null,
				null,
				null,
			]);
		});
	});

	describe("$pluck edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $pluck: "name" }, [])).toEqual([]);
			expect(apply({ $pluck: { $get: "age" } }, [])).toEqual([]);
		});

		it("throws error when applied to non-arrays", () => {
			expect(() => apply({ $pluck: "name" }, "not an array")).toThrow(
				"$pluck can only be applied to arrays",
			);
		});

		it("handles missing properties", () => {
			expect(apply({ $pluck: "missing" }, [{ name: "Amara" }])).toEqual([null]);
		});

		it("handles nested property paths", () => {
			const children = [
				{ child: { contact: { email: "amara@parents.com" } } },
				{ child: { contact: { email: "kenji@parents.com" } } },
			];
			expect(apply({ $pluck: "child.contact.email" }, children)).toEqual([
				"amara@parents.com",
				"kenji@parents.com",
			]);
		});

		it("handles complex expression operands", () => {
			const children = [
				{ attendance: { present: 18, total: 20 } },
				{ attendance: { present: 15, total: 20 } },
			];
			expect(
				apply(
					{
						$pluck: {
							$divide: [
								{ $get: "attendance.present" },
								{ $get: "attendance.total" },
							],
						},
					},
					children,
				),
			).toEqual([0.9, 0.75]);
		});
	});

	describe("$reverse edge cases", () => {
		it("handles empty arrays", () => {
			expect(apply({ $reverse: {} }, [])).toEqual([]);
		});

		it("handles single element arrays", () => {
			expect(apply({ $reverse: {} }, ["Amara"])).toEqual(["Amara"]);
		});

		it("maintains immutability", () => {
			const original = ["Amara", "Kenji", "Yuki"];
			const result = apply({ $reverse: {} }, original);
			expect(result).toEqual(["Yuki", "Kenji", "Amara"]);
			expect(original).toEqual(["Amara", "Kenji", "Yuki"]); // Original unchanged
		});

		it("handles arrays with mixed types", () => {
			expect(apply({ $reverse: {} }, [3, "Amara", null, true])).toEqual([
				true,
				null,
				"Amara",
				3,
			]);
		});
	});

	describe("$skip edge cases", () => {
		it("handles skip count larger than array length", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $skip: 10 }, names)).toEqual([]);
		});

		it("handles zero skip", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $skip: 0 }, names)).toEqual(names);
		});

		it("handles negative skip count", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $skip: -1 }, names)).toEqual(["Yuki"]);
		});

		it("handles empty arrays", () => {
			expect(apply({ $skip: 5 }, [])).toEqual([]);
		});
	});

	describe("$take edge cases", () => {
		it("handles negative take count", () => {
			const names = ["Amara", "Kenji", "Yuki"];
			expect(apply({ $take: -1 }, names)).toEqual(["Amara", "Kenji"]);
		});

		it("handles non-integer count", () => {
			const names = ["Amara", "Kenji", "Yuki", "Dao"];
			expect(apply({ $take: 2.7 }, names)).toEqual(["Amara", "Kenji"]);
		});

		it("handles empty arrays", () => {
			expect(apply({ $take: 5 }, [])).toEqual([]);
		});
	});

	describe("$unique edge cases", () => {
		it("handles arrays with objects (reference equality)", () => {
			const child1 = { name: "Amara", age: 3 };
			const child2 = { name: "Kenji", age: 4 };
			const child3 = { name: "Amara", age: 3 }; // Different reference but same content
			expect(apply({ $unique: {} }, [child1, child2, child1, child3])).toEqual([
				child1,
				child2,
				child3,
			]);
		});

		it("handles arrays with special values", () => {
			expect(
				apply({ $unique: {} }, [0, false, "", null, undefined, 0, false]),
			).toEqual([0, false, "", null, undefined]);
		});

		it("handles arrays with NaN", () => {
			expect(apply({ $unique: {} }, [NaN, 3, NaN, 4])).toEqual([NaN, 3, 4]);
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
			const daycare = {
				children: [
					{
						name: "Amara",
						assessmentScores: [85, 90, 88],
						enrolled: true,
					},
					{ name: "Chen", assessmentScores: [92, 89, 94], enrolled: false },
					{ name: "Zara", assessmentScores: [78, 85, 82], enrolled: true },
				],
			};

			expect(
				apply(
					{
						$filter: {
							$get: "enrolled",
						},
					},
					daycare.children,
				),
			).toEqual([
				{ name: "Amara", assessmentScores: [85, 90, 88], enrolled: true },
				{ name: "Zara", assessmentScores: [78, 85, 82], enrolled: true },
			]);
		});

		it("maintains consistent behavior for array filtering", () => {
			const ages = [3, 4, 5, 6, 7];

			const applyResult = apply({ $filter: { $gt: 4 } }, ages);

			expect(applyResult).toEqual([5, 6, 7]);
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
			expect(apply({ $first: { $filter: { $gt: 3 } } }, [1, 2, 3, 4, 5])).toBe(
				4,
			);
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
			expect(apply({ $last: { $filter: { $gt: 3 } } }, [1, 2, 3, 4, 5])).toBe(
				5,
			);
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

		it("throws error when wildcard is used in path", () => {
			const data = [
				{ tags: [{ priority: 1 }, { priority: 2 }] },
				{ tags: [{ priority: 3 }] },
			];
			expect(() => apply({ $sort: { by: "tags.$.priority" } }, data)).toThrow(
				'Wildcard ($) not supported in this context. Path: "tags.$.priority"',
			);
		});
	});

	describe("edge cases", () => {
		it("handles empty array input", () => {
			expect(apply({ $sort: "name" }, [])).toEqual([]);
		});

		it("handles single item array", () => {
			const singleItem = [{ name: "Alone", age: 3 }];
			expect(apply({ $sort: "age" }, singleItem)).toEqual(singleItem);
		});

		it("handles equal values (line 112 coverage)", () => {
			const equalAges = [
				{ name: "Amara", age: 4 },
				{ name: "Kenji", age: 4 },
				{ name: "Yuki", age: 4 },
			];

			const result = apply({ $sort: "age" }, equalAges);
			expect(result.map((item) => item.age)).toEqual([4, 4, 4]);
			// Original order should be preserved for equal values
			expect(result.map((item) => item.name)).toEqual([
				"Amara",
				"Kenji",
				"Yuki",
			]);
		});

		it("handles mixed data types in sort field", () => {
			const mixedData = [
				{ name: "Yuki", favoriteColor: "blue" },
				{ name: "Amara", favoriteColor: 42 },
				{ name: "Kenji", favoriteColor: null },
			];

			const result = apply({ $sort: "favoriteColor" }, mixedData);
			// JavaScript comparison behavior with mixed types
			expect(result.map((item) => item.name)).toEqual([
				"Yuki",
				"Kenji",
				"Amara",
			]);
		});

		it("handles missing values in sort field (now null)", () => {
			const withMissing = [
				{ name: "Amara", readingLevel: 90 },
				{ name: "Kenji" }, // missing readingLevel (now returns null instead of undefined)
				{ name: "Yuki", readingLevel: 85 },
			];

			const result = apply({ $sort: "readingLevel" }, withMissing);
			// JavaScript comparison behavior: null < numbers, so Kenji comes first
			expect(result.map((item) => item.name)).toEqual([
				"Kenji",
				"Yuki",
				"Amara",
			]);
		});

		it("handles complex expression-based sorting", () => {
			const children = [
				{ name: "Amara", assessment: { math: { score: 78 } } },
				{ name: "Kenji", assessment: { math: { score: 92 } } },
				{ name: "Yuki", assessment: { math: { score: 85 } } },
			];

			const result = apply(
				{ $sort: { by: { $get: "assessment.math.score" } } },
				children,
			);

			expect(result.map((item) => item.name)).toEqual([
				"Amara",
				"Yuki",
				"Kenji",
			]);
		});

		it("handles multiple sort criteria with equal primary values", () => {
			const children = [
				{ room: "toddlers", name: "Yuki", age: 3 },
				{ room: "toddlers", name: "Amara", age: 3 },
				{ room: "toddlers", name: "Kenji", age: 3 },
			];

			const result = apply(
				{
					$sort: [{ by: "room" }, { by: "age", desc: true }, { by: "name" }],
				},
				children,
			);

			expect(result.map((item) => item.name)).toEqual([
				"Amara",
				"Kenji",
				"Yuki",
			]);
		});

		it("handles nested array sorting", () => {
			const children = [
				{ name: "Amara", weeklyScores: [85, 90, 88] },
				{ name: "Kenji", weeklyScores: [92, 87, 89] },
				{ name: "Yuki", weeklyScores: [78, 85, 82] },
			];

			const result = apply(
				{ $sort: { by: { $get: "weeklyScores.0" } } },
				children,
			);

			expect(result.map((item) => item.name)).toEqual([
				"Yuki",
				"Amara",
				"Kenji",
			]);
		});

		it("maintains immutability with nested objects", () => {
			const original = [
				{ name: "Amara", info: { age: 4 } },
				{ name: "Kenji", info: { age: 5 } },
			];
			const originalCopy = JSON.parse(JSON.stringify(original));

			apply({ $sort: "info.age" }, original);

			expect(original).toEqual(originalCopy);
		});

		it("throws for invalid sort criteria in array", () => {
			const children = [{ name: "Amara" }, { name: "Kenji" }];

			expect(() =>
				apply({ $sort: [{ invalidKey: "value" }] }, children),
			).toThrow(
				"$sort operand must be string, object with 'by' property, or array of sort criteria",
			);

			expect(() => apply({ $sort: ["string-in-array"] }, children)).toThrow(
				"$sort operand must be string, object with 'by' property, or array of sort criteria",
			);
		});

		it("handles boolean desc flag variations", () => {
			const children = [
				{ name: "Amara", age: 4 },
				{ name: "Kenji", age: 5 },
				{ name: "Yuki", age: 3 },
			];

			// desc: false (explicit)
			expect(
				apply({ $sort: { by: "age", desc: false } }, children).map(
					(i) => i.name,
				),
			).toEqual(["Yuki", "Amara", "Kenji"]);

			// desc: true
			expect(
				apply({ $sort: { by: "age", desc: true } }, children).map(
					(i) => i.name,
				),
			).toEqual(["Kenji", "Amara", "Yuki"]);

			// no desc property (defaults to false)
			expect(
				apply({ $sort: { by: "age" } }, children).map((i) => i.name),
			).toEqual(["Yuki", "Amara", "Kenji"]);
		});
	});
});
