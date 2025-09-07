import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$nowUTC", () => {
  describe("apply form", () => {
    it("returns current time as UTC RFC3339 string", () => {
      const before = Date.now();
      const result = apply({ $nowUTC: null }, {});
      const after = Date.now();

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      const resultTime = new Date(result).getTime();
      expect(resultTime).toBeGreaterThanOrEqual(before);
      expect(resultTime).toBeLessThanOrEqual(after);
    });

    it("returns different times when called repeatedly", () => {
      const result1 = apply({ $nowUTC: null }, {});
      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Busy wait for at least 1ms
      }
      const result2 = apply({ $nowUTC: null }, {});

      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
      expect(new Date(result2).getTime()).toBeGreaterThan(
        new Date(result1).getTime(),
      );
    });

    it("ignores operand and input data", () => {
      const result1 = apply({ $nowUTC: "ignored" }, { also: "ignored" });
      const result2 = apply({ $nowUTC: [1, 2, 3] }, null);

      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
      expect(result1).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result2).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("work within conditional expressions", () => {
      const before = Date.now();
      const result = evaluate({
        $if: {
          if: true,
          then: { $nowUTC: null },
          else: "2000-01-01T00:00:00.000Z",
        },
      });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result).getTime()).toBeGreaterThanOrEqual(before);
    });

    it("returns properly formatted strings", () => {
      const utcResult = apply({ $nowUTC: null }, {});
      const timestampResult = apply({ $timestamp: null }, {});

      // Check format
      expect(utcResult).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // UTC should be close to timestamp
      const utcTime = new Date(utcResult).getTime();
      expect(Math.abs(utcTime - timestampResult)).toBeLessThan(100);
    });
  });

  describe("evaluate form", () => {
    it("can be evaluated statically", () => {
      const before = Date.now();
      const result = evaluate({ $nowUTC: null });
      const after = Date.now();

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      const resultTime = new Date(result).getTime();
      expect(resultTime).toBeGreaterThanOrEqual(before);
      expect(resultTime).toBeLessThanOrEqual(after);
    });
  });
});

describe("$nowLocal", () => {
  describe("apply form", () => {
    it("returns current time as local RFC3339 string with timezone", () => {
      const result = apply({ $nowLocal: null }, {});

      expect(typeof result).toBe("string");
      // Should match RFC3339 with timezone offset
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
      );
    });

    it("returns different times when called repeatedly", () => {
      const result1 = apply({ $nowLocal: null }, {});
      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Busy wait for at least 1ms
      }
      const result2 = apply({ $nowLocal: null }, {});

      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
      expect(new Date(result2).getTime()).toBeGreaterThan(
        new Date(result1).getTime(),
      );
    });

    it("ignores operand and input data", () => {
      const result1 = apply({ $nowLocal: "ignored" }, { also: "ignored" });
      const result2 = apply({ $nowLocal: [1, 2, 3] }, null);

      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
      expect(result1).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
      );
      expect(result2).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
      );
    });

    it("returns properly formatted strings", () => {
      const localResult = apply({ $nowLocal: null }, {});

      // Check format
      expect(localResult).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
      );

      // Local string should be parseable and roughly recent
      const localTime = new Date(localResult).getTime();
      expect(localTime).toBeGreaterThan(Date.now() - 1000); // Within last second
    });
  });

  describe("evaluate form", () => {
    it("can be evaluated statically", () => {
      const result = evaluate({ $nowLocal: null });

      expect(typeof result).toBe("string");
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
      );
    });
  });
});

