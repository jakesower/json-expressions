import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply, evaluate } = testEngine;

describe("binary arithmetic math expressions", () => {
  const binaryArimeticExpressions = {
    $add: (x, y) => x + y,
    $subtract: (x, y) => x - y,
    $multiply: (x, y) => x * y,
    $divide: (x, y) => x / y,
    $modulo: (x, y) => x % y,
    $pow: (x, y) => x ** y,
  };

  describe("common features", () => {
    Object.entries(binaryArimeticExpressions).forEach(([expr, fn]) => {
      describe(expr, () => {
        describe("apply", () => {
          it("applies the operation to input data", () => {
            expect(apply({ [expr]: 3 }, 5)).toEqual(fn(5, 3));
          });

          it("handles array form", () => {
            expect(apply({ [expr]: [{ $get: "age" }, 3] }, { age: 3 })).toEqual(
              fn(3, 3),
            );
          });

          it("handles negative operand", () => {
            expect(apply({ [expr]: -2 }, 5)).toEqual(fn(5, -2));
          });

          it("throws with wrong array length", () => {
            expect(() => apply({ [expr]: [1, 2, 3] }, {})).toThrowError(
              "Math expressions in array form require exactly 2 elements",
            );
          });
        });

        describe("evaluate", () => {
          it("evaluates array form", () => {
            expect(evaluate({ [expr]: [2, 3] })).toEqual(fn(2, 3));
          });

          it("handles negative numbers", () => {
            expect(evaluate({ [expr]: [-2, 3] })).toEqual(fn(-2, 3));
          });

          it("handles nested expressions", () => {
            expect(evaluate({ [expr]: [{ $identity: 3 }, 5] })).toEqual(
              fn(3, 5),
            );
          });

          it("throws with wrong array length", () => {
            expect(() => evaluate({ [expr]: [1, 2, 3] })).toThrowError(
              "Math expressions require array of exactly 2 elements in evaluate form",
            );
          });

          it("throws with non-array operand", () => {
            expect(() => evaluate({ [expr]: "invalid" })).toThrowError(
              "Math expressions require array of exactly 2 elements in evaluate form",
            );
          });
        });
      });
    });
  });

  describe("$add", () => {
    describe("apply form", () => {
      it("handles zero", () => {
        expect(apply({ $add: 0 }, 5)).toEqual(5);
      });
    });
  });

  describe("$subtract", () => {
    describe("apply form", () => {
      it("handles zero operand", () => {
        expect(apply({ $subtract: 0 }, 5)).toEqual(5);
      });
    });
  });

  describe("$multiply", () => {
    describe("apply form", () => {
      it("handles zero operand", () => {
        expect(apply({ $multiply: 0 }, 5)).toEqual(0);
      });

      it("handles fractions", () => {
        expect(apply({ $multiply: 0.5 }, 4)).toEqual(2);
      });
    });

    describe("evaluate form", () => {
      it("handles zero", () => {
        expect(evaluate({ $multiply: [5, 0] })).toEqual(0);
      });
    });
  });

  describe("$divide", () => {
    describe("apply form", () => {
      it("handles fractions", () => {
        expect(apply({ $divide: 0.5 }, 1)).toEqual(2);
      });

      it("throws on division by zero", () => {
        expect(() => apply({ $divide: 0 }, 10)).toThrowError(
          "Division by zero",
        );
      });
    });

    describe("evaluate form", () => {
      it("handles fractions", () => {
        expect(evaluate({ $divide: [1, 0.5] })).toEqual(2);
      });

      it("throws on division by zero", () => {
        expect(() => evaluate({ $divide: [10, 0] })).toThrowError(
          "Division by zero",
        );
      });
    });
  });

  describe("$modulo", () => {
    describe("apply form", () => {
      it("handles zero dividend", () => {
        expect(apply({ $modulo: 5 }, 0)).toEqual(0);
      });

      it("throws on modulo by zero", () => {
        expect(() => apply({ $modulo: 0 }, 10)).toThrowError("Modulo by zero");
      });
    });

    describe("evaluate form", () => {
      it("handles zero dividend", () => {
        expect(evaluate({ $modulo: [0, 5] })).toEqual(0);
      });

      it("throws on modulo by zero", () => {
        expect(() => evaluate({ $modulo: [10, 0] })).toThrowError(
          "Modulo by zero",
        );
      });
    });
  });

  describe("$pow", () => {
    describe("apply form", () => {
      it("handles decimal exponents", () => {
        expect(apply({ $pow: 0.5 }, 9)).toBe(3); // 9^0.5 = sqrt(9) = 3
        expect(apply({ $pow: 0.5 }, 16)).toBe(4); // 16^0.5 = sqrt(16) = 4
        expect(apply({ $pow: 2 }, 1.5)).toBeCloseTo(2.25, 10); // 1.5^2 = 2.25
      });

      it("handles special cases", () => {
        expect(apply({ $pow: 2 }, 0)).toBe(0); // 0^2 = 0
        expect(apply({ $pow: 0 }, 1)).toBe(1); // 1^0 = 1
        expect(Number.isNaN(apply({ $pow: 0.5 }, -1))).toBe(true); // (-1)^0.5 = NaN
      });
    });

    describe("evaluate form", () => {
      it("handles decimal calculations", () => {
        expect(evaluate({ $pow: [2.5, 2] })).toBe(6.25); // 2.5^2 = 6.25
        expect(evaluate({ $pow: [8, { $divide: [1, 3] }] })).toBe(2); // 8^(1/3) = 2
      });
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


describe("$count", () => {
  describe("apply form", () => {
    it("counts elements in array", () => {
      expect(apply({ $count: { $literal: [1, 2, 3, 4, 5] } }, {})).toBe(5);
      expect(
        apply({ $count: { $literal: ["Amara", "Kenji", "Yuki"] } }, {}),
      ).toBe(3);
      expect(apply({ $count: { $literal: [] } }, {})).toBe(0);
    });

    it("counts single element", () => {
      expect(apply({ $count: { $literal: [42] } }, {})).toBe(1);
    });
  });

  describe("evaluate form", () => {
    it("counts elements in static arrays", () => {
      expect(evaluate({ $count: [1, 2, 3, 4, 5] })).toBe(5);
      expect(evaluate({ $count: ["Yuki", "Dao", "Elena"] })).toBe(3);
      expect(evaluate({ $count: [] })).toBe(0);
    });
  });
});

describe("$max", () => {
  describe("apply form", () => {
    it("finds maximum value in array", () => {
      expect(apply({ $max: { $literal: [1, 5, 3, 9, 2] } }, {})).toBe(9);
      expect(apply({ $max: { $literal: [3.14, 2.71, 1.41] } }, {})).toBe(3.14);
      expect(apply({ $max: { $literal: [-5, -2, -10] } }, {})).toBe(-2);
    });

    it("handles single element array", () => {
      expect(apply({ $max: { $literal: [42] } }, {})).toBe(42);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $max: { $literal: [] } }, {})).toBe(undefined);
    });
  });

  describe("evaluate form", () => {
    it("finds maximum in static arrays", () => {
      expect(evaluate({ $max: [1, 5, 3, 9, 2] })).toBe(9);
      expect(evaluate({ $max: [3.14, 2.71, 1.41] })).toBe(3.14);
      expect(evaluate({ $max: [] })).toBe(undefined);
    });
  });
});

describe("$mean", () => {
  describe("apply form", () => {
    it("calculates average of array elements", () => {
      expect(apply({ $mean: { $literal: [1, 2, 3, 4, 5] } }, {})).toBe(3);
      expect(apply({ $mean: { $literal: [2, 4, 6] } }, {})).toBe(4);
      expect(apply({ $mean: { $literal: [10] } }, {})).toBe(10);
    });

    it("handles decimal results", () => {
      expect(apply({ $mean: { $literal: [1, 2] } }, {})).toBe(1.5);
      expect(apply({ $mean: { $literal: [1, 2, 3] } }, {})).toBeCloseTo(2, 10);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $mean: { $literal: [] } }, {})).toBe(undefined);
    });
  });

  describe("evaluate form", () => {
    it("calculates mean of static arrays", () => {
      expect(evaluate({ $mean: [1, 2, 3, 4, 5] })).toBe(3);
      expect(evaluate({ $mean: [2, 4, 6] })).toBe(4);
      expect(evaluate({ $mean: [] })).toBe(undefined);
    });
  });
});

