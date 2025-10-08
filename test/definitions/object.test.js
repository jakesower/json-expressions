import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { object } from "../../src/packs/object.js";

const testEngine = createExpressionEngine({ packs: [object] });
const { apply } = testEngine;

const children = [
	{ name: "Chen", age: 5, status: "active", scores: [92, 87, 95] },
	{ name: "Amira", age: 3, status: "inactive", scores: [78, 84, 91] },
	{ name: "Diego", age: 4, status: "active", scores: [88, 85, 89] },
];

describe("$merge", () => {
	describe("basic functionality", () => {
		it("merges single object", () => {
			const baseData = { name: "Chen", age: 5 };

			expect(
				apply(
					{
						$merge: { status: "active", lastSeen: "today" },
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

		it("merged object overrides input data properties", () => {
			const baseData = { name: "Chen", age: 5, status: "inactive" };

			expect(
				apply(
					{
						$merge: { status: "active", age: 6 },
					},
					baseData,
				),
			).toEqual({
				name: "Chen",
				age: 6,
				status: "active",
			});
		});

		it("handles expressions in merge object", () => {
			const userData = {
				profile: { name: "Fatima" },
				meta: { created: "2024-01-01" },
			};

			expect(
				apply(
					{
						$merge: {
							name: { $get: "profile.name" },
							created: { $get: "meta.created" },
							updated: "2024-01-02",
						},
					},
					userData,
				),
			).toEqual({
				profile: { name: "Fatima" },
				meta: { created: "2024-01-01" },
				name: "Fatima",
				created: "2024-01-01",
				updated: "2024-01-02",
			});
		});

		it("throws error for non-object operand", () => {
			expect(() => apply({ $merge: "not an object" }, {})).toThrow(
				"$merge operand must resolve to an object",
			);
		});
	});
});

describe("$pick", () => {
	describe("basic functionality", () => {
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
});

describe("$omit", () => {
	describe("basic functionality", () => {
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
});

describe("$keys", () => {
	describe("basic functionality", () => {
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
});

describe("$values", () => {
	describe("basic functionality", () => {
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
});

describe("$pairs", () => {
	describe("basic functionality", () => {
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
});

describe("$fromPairs", () => {
	describe("basic functionality", () => {
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
					{
						$select: {
							name: { $get: "profile.name" },
							age: { $get: "profile.age" },
							snack: { $get: "preferences.snack" },
							activity: { $get: "preferences.activity" },
						},
					},
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
		const original = {
			classroom: "Rainbow",
			teacher: "Mr. O'Brien",
			count: 15,
		};

		const result = apply(
			{
				$pipe: [{ $pairs: null }, { $fromPairs: null }],
			},
			original,
		);

		expect(result).toEqual(original);
	});
});
