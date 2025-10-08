import { describe, it, expect } from "vitest";
import { createExpressionEngine } from "../../src/expression-engine.js";
import { temporal } from "../../src/packs/temporal.js";

const engine = createExpressionEngine({ packs: [temporal] });

describe("Temporal Expressions", () => {
	describe("$addDays", () => {
		it("should add days to a date (array form)", () => {
			const result = engine.apply(
				{ $addDays: ["2025-10-05T00:00:00.000Z", 7] },
				null,
			);
			expect(result).toBe("2025-10-12T00:00:00.000Z");
		});

		it("should add days to a date (input data form)", () => {
			const result = engine.apply({ $addDays: 7 }, "2025-10-05T00:00:00.000Z");
			expect(result).toBe("2025-10-12T00:00:00.000Z");
		});

		it("should handle negative days", () => {
			const result = engine.apply(
				{ $addDays: ["2025-10-05T00:00:00.000Z", -3] },
				null,
			);
			expect(result).toBe("2025-10-02T00:00:00.000Z");
		});

		it("should handle month boundaries", () => {
			const result = engine.apply(
				{ $addDays: ["2025-10-31T00:00:00.000Z", 1] },
				null,
			);
			expect(result).toBe("2025-11-01T00:00:00.000Z");
		});
	});

	describe("$addMonths", () => {
		it("should add months to a date (array form)", () => {
			const result = engine.apply(
				{ $addMonths: ["2025-10-05T00:00:00.000Z", 3] },
				null,
			);
			expect(result).toBe("2026-01-05T00:00:00.000Z");
		});

		it("should add months to a date (input data form)", () => {
			const result = engine.apply(
				{ $addMonths: 3 },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe("2026-01-05T00:00:00.000Z");
		});

		it("should handle year boundaries", () => {
			const result = engine.apply(
				{ $addMonths: ["2025-12-15T00:00:00.000Z", 2] },
				null,
			);
			expect(result).toBe("2026-02-15T00:00:00.000Z");
		});
	});

	describe("$addYears", () => {
		it("should add years to a date (array form)", () => {
			const result = engine.apply(
				{ $addYears: ["2025-10-05T00:00:00.000Z", 5] },
				null,
			);
			expect(result).toBe("2030-10-05T00:00:00.000Z");
		});

		it("should add years to a date (input data form)", () => {
			const result = engine.apply({ $addYears: 5 }, "2025-10-05T00:00:00.000Z");
			expect(result).toBe("2030-10-05T00:00:00.000Z");
		});
	});

	describe("$addHours", () => {
		it("should add hours to a date (array form)", () => {
			const result = engine.apply(
				{ $addHours: ["2025-10-05T10:00:00.000Z", 5] },
				null,
			);
			expect(result).toBe("2025-10-05T15:00:00.000Z");
		});

		it("should handle day boundaries", () => {
			const result = engine.apply(
				{ $addHours: ["2025-10-05T22:00:00.000Z", 3] },
				null,
			);
			expect(result).toBe("2025-10-06T01:00:00.000Z");
		});
	});

	describe("$addMinutes", () => {
		it("should add minutes to a date (array form)", () => {
			const result = engine.apply(
				{ $addMinutes: ["2025-10-05T10:30:00.000Z", 45] },
				null,
			);
			expect(result).toBe("2025-10-05T11:15:00.000Z");
		});

		it("should handle hour boundaries", () => {
			const result = engine.apply(
				{ $addMinutes: ["2025-10-05T10:50:00.000Z", 20] },
				null,
			);
			expect(result).toBe("2025-10-05T11:10:00.000Z");
		});
	});

	describe("$subDays", () => {
		it("should subtract days from a date (array form)", () => {
			const result = engine.apply(
				{ $subDays: ["2025-10-12T00:00:00.000Z", 7] },
				null,
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should subtract days from a date (input data form)", () => {
			const result = engine.apply({ $subDays: 7 }, "2025-10-12T00:00:00.000Z");
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should handle month boundaries", () => {
			const result = engine.apply(
				{ $subDays: ["2025-11-01T00:00:00.000Z", 1] },
				null,
			);
			expect(result).toBe("2025-10-31T00:00:00.000Z");
		});
	});

	describe("$subMonths", () => {
		it("should subtract months from a date (array form)", () => {
			const result = engine.apply(
				{ $subMonths: ["2026-01-05T00:00:00.000Z", 3] },
				null,
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should handle year boundaries", () => {
			const result = engine.apply(
				{ $subMonths: ["2026-02-15T00:00:00.000Z", 2] },
				null,
			);
			expect(result).toBe("2025-12-15T00:00:00.000Z");
		});
	});

	describe("$subYears", () => {
		it("should subtract years from a date (array form)", () => {
			const result = engine.apply(
				{ $subYears: ["2030-10-05T00:00:00.000Z", 5] },
				null,
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});
	});

	describe("$diffDays", () => {
		it("should calculate difference in days (array form)", () => {
			const result = engine.apply(
				{ $diffDays: ["2025-10-05T00:00:00.000Z", "2025-10-12T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(7);
		});

		it("should calculate difference in days (input data form)", () => {
			const result = engine.apply(
				{ $diffDays: "2025-10-12T00:00:00.000Z" },
				"2025-10-05T00:00:00.000Z",
			);
			expect(result).toBe(7);
		});

		it("should return negative for earlier second date", () => {
			const result = engine.apply(
				{ $diffDays: ["2025-10-12T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(-7);
		});
	});

	describe("$diffMonths", () => {
		it("should calculate difference in months", () => {
			const result = engine.apply(
				{
					$diffMonths: ["2025-10-05T00:00:00.000Z", "2026-01-05T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(3);
		});

		it("should handle year boundaries", () => {
			const result = engine.apply(
				{
					$diffMonths: ["2025-12-15T00:00:00.000Z", "2026-02-15T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(2);
		});
	});

	describe("$diffYears", () => {
		it("should calculate difference in years", () => {
			const result = engine.apply(
				{
					$diffYears: ["2025-10-05T00:00:00.000Z", "2030-10-05T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(5);
		});
	});

	describe("$diffHours", () => {
		it("should calculate difference in hours", () => {
			const result = engine.apply(
				{
					$diffHours: ["2025-10-05T10:00:00.000Z", "2025-10-05T15:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(5);
		});

		it("should handle day boundaries", () => {
			const result = engine.apply(
				{
					$diffHours: ["2025-10-05T22:00:00.000Z", "2025-10-06T01:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(3);
		});
	});

	describe("$diffMinutes", () => {
		it("should calculate difference in minutes", () => {
			const result = engine.apply(
				{
					$diffMinutes: [
						"2025-10-05T10:00:00.000Z",
						"2025-10-05T10:45:00.000Z",
					],
				},
				null,
			);
			expect(result).toBe(45);
		});
	});

	describe("$diffSeconds", () => {
		it("should calculate difference in seconds", () => {
			const result = engine.apply(
				{
					$diffSeconds: [
						"2025-10-05T10:00:00.000Z",
						"2025-10-05T10:01:00.000Z",
					],
				},
				null,
			);
			expect(result).toBe(60);
		});
	});

	describe("$diffMilliseconds", () => {
		it("should calculate difference in milliseconds", () => {
			const result = engine.apply(
				{
					$diffMilliseconds: [
						"2025-10-05T10:00:00.000Z",
						"2025-10-05T10:00:01.000Z",
					],
				},
				null,
			);
			expect(result).toBe(1000);
		});
	});

	describe("$startOfDay", () => {
		it("should get start of day (operand form)", () => {
			const result = engine.apply(
				{ $startOfDay: "2025-10-05T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});

		it("should get start of day (input data form)", () => {
			const result = engine.apply(
				{ $startOfDay: null },
				"2025-10-05T15:23:45.234Z",
			);
			expect(result).toBe("2025-10-05T00:00:00.000Z");
		});
	});

	describe("$endOfDay", () => {
		it("should get end of day", () => {
			const result = engine.apply(
				{ $endOfDay: "2025-10-05T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-10-05T23:59:59.999Z");
		});
	});

	describe("$startOfMonth", () => {
		it("should get start of month", () => {
			const result = engine.apply(
				{ $startOfMonth: "2025-10-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-10-01T00:00:00.000Z");
		});
	});

	describe("$endOfMonth", () => {
		it("should get end of month (30 days)", () => {
			const result = engine.apply(
				{ $endOfMonth: "2025-11-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-11-30T23:59:59.999Z");
		});

		it("should get end of month (31 days)", () => {
			const result = engine.apply(
				{ $endOfMonth: "2025-10-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-10-31T23:59:59.999Z");
		});

		it("should handle February", () => {
			const result = engine.apply(
				{ $endOfMonth: "2025-02-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-02-28T23:59:59.999Z");
		});

		it("should handle leap year February", () => {
			const result = engine.apply(
				{ $endOfMonth: "2024-02-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2024-02-29T23:59:59.999Z");
		});
	});

	describe("$startOfYear", () => {
		it("should get start of year", () => {
			const result = engine.apply(
				{ $startOfYear: "2025-10-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-01-01T00:00:00.000Z");
		});
	});

	describe("$endOfYear", () => {
		it("should get end of year", () => {
			const result = engine.apply(
				{ $endOfYear: "2025-10-15T15:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-12-31T23:59:59.999Z");
		});
	});

	describe("$isAfter", () => {
		it("should return true when first date is after second (array form)", () => {
			const result = engine.apply(
				{ $isAfter: ["2025-10-12T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false when first date is before second", () => {
			const result = engine.apply(
				{ $isAfter: ["2025-10-05T00:00:00.000Z", "2025-10-12T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(false);
		});

		it("should return false when dates are equal", () => {
			const result = engine.apply(
				{ $isAfter: ["2025-10-05T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(false);
		});

		it("should work with input data form", () => {
			const result = engine.apply(
				{ $isAfter: "2025-10-05T00:00:00.000Z" },
				"2025-10-12T00:00:00.000Z",
			);
			expect(result).toBe(true);
		});
	});

	describe("$isBefore", () => {
		it("should return true when first date is before second", () => {
			const result = engine.apply(
				{ $isBefore: ["2025-10-05T00:00:00.000Z", "2025-10-12T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false when first date is after second", () => {
			const result = engine.apply(
				{ $isBefore: ["2025-10-12T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(false);
		});

		it("should return false when dates are equal", () => {
			const result = engine.apply(
				{ $isBefore: ["2025-10-05T00:00:00.000Z", "2025-10-05T00:00:00.000Z"] },
				null,
			);
			expect(result).toBe(false);
		});
	});

	describe("$isSameDay", () => {
		it("should return true when dates are on the same day", () => {
			const result = engine.apply(
				{
					$isSameDay: ["2025-10-05T10:00:00.000Z", "2025-10-05T15:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false when dates are on different days", () => {
			const result = engine.apply(
				{
					$isSameDay: ["2025-10-05T23:59:59.999Z", "2025-10-06T00:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(false);
		});

		it("should return true for exact same timestamp", () => {
			const result = engine.apply(
				{
					$isSameDay: ["2025-10-05T10:00:00.000Z", "2025-10-05T10:00:00.000Z"],
				},
				null,
			);
			expect(result).toBe(true);
		});
	});

	describe("$isWeekend", () => {
		it("should return true for Saturday", () => {
			const result = engine.apply(
				{ $isWeekend: "2025-10-04T00:00:00.000Z" }, // Saturday
				null,
			);
			expect(result).toBe(true);
		});

		it("should return true for Sunday", () => {
			const result = engine.apply(
				{ $isWeekend: "2025-10-05T00:00:00.000Z" }, // Sunday
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false for weekday", () => {
			const result = engine.apply(
				{ $isWeekend: "2025-10-06T00:00:00.000Z" }, // Monday
				null,
			);
			expect(result).toBe(false);
		});

		it("should work with input data form", () => {
			const result = engine.apply(
				{ $isWeekend: null },
				"2025-10-04T00:00:00.000Z",
			);
			expect(result).toBe(true);
		});
	});

	describe("$isWeekday", () => {
		it("should return true for Monday", () => {
			const result = engine.apply(
				{ $isWeekday: "2025-10-06T00:00:00.000Z" }, // Monday
				null,
			);
			expect(result).toBe(true);
		});

		it("should return true for Friday", () => {
			const result = engine.apply(
				{ $isWeekday: "2025-10-10T00:00:00.000Z" }, // Friday
				null,
			);
			expect(result).toBe(true);
		});

		it("should return false for Saturday", () => {
			const result = engine.apply(
				{ $isWeekday: "2025-10-04T00:00:00.000Z" }, // Saturday
				null,
			);
			expect(result).toBe(false);
		});

		it("should return false for Sunday", () => {
			const result = engine.apply(
				{ $isWeekday: "2025-10-05T00:00:00.000Z" }, // Sunday
				null,
			);
			expect(result).toBe(false);
		});
	});

	describe("$year", () => {
		it("should extract year from date", () => {
			const result = engine.apply({ $year: "2025-10-05T15:23:45.234Z" }, null);
			expect(result).toBe(2025);
		});

		it("should work with input data form", () => {
			const result = engine.apply({ $year: null }, "2025-10-05T15:23:45.234Z");
			expect(result).toBe(2025);
		});
	});

	describe("$month", () => {
		it("should extract month from date (1-indexed)", () => {
			const result = engine.apply({ $month: "2025-10-05T15:23:45.234Z" }, null);
			expect(result).toBe(10);
		});

		it("should return 1 for January", () => {
			const result = engine.apply({ $month: "2025-01-05T15:23:45.234Z" }, null);
			expect(result).toBe(1);
		});

		it("should return 12 for December", () => {
			const result = engine.apply({ $month: "2025-12-05T15:23:45.234Z" }, null);
			expect(result).toBe(12);
		});
	});

	describe("$day", () => {
		it("should extract day from date", () => {
			const result = engine.apply({ $day: "2025-10-05T15:23:45.234Z" }, null);
			expect(result).toBe(5);
		});

		it("should extract first day of month", () => {
			const result = engine.apply({ $day: "2025-10-01T15:23:45.234Z" }, null);
			expect(result).toBe(1);
		});

		it("should extract last day of month", () => {
			const result = engine.apply({ $day: "2025-10-31T15:23:45.234Z" }, null);
			expect(result).toBe(31);
		});
	});

	describe("$hour", () => {
		it("should extract hour from date", () => {
			const result = engine.apply({ $hour: "2025-10-05T15:23:45.234Z" }, null);
			expect(result).toBe(15);
		});

		it("should return 0 for midnight", () => {
			const result = engine.apply({ $hour: "2025-10-05T00:23:45.234Z" }, null);
			expect(result).toBe(0);
		});
	});

	describe("$minute", () => {
		it("should extract minute from date", () => {
			const result = engine.apply(
				{ $minute: "2025-10-05T15:23:45.234Z" },
				null,
			);
			expect(result).toBe(23);
		});
	});

	describe("$second", () => {
		it("should extract second from date", () => {
			const result = engine.apply(
				{ $second: "2025-10-05T15:23:45.234Z" },
				null,
			);
			expect(result).toBe(45);
		});
	});

	describe("$dayOfWeek", () => {
		it("should return 0 for Sunday", () => {
			const result = engine.apply(
				{ $dayOfWeek: "2025-10-05T00:00:00.000Z" }, // Sunday
				null,
			);
			expect(result).toBe(0);
		});

		it("should return 1 for Monday", () => {
			const result = engine.apply(
				{ $dayOfWeek: "2025-10-06T00:00:00.000Z" }, // Monday
				null,
			);
			expect(result).toBe(1);
		});

		it("should return 6 for Saturday", () => {
			const result = engine.apply(
				{ $dayOfWeek: "2025-10-04T00:00:00.000Z" }, // Saturday
				null,
			);
			expect(result).toBe(6);
		});
	});

	describe("$dayOfYear", () => {
		it("should return 1 for January 1st", () => {
			const result = engine.apply(
				{ $dayOfYear: "2025-01-01T00:00:00.000Z" },
				null,
			);
			expect(result).toBe(1);
		});

		it("should calculate day of year correctly", () => {
			const result = engine.apply(
				{ $dayOfYear: "2025-10-05T00:00:00.000Z" },
				null,
			);
			// Jan (31) + Feb (28) + Mar (31) + Apr (30) + May (31) + Jun (30) + Jul (31) + Aug (31) + Sep (30) + 5 days = 278
			expect(result).toBe(278);
		});
	});

	describe("$formatDate", () => {
		it("should format date with pattern (array form)", () => {
			const result = engine.apply(
				{ $formatDate: ["2025-10-05T11:23:45.234Z", "yyyy-MM-dd"] },
				null,
			);
			expect(result).toBe("2025-10-05");
		});

		it("should format date with pattern (input data form)", () => {
			const result = engine.apply(
				{ $formatDate: "yyyy-MM-dd" },
				"2025-10-05T11:23:45.234Z",
			);
			expect(result).toBe("2025-10-05");
		});

		it("should format with time pattern", () => {
			const result = engine.apply(
				{ $formatDate: ["2025-10-05T11:23:45.234Z", "yyyy-MM-dd HH:mm:ss"] },
				null,
			);
			// date-fns format uses local timezone, so we just check the date part
			expect(result).toMatch(/^2025-10-05 \d{2}:23:45$/);
		});

		it("should format with custom pattern", () => {
			const result = engine.apply(
				{ $formatDate: ["2025-10-05T11:23:45.234Z", "MMMM do, yyyy"] },
				null,
			);
			expect(result).toBe("October 5th, 2025");
		});

		it("should format day of week", () => {
			const result = engine.apply(
				{ $formatDate: ["2025-10-05T11:23:45.234Z", "EEEE"] },
				null,
			);
			expect(result).toBe("Sunday");
		});
	});

	describe("$parseDate", () => {
		it("should parse date with format (array form)", () => {
			const result = engine.apply(
				{ $parseDate: ["10/05/2025", "MM/dd/yyyy"] },
				null,
			);
			expect(result).toMatch(/2025-10-05T\d{2}:00:00\.000Z/);
		});

		it("should parse date with format (input data form)", () => {
			const result = engine.apply({ $parseDate: "MM/dd/yyyy" }, "10/05/2025");
			expect(result).toMatch(/2025-10-05T\d{2}:00:00\.000Z/);
		});

		it("should parse ISO string without format", () => {
			const result = engine.apply(
				{ $parseDate: "2025-10-05T11:23:45.234Z" },
				null,
			);
			expect(result).toBe("2025-10-05T11:23:45.234Z");
		});

		it("should parse ISO string with null operand", () => {
			const result = engine.apply(
				{ $parseDate: null },
				"2025-10-05T11:23:45.234Z",
			);
			expect(result).toBe("2025-10-05T11:23:45.234Z");
		});

		it("should throw on invalid date string", () => {
			expect(() =>
				engine.apply({ $parseDate: ["not-a-date", "MM/dd/yyyy"] }, null),
			).toThrow(/Invalid date string/);
		});

		it("should throw on invalid ISO string", () => {
			expect(() => engine.apply({ $parseDate: null }, "not-a-date")).toThrow(
				/Invalid ISO 8601 date string/,
			);
		});

		it("should parse date with time", () => {
			const result = engine.apply(
				{ $parseDate: ["10/05/2025 14:30:00", "MM/dd/yyyy HH:mm:ss"] },
				null,
			);
			expect(result).toMatch(/2025-10-05T\d{2}:30:00\.000Z/);
		});
	});

	describe("$isDateValid", () => {
		it("should return true for valid date (array form)", () => {
			const result = engine.apply(
				{ $isDateValid: ["10/05/2025", "MM/dd/yyyy"] },
				null,
			);
			expect(result).toBe(true);
		});

		it("should return true for valid date (input data form)", () => {
			const result = engine.apply({ $isDateValid: "MM/dd/yyyy" }, "10/05/2025");
			expect(result).toBe(true);
		});

		it("should return false for invalid date", () => {
			const result = engine.apply(
				{ $isDateValid: ["not-a-date", "MM/dd/yyyy"] },
				null,
			);
			expect(result).toBe(false);
		});

		it("should return true for valid ISO string", () => {
			const result = engine.apply(
				{ $isDateValid: "2025-10-05T11:23:45.234Z" },
				null,
			);
			expect(result).toBe(true);
		});

		it("should return true for valid ISO string with null operand", () => {
			const result = engine.apply(
				{ $isDateValid: null },
				"2025-10-05T11:23:45.234Z",
			);
			expect(result).toBe(true);
		});

		it("should return false for invalid ISO string", () => {
			const result = engine.apply({ $isDateValid: null }, "not-a-date");
			expect(result).toBe(false);
		});

		it("should return false for wrong array length", () => {
			const result = engine.apply({ $isDateValid: ["10/05/2025"] }, null);
			expect(result).toBe(false);
		});
	});

	describe("Error handling", () => {
		it("should throw on invalid ISO string in arithmetic operations", () => {
			expect(() => engine.apply({ $addDays: ["not-a-date", 7] }, null)).toThrow(
				/Invalid ISO 8601 date string/,
			);
		});

		it("should throw on non-string input", () => {
			expect(() => engine.apply({ $addDays: [12345, 7] }, null)).toThrow(
				/Expected ISO 8601 string/,
			);
		});

		it("should throw on invalid array length for binary expressions", () => {
			expect(() =>
				engine.apply({ $addDays: ["2025-10-05T00:00:00.000Z"] }, null),
			).toThrow(/exactly 2 elements/);
		});

		it("should throw on invalid array length for comparison expressions", () => {
			expect(() =>
				engine.apply({ $isAfter: ["2025-10-05T00:00:00.000Z"] }, null),
			).toThrow(/exactly 2 elements/);
		});
	});

	describe("Integration with expressions", () => {
		it("should work with $pipe", () => {
			const result = engine.apply(
				{
					$pipe: [
						{ $addDays: ["2025-10-05T00:00:00.000Z", 7] },
						{ $formatDate: "yyyy-MM-dd" },
					],
				},
				null,
			);
			// date-fns format uses local timezone, accept either date
			expect(result).toMatch(/^2025-10-(11|12)$/);
		});

		it("should work with $get", () => {
			const engineWithGet = createExpressionEngine({ packs: [temporal] });
			const result = engineWithGet.apply(
				{ $addDays: [{ $get: "date" }, 7] },
				{ date: "2025-10-05T00:00:00.000Z" },
			);
			expect(result).toBe("2025-10-12T00:00:00.000Z");
		});

		it("should compose multiple temporal operations", () => {
			const result = engine.apply(
				{
					$pipe: [
						{ $parseDate: ["10/05/2025", "MM/dd/yyyy"] },
						{ $addMonths: 3 },
						{ $startOfMonth: null },
						{ $formatDate: "MMMM yyyy" },
					],
				},
				null,
			);
			// date-fns format uses local timezone, accept December or January
			expect(result).toMatch(/^(December 2025|January 2026)$/);
		});
	});
});