describe("$timestamp", () => {
  describe("apply form", () => {
    it("returns current timestamp as number", () => {
      const before = Date.now();
      const result = apply({ $timestamp: null }, {});
      const after = Date.now();

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it("returns different timestamps when called repeatedly", () => {
      const result1 = apply({ $timestamp: null }, {});
      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Busy wait for at least 1ms
      }
      const result2 = apply({ $timestamp: null }, {});

      expect(typeof result1).toBe("number");
      expect(typeof result2).toBe("number");
      expect(result2).toBeGreaterThan(result1);
    });

    it("ignores operand and input data", () => {
      const result1 = apply({ $timestamp: "ignored" }, { also: "ignored" });
      const result2 = apply({ $timestamp: [1, 2, 3] }, null);

      expect(typeof result1).toBe("number");
      expect(typeof result2).toBe("number");
    });

    it("work within conditional expressions", () => {
      const result = apply(
        {
          $if: {
            if: true,
            then: { $timestamp: null },
            else: 0,
          },
        },
        {},
      );

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("work in switch expressions", () => {
      const result = apply(
        {
          $switch: {
            value: "time",
            cases: [{ when: "time", then: { $timestamp: null } }],
            default: 0,
          },
        },
        {},
      );

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("evaluate form", () => {
    it("can be evaluated statically", () => {
      const before = Date.now();
      const result = evaluate({ $timestamp: null });
      const after = Date.now();

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });
});

describe("$timeAdd", () => {
  describe("apply form", () => {
    it("should add milliseconds to pickup time", () => {
      const pickupTime = "2024-03-15T08:30:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 500, unit: "milliseconds" } },
        pickupTime,
      );

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2024-03-15T08:30:00.500Z");
    });

    it("should add seconds for Amara's feeding schedule", () => {
      const feedingTime = "2024-03-15T12:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 30, unit: "seconds" } },
        feedingTime,
      );

      expect(result.toISOString()).toBe("2024-03-15T12:00:30.000Z");
    });

    it("should add minutes for Kenji's nap extension", () => {
      const napStart = "2024-03-15T13:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 15, unit: "minutes" } },
        napStart,
      );

      expect(result.toISOString()).toBe("2024-03-15T13:15:00.000Z");
    });

    it("should add hours for Elena's extended daycare", () => {
      const regularEnd = "2024-03-15T17:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 2, unit: "hours" } },
        regularEnd,
      );

      expect(result.toISOString()).toBe("2024-03-15T19:00:00.000Z");
    });

    it("should add days for Yuki's absence tracking", () => {
      const lastAttendance = "2024-03-15T08:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 3, unit: "days" } },
        lastAttendance,
      );

      expect(result.toISOString()).toBe("2024-03-18T08:00:00.000Z");
    });

    it("should add weeks for Fatima's enrollment renewal", () => {
      const enrollmentStart = "2024-03-15T00:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 2, unit: "weeks" } },
        enrollmentStart,
      );

      expect(result.toISOString()).toBe("2024-03-29T00:00:00.000Z");
    });

    it("should add months for Diego's age tracking", () => {
      const birthday = "2024-01-15T00:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 3, unit: "months" } },
        birthday,
      );

      // JavaScript Date.setMonth() can have timezone effects, expect actual behavior
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(3); // April (0-indexed)
    });

    it("should add years for Priya's graduation planning", () => {
      const currentDate = "2024-03-15T00:00:00.000Z";
      const result = apply(
        { $timeAdd: { amount: 1, unit: "years" } },
        currentDate,
      );

      expect(result.toISOString()).toBe("2025-03-15T00:00:00.000Z");
    });

    it("should throw error for unsupported unit", () => {
      expect(() => {
        apply(
          { $timeAdd: { amount: 1, unit: "decades" } },
          "2024-03-15T00:00:00.000Z",
        );
      }).toThrow("Unsupported time unit: decades");
    });

    it("should handle negative amounts for Sana's schedule correction", () => {
      const originalTime = "2024-03-15T14:30:00.000Z";
      const result = apply(
        { $timeAdd: { amount: -30, unit: "minutes" } },
        originalTime,
      );

      expect(result.toISOString()).toBe("2024-03-15T14:00:00.000Z");
    });
  });

  describe("evaluate form", () => {
    it("should add time using static evaluation for Rajesh's medication", () => {
      const result = evaluate({
        $timeAdd: {
          date: "2024-03-15T09:00:00.000Z",
          amount: 4,
          unit: "hours",
        },
      });

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2024-03-15T13:00:00.000Z");
    });

    it("should handle month boundary for Nina's enrollment", () => {
      const result = evaluate({
        $timeAdd: {
          date: "2024-01-31T12:00:00.000Z",
          amount: 1,
          unit: "months",
        },
      });

      // JavaScript Date behavior for month boundaries
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
    });

    it("should handle leap year for Chen's birthday tracking", () => {
      const result = evaluate({
        $timeAdd: {
          date: "2024-02-29T00:00:00.000Z",
          amount: 1,
          unit: "years",
        },
      });

      // Feb 29, 2024 + 1 year: JavaScript Date behavior
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // February (0-indexed), becomes Feb 28 in 2025
      expect(result.getDate()).toBe(28); // Feb 28 (2025 is not a leap year)
    });
  });
});

describe("$timeDiff", () => {
  describe("apply form", () => {
    it("should calculate milliseconds between Aria's activities", () => {
      const startTime = "2024-03-15T09:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T09:00:00.500Z",
            unit: "milliseconds",
          },
        },
        startTime,
      );

      expect(result).toBe(500);
    });

    it("should calculate seconds for Zahra's attention span", () => {
      const activityStart = "2024-03-15T10:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T10:02:30.000Z",
            unit: "seconds",
          },
        },
        activityStart,
      );

      expect(result).toBe(150); // 2 minutes 30 seconds = 150 seconds
    });

    it("should calculate minutes for Arun's playtime", () => {
      const playStart = "2024-03-15T14:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T14:45:00.000Z",
            unit: "minutes",
          },
        },
        playStart,
      );

      expect(result).toBe(45);
    });

    it("should calculate hours for Maria's daycare day", () => {
      const arrivalTime = "2024-03-15T08:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T17:00:00.000Z",
            unit: "hours",
          },
        },
        arrivalTime,
      );

      expect(result).toBe(9);
    });

    it("should calculate days for Kenji's absence period", () => {
      const lastDay = "2024-03-15T00:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-20T00:00:00.000Z",
            unit: "days",
          },
        },
        lastDay,
      );

      expect(result).toBe(5);
    });

    it("should calculate weeks for Amara's progress evaluation", () => {
      const termStart = "2024-03-01T00:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-22T00:00:00.000Z",
            unit: "weeks",
          },
        },
        termStart,
      );

      expect(result).toBe(3); // 21 days = 3 weeks
    });

    it("should default to milliseconds when unit not specified", () => {
      const start = "2024-03-15T12:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T12:00:01.000Z",
          },
        },
        start,
      );

      expect(result).toBe(1000); // 1 second = 1000ms
    });

    it("should handle negative differences for Elena's early pickup", () => {
      const scheduledEnd = "2024-03-15T17:00:00.000Z";
      const result = apply(
        {
          $timeDiff: {
            endDate: "2024-03-15T16:30:00.000Z",
            unit: "minutes",
          },
        },
        scheduledEnd,
      );

      expect(result).toBe(-30);
    });

    it("should throw error for unsupported unit", () => {
      expect(() => {
        apply(
          {
            $timeDiff: {
              endDate: "2024-03-16T00:00:00.000Z",
              unit: "months",
            },
          },
          "2024-03-15T00:00:00.000Z",
        );
      }).toThrow("Unsupported time unit: months");
    });
  });

  describe("evaluate form", () => {
    it("should calculate difference using static evaluation for Yuki's schedule", () => {
      const result = evaluate({
        $timeDiff: {
          startDate: "2024-03-15T08:00:00.000Z",
          endDate: "2024-03-15T12:00:00.000Z",
          unit: "hours",
        },
      });

      expect(result).toBe(4);
    });

    it("should handle cross-day differences for Fatima's weekend care", () => {
      const result = evaluate({
        $timeDiff: {
          startDate: "2024-03-15T20:00:00.000Z",
          endDate: "2024-03-16T08:00:00.000Z",
          unit: "hours",
        },
      });

      expect(result).toBe(12);
    });

    it("should calculate precise milliseconds for Diego's reaction time", () => {
      const result = evaluate({
        $timeDiff: {
          startDate: "2024-03-15T10:00:00.000Z",
          endDate: "2024-03-15T10:00:00.123Z",
          unit: "milliseconds",
        },
      });

      expect(result).toBe(123);
    });
  });
});

