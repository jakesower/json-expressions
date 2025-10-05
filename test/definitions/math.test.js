import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({
  packs: [allExpressionsForTesting],
});
const { apply } = testEngine;

describe("binary arithmetic math expressions", () => {
  const binaryArimeticExpressions = {
    $add: (x, y) => x + y,
    $subtract: (x, y) => x - y,
    $multiply: (x, y) => x * y,
    $divide: (x, y) => x / y,
    $modulo: (x, y) => {
      const result = x % y;
      return result < 0 && y > 0
        ? result + y
        : result > 0 && y < 0
          ? result + y
          : result;
    },
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
      });
    });
  });

  describe("$add", () => {
    describe("basic functionality", () => {
      it("handles zero", () => {
        expect(apply({ $add: 0 }, 5)).toEqual(5);
      });
    });
  });

  describe("$subtract", () => {
    describe("basic functionality", () => {
      it("handles zero operand", () => {
        expect(apply({ $subtract: 0 }, 5)).toEqual(5);
      });
    });
  });

  describe("$multiply", () => {
    describe("basic functionality", () => {
      it("handles zero operand", () => {
        expect(apply({ $multiply: 0 }, 5)).toEqual(0);
      });

      it("handles fractions", () => {
        expect(apply({ $multiply: 0.5 }, 4)).toEqual(2);
      });
    });
  });

  describe("$divide", () => {
    describe("basic functionality", () => {
      it("handles fractions", () => {
        expect(apply({ $divide: 0.5 }, 1)).toEqual(2);
      });

      it("throws on division by zero", () => {
        expect(() => apply({ $divide: 0 }, 10)).toThrowError(
          "Division by zero",
        );
      });
    });
  });

  describe("$modulo", () => {
    describe("basic functionality", () => {
      it("handles zero dividend", () => {
        expect(apply({ $modulo: 5 }, 0)).toEqual(0);
      });

      it("throws on modulo by zero", () => {
        expect(() => apply({ $modulo: 0 }, 10)).toThrowError("Modulo by zero");
      });

      it("handles negative numbers", () => {
        expect(apply({ $modulo: 3 }, -1)).toEqual(2);
      });
    });
  });

  describe("$pow", () => {
    describe("basic functionality", () => {
      it("handles decimal exponents", () => {
        expect(apply({ $pow: 0.5 }, 9)).toBe(3); // 9^0.5 = sqrt(9) = 3
        expect(apply({ $pow: 0.5 }, 16)).toBe(4); // 16^0.5 = sqrt(16) = 4
        expect(apply({ $pow: 2 }, 1.5)).toBeCloseTo(2.25, 10); // 1.5^2 = 2.25
      });

      it("handles special cases", () => {
        expect(apply({ $pow: 2 }, 0)).toBe(0); // 0^2 = 0
        expect(apply({ $pow: 0 }, 1)).toBe(1); // 1^0 = 1
        expect(apply({ $pow: 2 }, -2)).toBe(4); // (-2)^2 = 4 (integer exponents work)
        expect(apply({ $pow: 0 }, 0)).toEqual(1);
      });

      it("should throw for complex number results (negative base with fractional exponent)", () => {
        expect(() => apply({ $pow: 0.5 }, -1)).toThrowError(
          "Complex numbers are not supported (negative base with fractional exponent)",
        );
        expect(() => apply({ $pow: 1.5 }, -4)).toThrowError(
          "Complex numbers are not supported (negative base with fractional exponent)",
        );
      });

      it("should throw for division by zero (0 raised to negative exponent)", () => {
        expect(() => apply({ $pow: -1 }, 0)).toThrowError(
          "Division by zero (0 raised to negative exponent)",
        );
        expect(() => apply({ $pow: -2 }, 0)).toThrowError(
          "Division by zero (0 raised to negative exponent)",
        );
        expect(() => apply({ $pow: -0.5 }, 0)).toThrowError(
          "Division by zero (0 raised to negative exponent)",
        );
      });
    });
  });
});