describe("$min", () => {
  describe("apply form", () => {
    it("finds minimum value in array", () => {
      expect(apply({ $min: { $literal: [1, 5, 3, 9, 2] } }, {})).toBe(1);
      expect(apply({ $min: { $literal: [3.14, 2.71, 1.41] } }, {})).toBe(1.41);
      expect(apply({ $min: { $literal: [-5, -2, -10] } }, {})).toBe(-10);
    });

    it("handles single element array", () => {
      expect(apply({ $min: { $literal: [42] } }, {})).toBe(42);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $min: { $literal: [] } }, {})).toBe(undefined);
    });
  });

  describe("evaluate form", () => {
    it("finds minimum in static arrays", () => {
      expect(evaluate({ $min: [1, 5, 3, 9, 2] })).toBe(1);
      expect(evaluate({ $min: [3.14, 2.71, 1.41] })).toBe(1.41);
      expect(evaluate({ $min: [] })).toBe(undefined);
    });
  });
});

describe("$sum", () => {
  describe("apply form", () => {
    it("sums array elements", () => {
      expect(apply({ $sum: { $literal: [1, 2, 3, 4, 5] } }, {})).toBe(15);
      expect(apply({ $sum: { $literal: [2.5, 1.5, 3] } }, {})).toBe(7);
      expect(apply({ $sum: { $literal: [-1, 1, -2, 2] } }, {})).toBe(0);
    });

    it("handles single element array", () => {
      expect(apply({ $sum: { $literal: [42] } }, {})).toBe(42);
    });

    it("returns 0 for empty array", () => {
      expect(apply({ $sum: { $literal: [] } }, {})).toBe(0);
    });
  });

  describe("evaluate form", () => {
    it("sums static arrays", () => {
      expect(evaluate({ $sum: [1, 2, 3, 4, 5] })).toBe(15);
      expect(evaluate({ $sum: [2.5, 1.5, 3] })).toBe(7);
      expect(evaluate({ $sum: [] })).toBe(0);
    });
  });
});
