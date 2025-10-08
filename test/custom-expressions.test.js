import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../src/index.js";
import { allExpressionsForTesting } from "../src/packs/all.js";

// Sample daycare data
const children = [
	{ name: "Zahra", age: 2, napDuration: 120, favoriteToy: "blocks" },
	{ name: "Astrid", age: 3, napDuration: 90, favoriteToy: "cars" },
	{ name: "Ximena", age: 4, napDuration: 60, favoriteToy: "dolls" },
	{ name: "Nomsa", age: 5, napDuration: 0, favoriteToy: "puzzles" },
];

// Create custom expression engine with daycare-themed expressions
const customEngine = createExpressionEngine({
	packs: [allExpressionsForTesting],
	custom: {
		// Simple case: Convert age from years to months
		$ageInMonths: (_, inputData) => {
			if (typeof inputData !== "number" || inputData < 0) {
				throw new Error("Age must be a non-negative number");
			}
			return inputData * 12;
		},

		// Find children in age range - ANTI-PATTERN: uses other expressions instead of complete implementation
		$findByAge: (operand, inputData) => {
			// Complete implementation: check age directly without delegating to other expressions
			return inputData.find((child) => {
				if (operand.$eq !== undefined) return child.age === operand.$eq;
				if (operand.$gte !== undefined) return child.age >= operand.$gte;
				if (operand.$lte !== undefined) return child.age <= operand.$lte;
				if (operand.$and) {
					return operand.$and.every((cond) => {
						if (cond.$gte !== undefined) return child.age >= cond.$gte;
						if (cond.$lte !== undefined) return child.age <= cond.$lte;
						return false;
					});
				}
				return false;
			});
		},

		// ANTI-PATTERN: Calculate nap time score using complete implementation instead of delegating
		$napTimeScore: (_, inputData) => {
			// Complete implementation: calculate directly without delegating to other expressions
			const napMinutes = inputData.napDuration ?? 0;
			const ageMultiplier = inputData.age < 3 ? 2.0 : 1.5;
			const baseBonus = napMinutes > 0 ? 10 : 0;
			return napMinutes * ageMultiplier + baseBonus;
		},
	},
});

