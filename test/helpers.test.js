import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../src/expression-engine.js";
import {
	withResolvedOperand,
	createBimodalExpression,
} from "../src/helpers.js";

describe("Expression Authoring Helpers", () => {
	describe("withResolvedOperand", () => {
		it("should resolve operand before calling function", () => {
			const $double = withResolvedOperand((val) => val * 2);
			const engine = createExpressionEngine({ custom: { $double } });

			const result = engine.apply({ $double: { $get: "age" } }, { age: 21 });
			expect(result).toBe(42);
		});

		it("should pass inputData as second argument", () => {
			const $getWithContext = withResolvedOperand((resolved, inputData) => ({
				resolved,
				inputData,
			}));
			const engine = createExpressionEngine({ custom: { $getWithContext } });

			const result = engine.apply(
				{ $getWithContext: { $get: "name" } },
				{ name: "Amara", age: 28 },
			);
			expect(result).toEqual({
				resolved: "Amara",
				inputData: { name: "Amara", age: 28 },
			});
		});

		it("should pass context as third argument", () => {
			const $nested = withResolvedOperand((resolved, inputData, context) => {
				return context.apply({ $get: "score" }, inputData) + resolved;
			});
			const engine = createExpressionEngine({ custom: { $nested } });

			const result = engine.apply({ $nested: 10 }, { score: 5 });
			expect(result).toBe(15);
		});

		it("should work with literal operands", () => {
			const $triple = withResolvedOperand((val) => val * 3);
			const engine = createExpressionEngine({ custom: { $triple } });

			const result = engine.apply({ $triple: 7 }, 8); // operand wins
			expect(result).toBe(21);
		});
	});

	describe("createBimodalExpression - unary functions", () => {
		const $double = createBimodalExpression((val) => val * 2);
		const engine = createExpressionEngine({ custom: { $double } });

		it("should operate on inputData when operand is null", () => {
			const result = engine.apply({ $double: null }, 10);
			expect(result).toBe(20);
		});

		it("should operate on inputData when operand is undefined", () => {
			const $uppercase = createBimodalExpression((str) => str.toUpperCase());
			const engine2 = createExpressionEngine({ custom: { $uppercase } });

			const result = engine2.apply(
				{ $uppercase: { $get: "missing" } },
				"amina",
			);
			expect(result).toBe("AMINA");
		});

		it("should operate on resolved operand when provided", () => {
			const result = engine.apply({ $double: { $get: "age" } }, { age: 15 });
			expect(result).toBe(30);
		});

		it("should operate on resolved operand when it is a literal value", () => {
			const result = engine.apply({ $double: 8 }, { age: 100 });
			expect(result).toBe(16);
		});

		it("should operate on resolved operand even if it is 0 or false", () => {
			const $identity = createBimodalExpression((val) => val);
			const engine2 = createExpressionEngine({ custom: { $identity } });

			expect(engine2.apply({ $identity: 0 }, 100)).toBe(0);
			expect(engine2.apply({ $identity: false }, true)).toBe(false);
			expect(engine2.apply({ $identity: "" }, "fallback")).toBe("");
		});
	});

	describe("createBimodalExpression - binary functions", () => {
		const $logN = createBimodalExpression(
			(value, base) => Math.log(value) / Math.log(base),
		);
		const engine = createExpressionEngine({ custom: { $logN } });

		it("should use inputData as first arg when operand is single value", () => {
			const result = engine.apply({ $logN: 2 }, 8);
			expect(result).toBe(3); // log2(8) = 3
		});

		it("should spread 2-element array as both arguments", () => {
			const result = engine.apply({ $logN: [8, 2] }, null);
			expect(result).toBe(3); // log2(8) = 3
		});

		it("should spread 2-element array with expressions", () => {
			const result = engine.apply(
				{ $logN: [{ $get: "value" }, { $get: "base" }] },
				{ value: 27, base: 3 },
			);
			expect(result).toBeCloseTo(3, 10); // log3(27) = 3
		});

		it("should match comparison expression behavior", () => {
			const $gt = createBimodalExpression((a, b) => a > b);
			const engine2 = createExpressionEngine({ custom: { $gt } });

			// Single value form: inputData > operand
			expect(engine2.apply({ $gt: 6 }, 5)).toBe(false); // 5 > 6 = false
			expect(engine2.apply({ $gt: 4 }, 5)).toBe(true); // 5 > 4 = true

			// Array form: [a, b] → a > b
			expect(engine2.apply({ $gt: [5, 6] }, null)).toBe(false); // 5 > 6 = false
			expect(engine2.apply({ $gt: [5, 4] }, null)).toBe(true); // 5 > 4 = true
		});
	});

	describe("createBimodalExpression - arity validation", () => {
		it("should throw error for nullary functions", () => {
			expect(() => {
				const $invalid = createBimodalExpression(() => 42);
				const engine = createExpressionEngine({ custom: { $invalid } });
				engine.apply({ $invalid: null }, null);
			}).toThrow("only unary and binary functions can be wrapped");
		});

		it("should throw error for ternary functions", () => {
			expect(() => {
				const $invalid = createBimodalExpression((a, b, c) => a + b + c);
				const engine = createExpressionEngine({ custom: { $invalid } });
				engine.apply({ $invalid: null }, null);
			}).toThrow("only unary and binary functions can be wrapped");
		});
	});

	describe("Real-world usage examples", () => {
		it("should work for string transformations", () => {
			const $kebabCase = createBimodalExpression((str) =>
				str.toLowerCase().replace(/\s+/g, "-"),
			);
			const engine = createExpressionEngine({ custom: { $kebabCase } });

			// Operate on inputData
			expect(engine.apply({ $kebabCase: null }, "Fatima Ali")).toBe(
				"fatima-ali",
			);

			// Operate on operand
			expect(
				engine.apply(
					{ $kebabCase: { $get: "name" } },
					{ name: "Chen Wei", id: 123 },
				),
			).toBe("chen-wei");
		});

		it("should work for math operations", () => {
			const $pow = createBimodalExpression((base, exp) => Math.pow(base, exp));
			const engine = createExpressionEngine({ custom: { $pow } });

			// inputData^operand
			expect(engine.apply({ $pow: 3 }, 2)).toBe(8); // 2^3 = 8

			// array form
			expect(engine.apply({ $pow: [2, 3] }, null)).toBe(8); // 2^3 = 8
		});

		it("should work in composition with other expressions", () => {
			const $square = createBimodalExpression((val) => val * val);
			const $add = createBimodalExpression((a, b) => a + b);

			const engine = createExpressionEngine({
				custom: { $square, $add },
			});

			// Complex composition: square the child's age, then add 10
			const result = engine.apply(
				{
					$add: [{ $square: { $get: "age" } }, 10],
				},
				{ name: "Yuki", age: 5 },
			);

			expect(result).toBe(35); // 5^2 + 10 = 35
		});
	});
});