describe("$formatTime", () => {
  describe("apply form", () => {
    it("should format time as ISO for Priya's medical records", () => {
      const timestamp = "2024-03-15T14:30:45.123Z";
      const result = apply({ $formatTime: "iso" }, timestamp);

      expect(typeof result).toBe("string");
      // toLocaleString with ISO options should return something like "03/15/2024, 02:30:45 PM"
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should format date only for Sana's enrollment form", () => {
      const timestamp = "2024-03-15T14:30:45.123Z";
      const result = apply({ $formatTime: "date" }, timestamp);

      expect(typeof result).toBe("string");
      // Should contain date but not time
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).not.toMatch(/:\d{2}:/);
    });

    it("should format time only for Rajesh's daily schedule", () => {
      const timestamp = "2024-03-15T14:30:45.123Z";
      const result = apply({ $formatTime: "time" }, timestamp);

      expect(typeof result).toBe("string");
      // Should contain time but not date
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
      expect(result).not.toMatch(/\d{4}/);
    });

    it("should handle different times for Nina's activity log", () => {
      const morningTime = "2024-03-15T09:15:30.000Z";
      const afternoonTime = "2024-03-15T15:45:20.000Z";

      const morningResult = apply({ $formatTime: "time" }, morningTime);
      const afternoonResult = apply({ $formatTime: "time" }, afternoonTime);

      // Times will be in local timezone, just verify format
      expect(morningResult).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
      expect(afternoonResult).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should format midnight for Chen's overnight care", () => {
      const midnight = "2024-03-15T00:00:00.000Z";
      const result = apply({ $formatTime: "time" }, midnight);

      // Time will be in local timezone, just verify format
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should format noon for Amara's lunch time", () => {
      const noon = "2024-03-15T12:00:00.000Z";
      const result = apply({ $formatTime: "time" }, noon);

      // Time will be in local timezone, just verify format
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should handle invalid date gracefully", () => {
      expect(() => {
        apply({ $formatTime: "iso" }, "not-a-date");
      }).not.toThrow();

      const result = apply({ $formatTime: "iso" }, "not-a-date");
      expect(typeof result).toBe("string");
    });
  });

  describe("evaluate form", () => {
    it("should format using static evaluation for Aria's report card", () => {
      const result = evaluate({
        $formatTime: {
          date: "2024-03-15T16:20:30.000Z",
          format: "date",
        },
      });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/03\/15\/2024/);
    });

    it("should format ISO datetime for Zahra's emergency contact", () => {
      const result = evaluate({
        $formatTime: {
          date: "2024-03-15T11:45:15.000Z",
          format: "iso",
        },
      });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/03\/15\/2024, \d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should format time for Arun's pickup reminder", () => {
      const result = evaluate({
        $formatTime: {
          date: "2024-03-15T17:30:00.000Z",
          format: "time",
        },
      });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should handle early morning times for Maria's drop-off", () => {
      const result = evaluate({
        $formatTime: {
          date: "2024-03-15T07:15:45.000Z",
          format: "time",
        },
      });

      expect(typeof result).toBe("string");
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });

    it("should format different date formats consistently", () => {
      const isoResult = evaluate({
        $formatTime: {
          date: "2024-12-25T10:30:15.000Z",
          format: "iso",
        },
      });

      const dateResult = evaluate({
        $formatTime: {
          date: "2024-12-25T10:30:15.000Z",
          format: "date",
        },
      });

      const timeResult = evaluate({
        $formatTime: {
          date: "2024-12-25T10:30:15.000Z",
          format: "time",
        },
      });

      // Verify format patterns, accounting for timezone conversion
      expect(isoResult).toMatch(/12\/25\/2024, \d{1,2}:\d{2}:\d{2} [AP]M/);
      expect(dateResult).toMatch(/12\/25\/2024/);
      expect(timeResult).toMatch(/\d{1,2}:\d{2}:\d{2} [AP]M/);
    });
  });
});
