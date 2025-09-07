import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$add", () => {
  describe("apply form", () => {
    it("adds operand to input data", () => {
      expect(apply({ $add: 3 }, 5)).toEqual(8);
    });

    it("handles negative numbers", () => {
      expect(apply({ $add: -2 }, 10)).toEqual(8);
    });

    it("handles zero", () => {
      expect(apply({ $add: 0 }, 5)).toEqual(5);
    });
  });

  describe("evaluate form", () => {
    it("evaluates addition of two numbers", () => {
      expect(evaluate({ $add: [2, 3] })).toEqual(5);
    });

    it("handles negative numbers", () => {
      expect(evaluate({ $add: [-1, -2] })).toEqual(-3);
    });

    it("throws with wrong array length", () => {
      expect(() => evaluate({ $add: [1, 2, 3] })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });

    it("throws with non-array operand", () => {
      expect(() => evaluate({ $add: "invalid" })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("$subtract", () => {
  describe("apply form", () => {
    it("subtracts operand from input data", () => {
      expect(apply({ $subtract: 3 }, 10)).toEqual(7);
    });

    it("handles negative operand", () => {
      expect(apply({ $subtract: -2 }, 5)).toEqual(7);
    });

    it("handles zero operand", () => {
      expect(apply({ $subtract: 0 }, 5)).toEqual(5);
    });
  });

  describe("evaluate form", () => {
    it("evaluates subtraction of two numbers", () => {
      expect(evaluate({ $subtract: [10, 3] })).toEqual(7);
    });

    it("handles negative numbers", () => {
      expect(evaluate({ $subtract: [-5, -2] })).toEqual(-3);
    });

    it("throws with wrong array length", () => {
      expect(() => evaluate({ $subtract: [1, 2, 3] })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });

    it("throws with non-array operand", () => {
      expect(() => evaluate({ $subtract: "invalid" })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("$multiply", () => {
  describe("apply form", () => {
    it("multiplies input data by operand", () => {
      expect(apply({ $multiply: 3 }, 5)).toEqual(15);
    });

    it("handles negative operand", () => {
      expect(apply({ $multiply: -2 }, 5)).toEqual(-10);
    });

    it("handles zero operand", () => {
      expect(apply({ $multiply: 0 }, 5)).toEqual(0);
    });

    it("handles fractions", () => {
      expect(apply({ $multiply: 0.5 }, 4)).toEqual(2);
    });
  });

  describe("evaluate form", () => {
    it("evaluates multiplication of two numbers", () => {
      expect(evaluate({ $multiply: [6, 7] })).toEqual(42);
    });

    it("handles negative numbers", () => {
      expect(evaluate({ $multiply: [-2, 3] })).toEqual(-6);
    });

    it("handles zero", () => {
      expect(evaluate({ $multiply: [5, 0] })).toEqual(0);
    });

    it("throws with wrong array length", () => {
      expect(() => evaluate({ $multiply: [1, 2, 3] })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });

    it("throws with non-array operand", () => {
      expect(() => evaluate({ $multiply: "invalid" })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("$divide", () => {
  describe("apply form", () => {
    it("divides input data by operand", () => {
      expect(apply({ $divide: 3 }, 15)).toEqual(5);
    });

    it("handles negative operand", () => {
      expect(apply({ $divide: -2 }, 10)).toEqual(-5);
    });

    it("handles fractions", () => {
      expect(apply({ $divide: 0.5 }, 1)).toEqual(2);
    });

    it("throws on division by zero", () => {
      expect(() => apply({ $divide: 0 }, 10)).toThrowError("Division by zero");
    });
  });

  describe("evaluate form", () => {
    it("evaluates division of two numbers", () => {
      expect(evaluate({ $divide: [15, 3] })).toEqual(5);
    });

    it("handles negative numbers", () => {
      expect(evaluate({ $divide: [-10, 2] })).toEqual(-5);
    });

    it("handles fractions", () => {
      expect(evaluate({ $divide: [1, 0.5] })).toEqual(2);
    });

    it("throws on division by zero", () => {
      expect(() => evaluate({ $divide: [10, 0] })).toThrowError(
        "Division by zero",
      );
    });

    it("throws with wrong array length", () => {
      expect(() => evaluate({ $divide: [1, 2, 3] })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });

    it("throws with non-array operand", () => {
      expect(() => evaluate({ $divide: "invalid" })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("$modulo", () => {
  describe("apply form", () => {
    it("computes input data modulo operand", () => {
      expect(apply({ $modulo: 3 }, 10)).toEqual(1);
    });

    it("handles negative numbers", () => {
      expect(apply({ $modulo: 3 }, -10)).toEqual(-1);
      expect(apply({ $modulo: -3 }, 10)).toEqual(1);
    });

    it("handles zero dividend", () => {
      expect(apply({ $modulo: 5 }, 0)).toEqual(0);
    });

    it("throws on modulo by zero", () => {
      expect(() => apply({ $modulo: 0 }, 10)).toThrowError("Modulo by zero");
    });
  });

  describe("evaluate form", () => {
    it("evaluates modulo of two numbers", () => {
      expect(evaluate({ $modulo: [10, 3] })).toEqual(1);
    });

    it("handles negative numbers", () => {
      expect(evaluate({ $modulo: [-10, 3] })).toEqual(-1);
      expect(evaluate({ $modulo: [10, -3] })).toEqual(1);
    });

    it("handles zero dividend", () => {
      expect(evaluate({ $modulo: [0, 5] })).toEqual(0);
    });

    it("throws on modulo by zero", () => {
      expect(() => evaluate({ $modulo: [10, 0] })).toThrowError(
        "Modulo by zero",
      );
    });

    it("throws with wrong array length", () => {
      expect(() => evaluate({ $modulo: [1, 2, 3] })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });

    it("throws with non-array operand", () => {
      expect(() => evaluate({ $modulo: "invalid" })).toThrowError(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("Math expressions integration", () => {
  it("can be combined with other expressions using evaluate form", () => {
    const result = evaluate({
      $add: [{ $multiply: [2, 3] }, { $subtract: [10, 4] }],
    });
    expect(result).toEqual(12); // (2*3) + (10-4) = 6 + 6 = 12
  });

  it("works with nested operations", () => {
    const result = evaluate({
      $divide: [{ $add: [10, 5] }, { $subtract: [8, 5] }],
    });
    expect(result).toEqual(5); // (10+5) / (8-5) = 15 / 3 = 5
  });

  it("uses modulo in calculations", () => {
    const result = evaluate({
      $modulo: [{ $add: [7, 8] }, 4],
    });
    expect(result).toEqual(3); // (7+8) % 4 = 15 % 4 = 3
  });

  it("apply form works with input data", () => {
    const result = apply({ $multiply: 3 }, 5);
    expect(result).toEqual(15); // 5 * 3 = 15
  });

  it("can chain apply operations", () => {
    // First multiply by 2, then add 1
    const step1 = apply({ $multiply: 2 }, 5); // 10
    const step2 = apply({ $add: 1 }, step1); // 11
    expect(step2).toEqual(11);
  });
});

describe("$abs", () => {
  describe("apply form", () => {
    it("should return absolute value for Amara's temperature deviation", () => {
      expect(apply({ $abs: null }, 5)).toBe(5);
      expect(apply({ $abs: null }, -5)).toBe(5);
      expect(apply({ $abs: null }, 0)).toBe(0);
      expect(apply({ $abs: null }, -3.14)).toBe(3.14);
      expect(apply({ $abs: null }, 2.71)).toBe(2.71);
    });

    it("should handle edge cases for Kenji's measurement errors", () => {
      expect(apply({ $abs: null }, -Infinity)).toBe(Infinity);
      expect(apply({ $abs: null }, Infinity)).toBe(Infinity);
      expect(apply({ $abs: "ignored" }, -42)).toBe(42); // operand is ignored
    });
  });

  describe("evaluate form", () => {
    it("should evaluate absolute value for Elena's score differences", () => {
      expect(evaluate({ $abs: 15 })).toBe(15);
      expect(evaluate({ $abs: -15 })).toBe(15);
      expect(evaluate({ $abs: 0 })).toBe(0);
      expect(evaluate({ $abs: -0.5 })).toBe(0.5);
    });

    it("should work with complex expressions for Yuki's deviation calculation", () => {
      expect(evaluate({ $abs: { $subtract: [3, 8] } })).toBe(5);
      expect(evaluate({ $abs: { $multiply: [-2, 4] } })).toBe(8);
    });

    it("should handle nested expressions for Fatima's error analysis", () => {
      expect(
        evaluate({
          $abs: {
            $divide: [{ $subtract: [10, 20] }, 2],
          },
        }),
      ).toBe(5); // abs((10 - 20) / 2) = abs(-10 / 2) = abs(-5) = 5
    });
  });
});

describe("$pow", () => {
  describe("apply form", () => {
    it("should calculate powers for Diego's growth rate", () => {
      expect(apply({ $pow: 2 }, 3)).toBe(9); // 3^2 = 9
      expect(apply({ $pow: 3 }, 2)).toBe(8); // 2^3 = 8
      expect(apply({ $pow: 0 }, 5)).toBe(1); // 5^0 = 1
      expect(apply({ $pow: 1 }, 10)).toBe(10); // 10^1 = 10
    });

    it("should handle decimal exponents for Priya's area calculations", () => {
      expect(apply({ $pow: 0.5 }, 9)).toBe(3); // 9^0.5 = sqrt(9) = 3
      expect(apply({ $pow: 0.5 }, 16)).toBe(4); // 16^0.5 = sqrt(16) = 4
      expect(apply({ $pow: 2 }, 1.5)).toBeCloseTo(2.25, 10); // 1.5^2 = 2.25
    });

    it("should handle negative bases for Sana's physics problems", () => {
      expect(apply({ $pow: 2 }, -3)).toBe(9); // (-3)^2 = 9
      expect(apply({ $pow: 3 }, -2)).toBe(-8); // (-2)^3 = -8
      expect(apply({ $pow: -1 }, 2)).toBe(0.5); // 2^(-1) = 0.5
    });

    it("should handle special cases for Rajesh's advanced math", () => {
      expect(apply({ $pow: 2 }, 0)).toBe(0); // 0^2 = 0
      expect(apply({ $pow: 0 }, 1)).toBe(1); // 1^0 = 1
      expect(Number.isNaN(apply({ $pow: 0.5 }, -1))).toBe(true); // (-1)^0.5 = NaN
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static power calculations for Nina's assignments", () => {
      expect(evaluate({ $pow: [2, 3] })).toBe(8); // 2^3 = 8
      expect(evaluate({ $pow: [5, 2] })).toBe(25); // 5^2 = 25
      expect(evaluate({ $pow: [10, 0] })).toBe(1); // 10^0 = 1
    });

    it("should work with nested expressions for Chen's compound calculations", () => {
      expect(
        evaluate({ $pow: [{ $add: [1, 1] }, { $multiply: [2, 2] }] }),
      ).toBe(16); // (1+1)^(2*2) = 2^4 = 16
      expect(evaluate({ $pow: [3, { $subtract: [5, 3] }] })).toBe(9); // 3^(5-3) = 3^2 = 9
    });

    it("should handle decimal calculations for Aria's geometry", () => {
      expect(evaluate({ $pow: [2.5, 2] })).toBe(6.25); // 2.5^2 = 6.25
      expect(evaluate({ $pow: [8, { $divide: [1, 3] }] })).toBe(2); // 8^(1/3) = 2
    });

    it("should validate array length for Zahra's error checking", () => {
      expect(() => evaluate({ $pow: [1, 2, 3] })).toThrow(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
      expect(() => evaluate({ $pow: [1] })).toThrow(
        "Math expressions require array of exactly 2 elements in evaluate form",
      );
    });
  });
});

describe("$sqrt", () => {
  describe("apply form", () => {
    it("should calculate square roots for Arun's measurements", () => {
      expect(apply({ $sqrt: null }, 9)).toBe(3);
      expect(apply({ $sqrt: null }, 16)).toBe(4);
      expect(apply({ $sqrt: null }, 25)).toBe(5);
      expect(apply({ $sqrt: null }, 0)).toBe(0);
      expect(apply({ $sqrt: null }, 1)).toBe(1);
    });

    it("should handle decimal inputs for Maria's precision work", () => {
      expect(apply({ $sqrt: null }, 2.25)).toBe(1.5);
      expect(apply({ $sqrt: null }, 6.25)).toBe(2.5);
      expect(apply({ $sqrt: "ignored" }, 4)).toBe(2); // operand is ignored
    });

    it("should handle special cases for Elena's advanced problems", () => {
      expect(apply({ $sqrt: null }, 0.25)).toBe(0.5);
      expect(Number.isNaN(apply({ $sqrt: null }, -1))).toBe(true); // sqrt(-1) = NaN
      expect(apply({ $sqrt: null }, Infinity)).toBe(Infinity);
    });
  });

  describe("evaluate form", () => {
    it("should evaluate static square root calculations for Yuki's homework", () => {
      expect(evaluate({ $sqrt: 64 })).toBe(8);
      expect(evaluate({ $sqrt: 100 })).toBe(10);
      expect(evaluate({ $sqrt: 144 })).toBe(12);
      expect(evaluate({ $sqrt: 0.16 })).toBe(0.4);
    });

    it("should work with complex expressions for Fatima's area calculations", () => {
      expect(evaluate({ $sqrt: { $add: [9, 16] } })).toBe(5);
      expect(evaluate({ $sqrt: { $multiply: [2, 8] } })).toBe(4);
    });

    it("should handle nested mathematical operations for Diego's physics", () => {
      expect(
        evaluate({
          $sqrt: {
            $pow: [{ $add: [3, 1] }, 2],
          },
        }),
      ).toBe(4); // sqrt((3 + 1)^2) = sqrt(4^2) = sqrt(16) = 4

      expect(
        evaluate({
          $sqrt: {
            $subtract: [{ $multiply: [5, 5] }, 9],
          },
        }),
      ).toBe(4); // sqrt((5 * 5) - 9) = sqrt(25 - 9) = sqrt(16) = 4
    });

    it("should preserve precision for Priya's scientific calculations", () => {
      expect(evaluate({ $sqrt: 2 })).toBeCloseTo(1.4142135623730951, 15);
      expect(evaluate({ $sqrt: 3 })).toBeCloseTo(1.7320508075688772, 15);
      expect(evaluate({ $sqrt: { $divide: [1, 4] } })).toBe(0.5);
    });
  });
});