describe("Math expressions integration", () => {
  it("works with input data", () => {
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
  describe("basic functionality", () => {
    it("should return absolute value for Amara's temperature deviation", () => {
      expect(apply({ $abs: null }, 5)).toBe(5);
      expect(apply({ $abs: null }, -5)).toBe(5);
      expect(apply({ $abs: null }, 0)).toBe(0);
      expect(apply({ $abs: null }, -3.14)).toBe(3.14);
      expect(apply({ $abs: null }, 2.71)).toBe(2.71);
    });
  });
});

describe("$sqrt", () => {
  describe("basic functionality", () => {
    it("should calculate square roots for Arun's measurements", () => {
      expect(apply({ $sqrt: null }, 9)).toBe(3);
      expect(apply({ $sqrt: null }, 0)).toBe(0);
    });

    it("should handle decimal inputs for Maria's precision work", () => {
      expect(apply({ $sqrt: null }, 2.25)).toBe(1.5);
      expect(apply({ $sqrt: null }, 6.25)).toBe(2.5);
      expect(apply({ $sqrt: "ignored" }, 4)).toBe(2); // operand is ignored
    });

    it("should handle special cases for Elena's advanced problems", () => {
      expect(apply({ $sqrt: null }, 0.25)).toBe(0.5);
    });

    it("should throw for negative numbers (complex numbers not supported)", () => {
      expect(() => apply({ $sqrt: null }, -1)).toThrowError(
        "Complex numbers are not supported (square root of negative number)",
      );
      expect(() => apply({ $sqrt: null }, -0.5)).toThrowError(
        "Complex numbers are not supported (square root of negative number)",
      );
      expect(apply({ $sqrt: null }, Infinity)).toBe(Infinity);
    });
  });
});

describe("$count", () => {
  describe("basic functionality", () => {
    it("counts elements in array input data", () => {
      expect(apply({ $count: null }, [1, 2, 3, 4, 5])).toBe(5);
      expect(apply({ $count: null }, ["Amara", "Kenji", "Yuki"])).toBe(3);
      expect(apply({ $count: null }, [])).toBe(0);
    });

    it("counts elements in operand array", () => {
      expect(apply({ $count: [1, 2, 3] }, null)).toBe(3);
      expect(apply({ $count: { $literal: [4, 5] } }, null)).toBe(2);
    });

    it("counts result of expression operand", () => {
      expect(apply({ $count: { $get: "scores" } }, { scores: [1, 2, 3] })).toBe(
        3,
      );
    });

    it("counts single element", () => {
      expect(apply({ $count: null }, [42])).toBe(1);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $count: null }, "not array")).toThrowError(
        "$count requires array operand or input data",
      );
    });
  });
});

describe("$max", () => {
  describe("basic functionality", () => {
    it("finds maximum value in array input data", () => {
      expect(apply({ $max: null }, [1, 5, 3, 9, 2])).toBe(9);
      expect(apply({ $max: null }, [3.14, 2.71, 1.41])).toBe(3.14);
      expect(apply({ $max: null }, [-5, -2, -10])).toBe(-2);
    });

    it("finds maximum value in operand array", () => {
      expect(apply({ $max: [1, 5, 3] }, null)).toBe(5);
      expect(apply({ $max: { $get: "scores" } }, { scores: [10, 20, 15] })).toBe(
        20,
      );
    });

    it("handles single element array", () => {
      expect(apply({ $max: null }, [42])).toBe(42);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $max: null }, [])).toBe(null);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $max: null }, "not array")).toThrowError(
        "$max requires array operand or input data",
      );
    });
  });
});

describe("$mean", () => {
  describe("basic functionality", () => {
    it("calculates average of array input data", () => {
      expect(apply({ $mean: null }, [1, 2, 3, 4, 5])).toBe(3);
      expect(apply({ $mean: null }, [2, 4, 6])).toBe(4);
      expect(apply({ $mean: null }, [10])).toBe(10);
    });

    it("calculates average of operand array", () => {
      expect(apply({ $mean: [2, 4, 6] }, null)).toBe(4);
      expect(apply({ $mean: { $get: "values" } }, { values: [10, 20, 30] })).toBe(
        20,
      );
    });

    it("handles decimal results", () => {
      expect(apply({ $mean: null }, [1, 2])).toBe(1.5);
      expect(apply({ $mean: null }, [1, 2, 3])).toBeCloseTo(2, 10);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $mean: null }, [])).toBe(null);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $mean: null }, "not array")).toThrowError(
        "$mean requires array operand or input data",
      );
    });
  });
});

describe("$min", () => {
  describe("basic functionality", () => {
    it("finds minimum value in array input data", () => {
      expect(apply({ $min: null }, [1, 5, 3, 9, 2])).toBe(1);
      expect(apply({ $min: null }, [3.14, 2.71, 1.41])).toBe(1.41);
      expect(apply({ $min: null }, [-5, -2, -10])).toBe(-10);
    });

    it("finds minimum value in operand array", () => {
      expect(apply({ $min: [5, 1, 3] }, null)).toBe(1);
      expect(apply({ $min: { $get: "temps" } }, { temps: [10, -5, 20] })).toBe(
        -5,
      );
    });

    it("handles single element array", () => {
      expect(apply({ $min: null }, [42])).toBe(42);
    });

    it("returns undefined for empty array", () => {
      expect(apply({ $min: null }, [])).toBe(null);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $min: null }, "not array")).toThrowError(
        "$min requires array operand or input data",
      );
    });
  });
});

describe("$sum", () => {
  describe("basic functionality", () => {
    it("sums array input data", () => {
      expect(apply({ $sum: null }, [1, 2, 3, 4, 5])).toBe(15);
      expect(apply({ $sum: null }, [2.5, 1.5, 3])).toBe(7);
      expect(apply({ $sum: null }, [-1, 1, -2, 2])).toBe(0);
    });

    it("sums operand array", () => {
      expect(apply({ $sum: [1, 2, 3] }, null)).toBe(6);
      expect(apply({ $sum: { $get: "amounts" } }, { amounts: [10, 20, 30] })).toBe(
        60,
      );
    });

    it("handles single element array", () => {
      expect(apply({ $sum: null }, [42])).toBe(42);
    });

    it("returns 0 for empty array", () => {
      expect(apply({ $sum: null }, [])).toBe(0);
    });

    it("throws error for non-array input and operand", () => {
      expect(() => apply({ $sum: null }, "not array")).toThrowError(
        "$sum requires array operand or input data",
      );
    });
  });
});
