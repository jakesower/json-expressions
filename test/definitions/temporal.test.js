import { describe, it, expect } from "vitest";
import { createExpressionEngine } from "../../src/expression-engine.js";
import { temporal } from "../../src/packs/temporal.js";

const engine = createExpressionEngine({ packs: [temporal] });

describe("Temporal Expressions", () => {
	describe("$addTime", () => {
		it("should add single unit duration (operand form)", () => {
			const result = engine.apply(
				{ $addTime: { days: 7 } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2025-10-12T00:00:00.000Z");
		});

		it("should add multiple unit duration (operand form)", () => {
			const result = engine.apply(
				{ $addTime: { days: 7, hours: 2, minutes: 30 } },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe("2025-10-12T12:30:00.000Z");
		});

		it("should subtract with negative values", () => {
			const result = engine.apply(
				{ $addTime: { days: -3 } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2025-10-02T00:00:00.000Z");
		});

		it("should work with array form", () => {
			const result = engine.apply(
				{ $addTime: ["2025-10-05T00:00:00.000Z", { days: 7 }] },
				null,
			);
			expect(result).toBe("2025-10-12T00:00:00.000Z");
		});

		it("should handle month boundaries", () => {
			const result = engine.apply(
				{ $addTime: { days: 1 } },
				"2025-10-31T00:00:00.000Z",
			);
			expect(result).toBe("2025-11-01T00:00:00.000Z");
		});

		it("should add months", () => {
			const result = engine.apply(
				{ $addTime: { months: 3 } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2026-01-05T00:00:00.000Z");
		});

		it("should add years", () => {
			const result = engine.apply(
				{ $addTime: { years: 5 } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2030-10-05T00:00:00.000Z");
		});

		it("should add weeks", () => {
			const result = engine.apply(
				{ $addTime: { weeks: 2 } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2025-10-19T00:00:00.000Z");
		});

		it("should add hours", () => {
			const result = engine.apply(
				{ $addTime: { hours: 5 } },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe("2025-10-05T15:00:00.000Z");
		});

		it("should add minutes", () => {
			const result = engine.apply(
				{ $addTime: { minutes: 45 } },
				"2025-10-05T10:15:00.000Z",
			);
			expect(result).toBe("2025-10-05T11:00:00.000Z");
		});

		it("should add seconds", () => {
			const result = engine.apply(
				{ $addTime: { seconds: 30 } },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe("2025-10-05T10:00:30.000Z");
		});

		it("should throw error for invalid duration object", () => {
			expect(() =>
				engine.apply({ $addTime: "invalid" }, "2025-10-05T00:00:00.000Z"),
			).toThrow("$addTime operand must be an object with time unit properties");
		});

		it("should throw error for unknown time unit", () => {
			expect(() =>
				engine.apply({ $addTime: { decades: 1 } }, "2025-10-05T00:00:00.000Z"),
			).toThrow("Unknown time unit: decades");
		});
	});

	describe("$diffTime", () => {
		it("should calculate difference in days (operand form)", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2025-12-25T00:00:00.000Z", unit: "days" } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(81); // days between Oct 5 and Dec 25
		});

		it("should calculate difference in hours (operand form)", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2025-10-05T15:00:00.000Z", unit: "hours" } },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe(5);
		});

		it("should work with array form", () => {
			const result = engine.apply(
				{
					$diffTime: [
						"2025-10-05T00:00:00.000Z",
						"2025-12-25T00:00:00.000Z",
						"days",
					],
				},
				null,
			);
			expect(result).toBe(81);
		});

		it("should calculate difference in months", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2026-01-05T00:00:00.000Z", unit: "months" } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(3);
		});

		it("should calculate difference in years", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2030-10-05T00:00:00.000Z", unit: "years" } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(5);
		});

		it("should calculate difference in weeks", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2025-10-19T00:00:00.000Z", unit: "weeks" } },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(2);
		});

		it("should calculate difference in minutes", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2025-10-05T11:00:00.000Z", unit: "minutes" } },
				"2025-10-05T10:15:00.000Z",
			);
			expect(result).toBe(45);
		});

		it("should calculate difference in seconds", () => {
			const result = engine.apply(
				{ $diffTime: { date: "2025-10-05T10:00:30.000Z", unit: "seconds" } },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe(30);
		});

		it("should throw error for missing date property", () => {
			expect(() =>
				engine.apply(
					{ $diffTime: { unit: "days" } },
					"2025-10-05T00:00:00.000Z",
				),
			).toThrow(
				"$diffTime operand must have both 'date' and 'unit' properties",
			);
		});

		it("should throw error for missing unit property", () => {
			expect(() =>
				engine.apply(
					{ $diffTime: { date: "2025-12-25T00:00:00.000Z" } },
					"2025-10-05T00:00:00.000Z",
				),
			).toThrow(
				"$diffTime operand must have both 'date' and 'unit' properties",
			);
		});

		it("should throw error for unknown time unit", () => {
			expect(() =>
				engine.apply(
					{ $diffTime: { date: "2025-12-25T00:00:00.000Z", unit: "decades" } },
					"2025-10-05T00:00:00.000Z",
				),
			).toThrow("Unknown time unit: decades");
		});
	});

	describe("$startOf", () => {
		it("should get start of day", () => {
			const result = engine.apply(
				{ $startOf: "day" },
				"2025-10-05T15:23:45.123Z",
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should get start of week", () => {
			const result = engine.apply(
				{ $startOf: "week" },
				"2025-10-05T15:23:45.123Z", // Sunday Oct 5
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should get start of month", () => {
			const result = engine.apply(
				{ $startOf: "month" },
				"2025-10-15T15:23:45.123Z",
			);
			expect(result).toBe("2025-10-01T00:00:00.000Z");
		});

		it("should get start of year", () => {
			const result = engine.apply(
				{ $startOf: "year" },
				"2025-10-15T15:23:45.123Z",
			);
			expect(result).toBe("2025-01-01T00:00:00.000Z");
		});

		it("should throw error for unknown boundary unit", () => {
			expect(() =>
				engine.apply({ $startOf: "decade" }, "2025-10-05T00:00:00.000Z"),
			).toThrow("Unknown boundary unit: decade");
		});
	});

	describe("$endOf", () => {
		it("should get end of day", () => {
			const result = engine.apply(
				{ $endOf: "day" },
				"2025-10-05T10:00:00.000Z",
			);
			expect(result).toBe("2025-10-05T23:59:59.999Z");
		});

		it("should get end of week", () => {
			const result = engine.apply(
				{ $endOf: "week" },
				"2025-10-05T10:00:00.000Z", // Sunday Oct 5
			);
			expect(result).toBe("2025-10-11T23:59:59.999Z"); // Saturday Oct 11
		});

		it("should get end of month", () => {
			const result = engine.apply(
				{ $endOf: "month" },
				"2025-10-15T10:00:00.000Z",
			);
			expect(result).toBe("2025-10-31T23:59:59.999Z");
		});

		it("should get end of year", () => {
			const result = engine.apply(
				{ $endOf: "year" },
				"2025-10-15T10:00:00.000Z",
			);
			expect(result).toBe("2025-12-31T23:59:59.999Z");
		});

		it("should throw error for unknown boundary unit", () => {
			expect(() =>
				engine.apply({ $endOf: "decade" }, "2025-10-05T00:00:00.000Z"),
			).toThrow("Unknown boundary unit: decade");
		});
	});

	describe("$getTime", () => {
		const testDate = "2025-10-15T14:30:45.000Z";

		it("should extract year", () => {
			const result = engine.apply({ $getTime: "year" }, testDate);
			expect(result).toBe(2025);
		});

		it("should extract month (1-indexed)", () => {
			const result = engine.apply({ $getTime: "month" }, testDate);
			expect(result).toBe(10);
		});

		it("should extract day", () => {
			const result = engine.apply({ $getTime: "day" }, testDate);
			expect(result).toBe(15);
		});

		it("should extract hour", () => {
			const result = engine.apply({ $getTime: "hour" }, testDate);
			expect(result).toBe(14);
		});

		it("should extract minute", () => {
			const result = engine.apply({ $getTime: "minute" }, testDate);
			expect(result).toBe(30);
		});

		it("should extract second", () => {
			const result = engine.apply({ $getTime: "second" }, testDate);
			expect(result).toBe(45);
		});

		it("should extract day of week (0=Sunday)", () => {
			const result = engine.apply(
				{ $getTime: "dayOfWeek" },
				"2025-10-05T00:00:00.000Z", // Sunday
			);
			expect(result).toBe(0);
		});

		it("should extract day of year", () => {
			const result = engine.apply(
				{ $getTime: "dayOfYear" },
				"2025-01-01T00:00:00.000Z",
			);
			expect(result).toBe(1);

			const result2 = engine.apply(
				{ $getTime: "dayOfYear" },
				"2025-12-31T00:00:00.000Z",
			);
			expect(result2).toBe(365);
		});

		it("should throw error for unknown time component", () => {
			expect(() => engine.apply({ $getTime: "century" }, testDate)).toThrow(
				"Unknown time component: century",
			);
		});

		it("should throw error for non-string operand", () => {
			expect(() => engine.apply({ $getTime: 123 }, testDate)).toThrow(
				"$getTime operand must be a string component name",
			);
		});
	});

	describe("$isAfter", () => {
		it("should compare dates (operand form)", () => {
			const result = engine.apply(
				{ $isAfter: "2025-10-05T00:00:00.000Z" },
				"2025-10-15T00:00:00.000Z",
			);
			expect(result).toBe(true);

			const result2 = engine.apply(
				{ $isAfter: "2025-10-15T00:00:00.000Z" },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result2).toBe(false);
		});

		it("should compare dates (array form)", () => {
			const result = engine.apply(
				{
					$isAfter: ["2025-10-15T00:00:00.000Z", "2025-10-05T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false for equal dates", () => {
			const result = engine.apply(
				{ $isAfter: "2025-10-05T00:00:00.000Z" },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(false);
		});

		it("should throw error for array form with wrong number of elements", () => {
			expect(() =>
				engine.apply({ $isAfter: ["2025-10-05T00:00:00.000Z"] }, null),
			).toThrow("$isAfter array form requires exactly 2 elements");
		});
	});

	describe("$isBefore", () => {
		it("should compare dates (operand form)", () => {
			const result = engine.apply(
				{ $isBefore: "2025-10-15T00:00:00.000Z" },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(true);

			const result2 = engine.apply(
				{ $isBefore: "2025-10-05T00:00:00.000Z" },
				"2025-10-15T00:00:00.000Z",
			);
			expect(result2).toBe(false);
		});

		it("should compare dates (array form)", () => {
			const result = engine.apply(
				{
					$isBefore: ["2025-10-05T00:00:00.000Z", "2025-10-15T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(true);
		});

		it("should throw error for array form with wrong number of elements", () => {
			expect(() =>
				engine.apply({ $isBefore: ["2025-10-05T00:00:00.000Z"] }, null),
			).toThrow("$isBefore array form requires exactly 2 elements");
		});

		it("should return false for equal dates", () => {
			const result = engine.apply(
				{ $isBefore: "2025-10-05T00:00:00.000Z" },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(false);
		});
	});

	describe("$formatDate", () => {
		it("should format date (operand form)", () => {
			const result = engine.apply(
				{ $formatDate: "yyyy-MM-dd" },
				"2025-10-05T14:30:00.000Z",
			);
			expect(result).toMatch(/2025-10-05/);
		});

		it("should format date (array form)", () => {
			const result = engine.apply(
				{ $formatDate: ["2025-10-05T14:30:00.000Z", "yyyy-MM-dd"] },
				null,
			);
			expect(result).toMatch(/2025-10-05/);
		});

		it("should throw error for array form with wrong number of elements", () => {
			expect(() =>
				engine.apply({ $formatDate: ["2025-10-05T14:30:00.000Z"] }, null),
			).toThrow("$formatDate in array form requires exactly 2 elements");
		});

		it("should format with time components", () => {
			const result = engine.apply(
				{ $formatDate: "yyyy-MM-dd HH:mm:ss" },
				"2025-10-05T14:30:45.000Z",
			);
			expect(result).toMatch(/2025-10-05 \d{2}:30:45/);
		});

		it("should format with day and month names", () => {
			const result = engine.apply(
				{ $formatDate: "EEEE, MMMM do, yyyy" },
				"2025-10-05T00:00:00.000Z",
			);
			// date-fns format uses local timezone, so day name may vary
			expect(result).toMatch(
				/(Saturday|Sunday), October \d+(th|st|nd|rd), 2025/,
			);
		});
	});

	describe("$parseDate", () => {
		it("should parse date (operand form)", () => {
			const result = engine.apply({ $parseDate: "MM/dd/yyyy" }, "10/05/2025");
			expect(result).toMatch(/2025-10-05/);
		});

		it("should parse date (array form)", () => {
			const result = engine.apply(
				{ $parseDate: ["10/05/2025", "MM/dd/yyyy"] },
				null,
			);
			expect(result).toMatch(/2025-10-05/);
		});

		it("should throw error for array form with wrong number of elements", () => {
			expect(() =>
				engine.apply({ $parseDate: ["10/05/2025"] }, null),
			).toThrow("$parseDate in array form requires exactly 2 elements");
		});

		it("should throw error for invalid date in array form", () => {
			expect(() =>
				engine.apply({ $parseDate: ["invalid-date", "MM/dd/yyyy"] }, null),
			).toThrow("Invalid date string");
		});

		it("should validate ISO string with null operand", () => {
			const result = engine.apply(
				{ $parseDate: null },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should throw error for invalid ISO string with null operand", () => {
			expect(() =>
				engine.apply({ $parseDate: null }, "not-a-date"),
			).toThrow("Invalid ISO 8601 date string");
		});

		it("should parse ISO string when inputData is null (operand-only form)", () => {
			const result = engine.apply(
				{ $parseDate: "2025-10-05T00:00:00.000Z" },
				null,
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should throw error for invalid ISO string when inputData is null", () => {
			expect(() =>
				engine.apply({ $parseDate: "not-a-date" }, null),
			).toThrow("Invalid ISO 8601 date string");
		});

		it("should throw error for invalid date string", () => {
			expect(() =>
				engine.apply({ $parseDate: "MM/dd/yyyy" }, "invalid"),
			).toThrow("Invalid date string");
		});
	});

	describe("$isDateValid", () => {
		it("should validate correct date string (operand form)", () => {
			const result = engine.apply({ $isDateValid: "MM/dd/yyyy" }, "10/05/2025");
			expect(result).toBe(true);
		});

		it("should invalidate incorrect date string (operand form)", () => {
			const result = engine.apply({ $isDateValid: "MM/dd/yyyy" }, "invalid");
			expect(result).toBe(false);
		});

		it("should validate ISO string with null operand", () => {
			const result = engine.apply(
				{ $isDateValid: null },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(true);
		});

		it("should invalidate bad ISO string with null operand", () => {
			const result = engine.apply({ $isDateValid: null }, "not-a-date");
			expect(result).toBe(false);
		});

		it("should validate ISO string when inputData is null (operand as ISO string)", () => {
			const result = engine.apply(
				{ $isDateValid: "2025-10-05T00:00:00.000Z" },
				null,
			);
			expect(result).toBe(true);
		});

		it("should invalidate bad ISO string when inputData is null", () => {
			const result = engine.apply({ $isDateValid: "not-a-date" }, null);
			expect(result).toBe(false);
		});

		it("should work with array form", () => {
			const result = engine.apply(
				{ $isDateValid: ["10/05/2025", "MM/dd/yyyy"] },
				null,
			);
			expect(result).toBe(true);

			const result2 = engine.apply(
				{ $isDateValid: ["invalid", "MM/dd/yyyy"] },
				null,
			);
			expect(result2).toBe(false);
		});

		it("should handle invalid array form gracefully", () => {
			const result = engine.apply({ $isDateValid: ["single-element"] }, null);
			expect(result).toBe(false);
		});

		it("should return false when parse throws exception", () => {
			// This covers the catch block (lines 657-659)
			const result = engine.apply({ $isDateValid: "MM/dd/yyyy" }, "13/99/2025");
			expect(result).toBe(false);
		});

		it("should return false when format string is invalid (triggers catch)", () => {
			// Invalid format string can cause parse() to throw
			const result = engine.apply({ $isDateValid: "INVALID_FORMAT" }, "some-date");
			expect(result).toBe(false);
		});

		it("should return false for malformed inputs that trigger exceptions", () => {
			// Edge cases that might throw
			const result = engine.apply({ $isDateValid: null }, undefined);
			expect(result).toBe(false);
		});

		it("should handle edge case where parse throws with malformed format", () => {
			// Some format strings can cause parse to throw
			const result = engine.apply({ $isDateValid: ["test", ""] }, null);
			expect(result).toBe(false);
		});

		it("should handle objects that cause exceptions in date parsing", () => {
			// Passing objects can cause unexpected behavior
			const result = engine.apply({ $isDateValid: "yyyy-MM-dd" }, {});
			expect(result).toBe(false);
		});
	});
});
