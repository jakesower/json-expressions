import { describe, expect, it } from "vitest";
import { defaultExpressionEngine } from "../../src/index.js";

const { apply, evaluate } = defaultExpressionEngine;

describe("$and", () => {
	describe("apply form", () => {
		it("returns true when all conditions are true", () => {
			const expression = {
				$and: [{ $gte: 4 }, { $lte: 6 }],
			};

			expect(apply(expression, 5)).toBe(true);
		});

		it("returns false when any condition is false", () => {
			const expression = {
				$and: [{ $gte: 4 }, { $lte: 6 }],
			};

			expect(apply(expression, 3)).toBe(false);
			expect(apply(expression, 7)).toBe(false);
		});
	});

	describe("evaluate form", () => {
		it("evaluates static boolean arrays", () => {
			expect(evaluate({ $and: [true, true, true] })).toBe(true);
			expect(evaluate({ $and: [true, false, true] })).toBe(false);
			expect(evaluate({ $and: [false, false, false] })).toBe(false);
			expect(evaluate({ $and: [] })).toBe(true); // empty array
		});
	});
});

describe("$or", () => {
	describe("apply form", () => {
		it("returns true when any condition is true", () => {
			const expression = {
				$or: [{ $eq: "apple" }, { $eq: "banana" }],
			};

			expect(apply(expression, "apple")).toBe(true);
			expect(apply(expression, "banana")).toBe(true);
			expect(apply(expression, "cherry")).toBe(false);
		});
	});

	describe("evaluate form", () => {
		it("evaluates static boolean arrays", () => {
			expect(evaluate({ $or: [false, false, true] })).toBe(true);
			expect(evaluate({ $or: [true, false, false] })).toBe(true);
			expect(evaluate({ $or: [false, false, false] })).toBe(false);
			expect(evaluate({ $or: [] })).toBe(false); // empty array
		});
	});
});

describe("$not", () => {
	describe("apply form", () => {
		it("returns opposite of the condition", () => {
			const expression = {
				$not: { $gt: 5 },
			};

			expect(apply(expression, 3)).toBe(true);
			expect(apply(expression, 7)).toBe(false);
		});
	});

	describe("evaluate form", () => {
		it("evaluate with boolean", () => {
			expect(evaluate({ $not: true })).toBe(false);
			expect(evaluate({ $not: false })).toBe(true);
		});

		it("evaluate with expression", () => {
			expect(evaluate({ $not: { $eq: [5, 5] } })).toBe(false);
			expect(evaluate({ $not: { $eq: [5, 10] } })).toBe(true);
		});
	});
});