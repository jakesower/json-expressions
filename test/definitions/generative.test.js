import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$random", () => {
  describe("apply form", () => {
    it("generates random numbers between 0 and 1 by default", () => {
      const result1 = apply({ $random: {} }, {});
      const result2 = apply({ $random: null }, {});

      expect(typeof result1).toBe("number");
      expect(typeof result2).toBe("number");
      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThan(1);
      expect(result2).toBeGreaterThanOrEqual(0);
      expect(result2).toBeLessThan(1);

      // Should be different values (extremely unlikely to be same)
      expect(result1).not.toBe(result2);
    });

    it("supports custom min and max values", () => {
      const result1 = apply({ $random: { min: 10, max: 20 } }, {});
      const result2 = apply({ $random: { min: -5, max: 5 } }, {});

      expect(result1).toBeGreaterThanOrEqual(10);
      expect(result1).toBeLessThan(20);
      expect(result2).toBeGreaterThanOrEqual(-5);
      expect(result2).toBeLessThan(5);
    });

    it("supports precision for decimal places", () => {
      const result1 = apply({ $random: { min: 0, max: 1, precision: 2 } }, {});
      const result2 = apply({ $random: { min: 0, max: 1, precision: 0 } }, {});

      // 2 decimal places
      expect(result1.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(
        2,
      );

      // Integer (0 decimal places)
      expect(Number.isInteger(result2)).toBe(true);
    });

    it("supports negative precision for coarse rounding", () => {
      const result = apply(
        { $random: { min: 0, max: 1000, precision: -1 } },
        {},
      );

      // Should be rounded to nearest 10
      expect(result % 10).toBe(0);
    });

    it("handles null precision (no rounding)", () => {
      const result1 = apply(
        { $random: { min: 0, max: 1, precision: null } },
        {},
      );
      const result2 = apply({ $random: { min: 0, max: 1 } }, {}); // precision omitted

      expect(typeof result1).toBe("number");
      expect(typeof result2).toBe("number");
      // No specific precision constraints
    });

    it("work within conditional expressions", () => {
      const result = apply(
        {
          $if: {
            if: true,
            then: { $random: null },
            else: "no",
          },
        },
        {},
      );

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });

    it("work in case expressions", () => {
      const result = apply(
        {
          $case: {
            value: "generate",
            cases: [{ when: "generate", then: { $random: null } }],
            default: "no",
          },
        },
        {},
      );

      expect(typeof result).toBe("number");
    });
  });

  describe("evaluate form", () => {
    it("can be evaluated statically with all options", () => {
      const result1 = evaluate({ $random: { min: 5, max: 10, precision: 1 } });
      const result2 = evaluate({ $random: {} });

      expect(result1).toBeGreaterThanOrEqual(5);
      expect(result1).toBeLessThan(10);
      expect(result1.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(
        1,
      );

      expect(result2).toBeGreaterThanOrEqual(0);
      expect(result2).toBeLessThan(1);
    });

    it("can be used in static evaluation of conditionals", () => {
      const result = evaluate({
        $if: {
          if: true,
          then: { $random: { min: 100, max: 200 } },
          else: "no",
        },
      });

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(100);
      expect(result).toBeLessThan(200);
    });
  });
});