describe("Custom Expressions", () => {
	describe("$ageInMonths (simple case)", () => {
		it("converts age from years to months", () => {
			expect(customEngine.apply({ $ageInMonths: null }, 3)).toBe(36);
			expect(customEngine.apply({ $ageInMonths: null }, 2.5)).toBe(30);
			expect(customEngine.apply({ $ageInMonths: null }, 0)).toBe(0);
		});

		it("throws error for invalid ages", () => {
			expect(() => customEngine.apply({ $ageInMonths: null }, -1)).toThrowError(
				"Age must be a non-negative number",
			);
			expect(() =>
				customEngine.apply({ $ageInMonths: null }, "three"),
			).toThrowError("Age must be a non-negative number");
		});
	});

	describe("$findByAge (array iteration case)", () => {
		it("finds children matching age predicate", () => {
			const result = customEngine.apply({ $findByAge: { $eq: 3 } }, children);
			expect(result).toEqual({
				name: "Astrid",
				age: 3,
				napDuration: 90,
				favoriteToy: "cars",
			});

			const older = customEngine.apply({ $findByAge: { $gte: 4 } }, children);
			expect(older).toEqual({
				name: "Ximena",
				age: 4,
				napDuration: 60,
				favoriteToy: "dolls",
			});
		});

		it("returns undefined when no match found", () => {
			const result = customEngine.apply({ $findByAge: { $eq: 10 } }, children);
			expect(result).toBeUndefined();
		});

		it("works with complex predicates", () => {
			const result = customEngine.apply(
				{
					$findByAge: {
						$and: [{ $gte: 3 }, { $lte: 4 }],
					},
				},
				children,
			);
			expect(result.name).toBe("Astrid"); // First match
		});
	});

	describe("$napTimeScore (complete implementation)", () => {
		it("calculates nap time score using complete implementation", () => {
			// Zahra: age 2 (< 3), napDuration 120 -> (120 * 2.0) + 10 = 250
			const zahraScore = customEngine.apply(
				{ $napTimeScore: null },
				children[0],
			);
			expect(zahraScore).toBe(250);

			// Astrid: age 3 (>= 3), napDuration 90 -> (90 * 1.5) + 10 = 145
			const astridScore = customEngine.apply(
				{ $napTimeScore: null },
				children[1],
			);
			expect(astridScore).toBe(145);

			// Nomsa: age 5, napDuration 0 -> (0 * 1.5) + 0 = 0
			const nomsaScore = customEngine.apply(
				{ $napTimeScore: null },
				children[3],
			);
			expect(nomsaScore).toBe(0);
		});

		it("handles missing napDuration gracefully", () => {
			const childWithoutNap = { name: "Kenji", age: 3 };
			const score = customEngine.apply(
				{ $napTimeScore: null },
				childWithoutNap,
			);
			// No nap duration -> (0 * 1.5) + 0 = 0
			expect(score).toBe(0);
		});

		it("demonstrates complete implementation without delegation", () => {
			// This test verifies the custom expression implements logic directly
			const testChild = { name: "Olumide", age: 2, napDuration: 100 };
			const score = customEngine.apply({ $napTimeScore: null }, testChild);

			// Verify the calculation uses direct implementation
			// Age 2 (< 3) -> multiplier 2.0
			// napDuration 100 (> 0) -> gets bonus 10
			// Score: (100 * 2.0) + 10 = 210
			expect(score).toBe(210);
		});
	});

	describe("Integration with existing expressions", () => {
		it("can be used within built-in expressions", () => {
			// Use custom expression within $map
			const agesInMonths = customEngine.apply(
				{
					$map: { $ageInMonths: null },
				},
				children.map((c) => c.age),
			);
			expect(agesInMonths).toEqual([24, 36, 48, 60]);

			// Use custom expression within $if
			const description = customEngine.apply(
				{
					$if: {
						if: { $gte: 36 }, // 3 years in months
						then: "Preschooler",
						else: "Toddler",
					},
				},
				customEngine.apply({ $ageInMonths: null }, 2.5),
			);
			expect(description).toBe("Toddler");
		});

		it("can be combined with filtering", () => {
			// Find all children with high nap scores
			const highScorers = customEngine.apply(
				{
					$filter: { $gte: 100 },
				},
				children.map((child) =>
					customEngine.apply({ $napTimeScore: null }, child),
				),
			);

			expect(highScorers).toEqual([250, 145, 100]); // Zahra, Astrid, Ximena
		});
	});

	describe("includeBase parameter", () => {
		it("creates engine with only custom expressions when includeBase=false", () => {
			// Create engine with only custom expressions (no core expressions)
			const customOnlyEngine = createExpressionEngine({
				includeBase: false,
				custom: {
					$double: (operand, inputData) => inputData * 2,
					$triple: (operand, inputData) => inputData * 3,
				},
			});

			// Verify custom expressions work
			expect(customOnlyEngine.apply({ $double: null }, 5)).toBe(10);

			// Verify core expressions are NOT available
			expect(() =>
				customOnlyEngine.apply({ $get: "name" }, { name: "test" }),
			).toThrowError(/Unknown expression operator: "\$get"/);

			expect(() => customOnlyEngine.apply({ $add: 5 }, 10)).toThrowError(
				/Unknown expression operator: "\$add"/,
			);

			// Verify only custom expressions and $literal are in expressionNames
			expect(customOnlyEngine.expressionNames).toEqual([
				"$double",
				"$triple",
				"$literal",
			]);
			expect(customOnlyEngine.expressionNames).not.toContain("$get");
			expect(customOnlyEngine.expressionNames).not.toContain("$add");
		});
	});

	describe("overriding built-in expressions", () => {
		it("overrides $add with monkey math (string concatenation)", () => {
			// Create engine that overrides built-in $add with custom implementation
			const monkeyMathEngine = createExpressionEngine({
				packs: [allExpressionsForTesting],
				custom: {
					// Override $add to do "monkey math" - concatenate numbers as strings
					$add: (operand, inputData) => {
						return parseInt(String(inputData) + String(operand));
					},
				},
			});

			// Test monkey math functionality
			expect(monkeyMathEngine.apply({ $add: 1 }, 1)).toBe(11);
			expect(monkeyMathEngine.apply({ $add: 25 }, 20)).toBe(2025);
			expect(monkeyMathEngine.apply({ $add: 3 }, 456)).toBe(4563);

			// Verify other math expressions still work normally
			expect(monkeyMathEngine.apply({ $multiply: 3 }, 5)).toBe(15);
			expect(monkeyMathEngine.apply({ $subtract: 2 }, 10)).toBe(8);
		});

		it("demonstrates function override precedence", () => {
			// First create normal engine
			const normalEngine = createExpressionEngine({
				packs: [allExpressionsForTesting],
			});
			expect(normalEngine.apply({ $add: 5 }, 10)).toBe(15);

			// Then create engine with override
			const overrideEngine = createExpressionEngine({
				packs: [allExpressionsForTesting],
				custom: {
					$add: (operand, inputData) => inputData - operand, // Subtract instead!
				},
			});
			expect(overrideEngine.apply({ $add: 5 }, 10)).toBe(5); // 10 - 5 = 5

			// Verify the original engine is unaffected
			expect(normalEngine.apply({ $add: 5 }, 10)).toBe(15);
		});

		it("overrides work with daycare custom expressions", () => {
			// Create an engine with both overrides and new custom expressions
			const hybridEngine = createExpressionEngine({
				packs: [allExpressionsForTesting],
				custom: {
					// Override built-in $count to count in "daycare style" (add 1 for teacher)
					$count: (operand, inputData) => inputData.length + 1,
					// Add new custom expression
					$ageInMonths: (_, inputData) => inputData * 12,
				},
			});

			// Test the override
			expect(hybridEngine.apply({ $count: null }, children)).toBe(5);

			// Test the custom expression still works
			expect(hybridEngine.apply({ $ageInMonths: null }, 3)).toBe(36);

			// Test other built-ins are unaffected
			expect(hybridEngine.apply({ $sum: null }, [1, 2, 3, 4])).toBe(10);
		});
	});
});
