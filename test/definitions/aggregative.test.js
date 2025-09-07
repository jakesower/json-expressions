import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

const ages = [3, 4, 5, 6, 2];
const temperatures = [98.6, 99.1, 97.8, 100.2, 98.9];
const emptyArray = [];
const singleValue = [42];

describe("$count", () => {
  it("counts elements in an array", () => {
    expect(apply({ $count: ages }, null)).toBe(5);
  });

  it("returns 0 for empty arrays", () => {
    expect(apply({ $count: emptyArray }, null)).toBe(0);
  });

  it("counts single element", () => {
    expect(apply({ $count: singleValue }, null)).toBe(1);
  });

  describe("evaluate form", () => {
    it("counts elements in static array", () => {
      expect(evaluate({ $count: [1, 2, 3, 4, 5] })).toBe(5);
    });

    it("returns 0 for empty array", () => {
      expect(evaluate({ $count: [] })).toBe(0);
    });
  });
});

describe("$max", () => {
  it("finds maximum value in array", () => {
    expect(apply({ $max: ages }, null)).toBe(6);
  });

  it("finds maximum with decimals", () => {
    expect(apply({ $max: temperatures }, null)).toBe(100.2);
  });

  it("returns undefined for empty arrays", () => {
    expect(apply({ $max: emptyArray }, null)).toBeUndefined();
  });

  it("returns single value for single element array", () => {
    expect(apply({ $max: singleValue }, null)).toBe(42);
  });

  it("handles negative values", () => {
    expect(apply({ $max: [-5, -1, -10] }, null)).toBe(-1);
  });

  describe("evaluate form", () => {
    it("finds maximum in static array", () => {
      expect(evaluate({ $max: [1, 5, 3, 9, 2] })).toBe(9);
    });

    it("returns undefined for empty array", () => {
      expect(evaluate({ $max: [] })).toBeUndefined();
    });
  });
});

describe("$min", () => {
  it("finds minimum value in array", () => {
    expect(apply({ $min: ages }, null)).toBe(2);
  });

  it("finds minimum with decimals", () => {
    expect(apply({ $min: temperatures }, null)).toBe(97.8);
  });

  it("returns undefined for empty arrays", () => {
    expect(apply({ $min: emptyArray }, null)).toBeUndefined();
  });

  it("returns single value for single element array", () => {
    expect(apply({ $min: singleValue }, null)).toBe(42);
  });

  it("handles negative values", () => {
    expect(apply({ $min: [-5, -1, -10] }, null)).toBe(-10);
  });

  describe("evaluate form", () => {
    it("finds minimum in static array", () => {
      expect(evaluate({ $min: [1, 5, 3, 9, 2] })).toBe(1);
    });

    it("returns undefined for empty array", () => {
      expect(evaluate({ $min: [] })).toBeUndefined();
    });
  });
});

describe("$sum", () => {
  it("sums values in array", () => {
    expect(apply({ $sum: ages }, null)).toBe(20);
  });

  it("sums decimal values", () => {
    expect(apply({ $sum: temperatures }, null)).toBeCloseTo(494.6);
  });

  it("returns 0 for empty arrays", () => {
    expect(apply({ $sum: emptyArray }, null)).toBe(0);
  });

  it("returns single value for single element array", () => {
    expect(apply({ $sum: singleValue }, null)).toBe(42);
  });

  it("handles negative values", () => {
    expect(apply({ $sum: [-5, 3, -2] }, null)).toBe(-4);
  });

  it("handles mixed positive and negative", () => {
    expect(apply({ $sum: [10, -5, 3, -8] }, null)).toBe(0);
  });

  describe("evaluate form", () => {
    it("sums static array directly", () => {
      expect(evaluate({ $sum: [1, 2, 3, 4] })).toEqual(10);
    });

    it("handles decimal values", () => {
      expect(evaluate({ $sum: [1.5, 2.3, 0.7] })).toBeCloseTo(4.5);
    });

    it("returns 0 for empty array", () => {
      expect(evaluate({ $sum: [] })).toBe(0);
    });

    it("handles negative values", () => {
      expect(evaluate({ $sum: [-3, 5, -1] })).toBe(1);
    });
  });
});

describe("$mean", () => {
  it("calculates mean of ages", () => {
    expect(apply({ $mean: ages }, null)).toBe(4);
  });

  it("calculates mean with decimals", () => {
    expect(apply({ $mean: temperatures }, null)).toBeCloseTo(98.92);
  });

  it("returns undefined for empty arrays", () => {
    expect(apply({ $mean: emptyArray }, null)).toBeUndefined();
  });

  it("returns single value for single element array", () => {
    expect(apply({ $mean: singleValue }, null)).toBe(42);
  });

  it("handles negative values", () => {
    expect(apply({ $mean: [-6, -3, 0, 3, 6] }, null)).toBe(0);
  });

  describe("evaluate form", () => {
    it("calculates mean of static array", () => {
      expect(evaluate({ $mean: [2, 4, 6, 8] })).toBe(5);
    });

    it("returns undefined for empty array", () => {
      expect(evaluate({ $mean: [] })).toBeUndefined();
    });
  });
});

describe("$median", () => {
  it("calculates median of odd-length array", () => {
    expect(apply({ $median: ages }, null)).toBe(4);
  });

  it("calculates median of even-length array", () => {
    expect(apply({ $median: [1, 2, 3, 4] }, null)).toBe(2.5);
  });

  it("returns undefined for empty arrays", () => {
    expect(apply({ $median: emptyArray }, null)).toBeUndefined();
  });

  it("returns single value for single element array", () => {
    expect(apply({ $median: singleValue }, null)).toBe(42);
  });

  it("handles unsorted data", () => {
    expect(apply({ $median: [5, 1, 3, 2, 4] }, null)).toBe(3);
  });

  it("handles duplicate values", () => {
    expect(apply({ $median: [1, 2, 2, 3] }, null)).toBe(2);
  });

  describe("evaluate form", () => {
    it("calculates median of static odd-length array", () => {
      expect(evaluate({ $median: [1, 3, 5, 7, 9] })).toBe(5);
    });

    it("calculates median of static even-length array", () => {
      expect(evaluate({ $median: [2, 4, 6, 8] })).toBe(5);
    });

    it("returns undefined for empty array", () => {
      expect(evaluate({ $median: [] })).toBeUndefined();
    });
  });
});
