import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../src/index.js";
import { all } from "../src/packs/all.js";

// Sample daycare data
const children = [
  { name: "Zahra", age: 2, napDuration: 120, favoriteToy: "blocks" },
  { name: "Astrid", age: 3, napDuration: 90, favoriteToy: "cars" },
  { name: "Ximena", age: 4, napDuration: 60, favoriteToy: "dolls" },
  { name: "Nomsa", age: 5, napDuration: 0, favoriteToy: "puzzles" },
];

// Create custom expression engine with daycare-themed expressions
const customEngine = createExpressionEngine({
  packs: [all],
  custom: {
    // Simple case: Convert age from years to months
    $ageInMonths: {
      apply: (_, inputData) => {
        if (typeof inputData !== "number" || inputData < 0) {
          throw new Error("Age must be a non-negative number");
        }
        return inputData * 12;
      },
      evaluate: (operand, { evaluate }) => {
        return evaluate(operand) * 12;
      },
    },

    // Find children in age range using new pattern
    $findByAge: {
      apply: (operand, inputData, { apply }) =>
        inputData.find((child) => apply(operand, child.age)),
      evaluate: (operand, { apply }) => {
        const [predicate, childrenArray] = operand;
        return apply({ $findByAge: predicate }, childrenArray);
      },
    },

    // Delegation case: Calculate nap time score using built-in expressions
    $napTimeScore: {
      apply: (_, inputData, { apply }) => {
        // Get nap duration, default to 0 if not present
        const napMinutes = apply({ $get: "napDuration" }, inputData) || 0;

        // Age multiplier: younger children get higher scores for longer naps
        const ageMultiplier = apply(
          {
            $if: {
              if: { $lt: 3 },
              then: 2.0,
              else: 1.5,
            },
          },
          inputData.age,
        );

        // Bonus points for any nap time
        const baseBonus = apply(
          {
            $if: {
              if: { $gt: 0 },
              then: 10,
              else: 0,
            },
          },
          napMinutes,
        );

        return napMinutes * ageMultiplier + baseBonus;
      },
      evaluate: (operand, { apply, evaluate }) => {
        const child = evaluate(operand);
        return apply({ $napTimeScore: null }, child);
      },
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

    it("works with evaluate form", () => {
      expect(customEngine.evaluate({ $ageInMonths: 4 })).toBe(48);
      expect(customEngine.evaluate({ $ageInMonths: 1.5 })).toBe(18);
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

    it("works with evaluate form", () => {
      const result = customEngine.evaluate({
        $findByAge: [{ $eq: 2 }, children],
      });
      expect(result).toEqual({
        name: "Zahra",
        age: 2,
        napDuration: 120,
        favoriteToy: "blocks",
      });
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

  describe("$napTimeScore (delegation case)", () => {
    it("calculates nap time score using built-in expressions", () => {
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

    it("works with evaluate form", () => {
      const ximenaScore = customEngine.evaluate({
        $napTimeScore: {
          name: "Ximena",
          age: 4,
          napDuration: 60,
          favoriteToy: "dolls",
        },
      });
      // Ximena: age 4 (>= 3), napDuration 60 -> (60 * 1.5) + 10 = 100
      expect(ximenaScore).toBe(100);
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

    it("demonstrates delegation to multiple built-in expressions", () => {
      // This test verifies that $get, $if, $lt, $gt all work within our custom expression
      const testChild = { name: "Olumide", age: 2, napDuration: 100 };
      const score = customEngine.apply({ $napTimeScore: null }, testChild);

      // Verify the calculation uses the built-in expressions correctly
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
          $double: {
            apply: (operand, inputData) => inputData * 2,
            evaluate: (operand) => operand * 2,
          },
          $triple: {
            apply: (operand, inputData) => inputData * 3,
            evaluate: (operand) => operand * 3,
          },
        },
      });

      // Verify custom expressions work
      expect(customOnlyEngine.apply({ $double: null }, 5)).toBe(10);
      expect(customOnlyEngine.evaluate({ $triple: 4 })).toBe(12);

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
        packs: [all],
        custom: {
          // Override $add to do "monkey math" - concatenate numbers as strings
          $add: {
            apply: (operand, inputData) => {
              return parseInt(String(inputData) + String(operand));
            },
            evaluate: (operand) => {
              if (!Array.isArray(operand) || operand.length !== 2) {
                throw new Error(
                  "Monkey math $add requires array of exactly 2 elements",
                );
              }
              return parseInt(String(operand[0]) + String(operand[1]));
            },
          },
        },
      });

      // Test monkey math in apply form
      expect(monkeyMathEngine.apply({ $add: 1 }, 1)).toBe(11);
      expect(monkeyMathEngine.apply({ $add: 25 }, 20)).toBe(2025);
      expect(monkeyMathEngine.apply({ $add: 3 }, 456)).toBe(4563);

      // Test monkey math in evaluate form
      expect(monkeyMathEngine.evaluate({ $add: [1, 1] })).toBe(11);
      expect(monkeyMathEngine.evaluate({ $add: [20, 25] })).toBe(2025);
      expect(monkeyMathEngine.evaluate({ $add: [456, 3] })).toBe(4563);

      // Verify other math expressions still work normally
      expect(monkeyMathEngine.apply({ $multiply: 3 }, 5)).toBe(15);
      expect(monkeyMathEngine.apply({ $subtract: 2 }, 10)).toBe(8);

      // Test in complex expressions
      const result = monkeyMathEngine.evaluate({
        $multiply: [{ $add: [1, 2] }, 3],
      });
      expect(result).toBe(36); // (1+2=12) * 3 = 36 in monkey math
    });

    it("demonstrates function override precedence", () => {
      // First create normal engine
      const normalEngine = createExpressionEngine({ packs: [all] });
      expect(normalEngine.apply({ $add: 5 }, 10)).toBe(15);

      // Then create engine with override
      const overrideEngine = createExpressionEngine({
        packs: [all],
        custom: {
          $add: {
            apply: (operand, inputData) => inputData - operand, // Subtract instead!
            evaluate: (operand) => operand[0] - operand[1],
          },
        },
      });
      expect(overrideEngine.apply({ $add: 5 }, 10)).toBe(5); // 10 - 5 = 5

      // Verify the original engine is unaffected
      expect(normalEngine.apply({ $add: 5 }, 10)).toBe(15);
    });

    it("overrides work with daycare custom expressions", () => {
      // Create an engine with both overrides and new custom expressions
      const hybridEngine = createExpressionEngine({
        packs: [all],
        custom: {
          // Override built-in $count to count in "daycare style" (add 1 for teacher)
          $count: {
            apply: (operand) => operand.length + 1,
            evaluate: (operand) => operand.length + 1,
          },
          // Add new custom expression
          $ageInMonths: {
            apply: (_, inputData) => inputData * 12,
            evaluate: (operand) => operand * 12,
          },
        },
      });

      // Test the override
      expect(hybridEngine.apply({ $count: children }, null)).toBe(5);
      expect(hybridEngine.evaluate({ $count: [1, 2, 3] })).toBe(4);

      // Test the custom expression still works
      expect(hybridEngine.apply({ $ageInMonths: null }, 3)).toBe(36);

      // Test other built-ins are unaffected
      expect(hybridEngine.apply({ $sum: [1, 2, 3, 4] }, null)).toBe(10);
    });
  });
});