describe("Wildcard Support in get() helper", async () => {
	const { get } = await import("../src/internal-helpers.js");

	describe("with allowWildcards=true", () => {
		it("should support wildcard in path", () => {
			const data = [
				{ name: "Amira", age: 4 },
				{ name: "Chen", age: 5 },
			];
			const result = get(data, "$.name", true);
			expect(result).toEqual(["Amira", "Chen"]);
		});

		it("should support nested wildcards", () => {
			const data = {
				teams: [
					{ members: [{ name: "Yuki" }, { name: "Dao" }] },
					{ members: [{ name: "Elena" }, { name: "Fatima" }] },
				],
			};
			const result = get(data, "teams.$.members.$.name", true);
			expect(result).toEqual(["Yuki", "Dao", "Elena", "Fatima"]);
		});
	});

	describe("with allowWildcards=false (default)", () => {
		it("should throw error when wildcard is used", () => {
			const data = [
				{ name: "Amira", age: 4 },
				{ name: "Chen", age: 5 },
			];
			expect(() => get(data, "$.name", false)).toThrow(
				'Wildcard ($) not supported in this context. Path: "$.name"',
			);
		});

		it("should throw error for nested wildcards", () => {
			const data = { users: [{ profile: { name: "Kenji" } }] };
			expect(() => get(data, "users.$.profile", false)).toThrow(
				'Wildcard ($) not supported in this context. Path: "users.$.profile"',
			);
		});

		it("should work normally without wildcards", () => {
			const data = { user: { name: "Amira" } };
			const result = get(data, "user.name", false);
			expect(result).toBe("Amira");
		});
	});

	describe("bracket notation support", () => {
		it("should support array index access with brackets", () => {
			const data = { items: [{ name: "first" }, { name: "second" }] };
			const result = get(data, "items[0].name");
			expect(result).toBe("first");
		});

		it("should support consecutive bracket notation", () => {
			const data = {
				matrix: [
					[1, 2],
					[3, 4],
				],
			};
			expect(get(data, "matrix[0][0]")).toBe(1);
			expect(get(data, "matrix[1][1]")).toBe(4);
		});

		it("should support mixed dot and bracket notation", () => {
			const data = {
				users: [{ profile: { name: "Chen" } }, { profile: { name: "Amira" } }],
			};
			expect(get(data, "users[0].profile.name")).toBe("Chen");
			expect(get(data, "users[1].profile.name")).toBe("Amira");
		});

		it("should support wildcard in bracket notation", () => {
			const data = [{ name: "Chen" }, { name: "Amira" }];
			const result = get(data, "[$].name", true);
			expect(result).toEqual(["Chen", "Amira"]);
		});

		it("should support wildcard in brackets within path", () => {
			const data = {
				teams: [
					{ members: [{ name: "Yuki" }, { name: "Dao" }] },
					{ members: [{ name: "Elena" }] },
				],
			};
			const result = get(data, "teams[$].members[$].name", true);
			expect(result).toEqual(["Yuki", "Dao", "Elena"]);
		});

		it("should handle bracket notation without property after", () => {
			const data = { items: [1, 2, 3] };
			expect(get(data, "items[1]")).toBe(2);
		});

		it("should handle empty path segment gracefully", () => {
			const data = { a: { b: { c: "value" } } };
			expect(get(data, "a..b.c")).toBe(null); // Empty segment causes lookup failure
		});

		it("should maintain backward compatibility with dot notation", () => {
			const data = { user: { profile: { age: 25 } } };
			expect(get(data, "user.profile.age")).toBe(25);
		});
	});
});
