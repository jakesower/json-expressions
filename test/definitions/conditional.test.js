import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { all } from "../../src/packs/all.js";

const testEngine = createExpressionEngine({ packs: [all] });
const { apply, evaluate } = testEngine;

describe("$case", () => {
  describe("apply form", () => {
    it("matches with boolean predicate", () => {
      expect(
        apply(
          {
            $case: {
              value: 4,
              cases: [
                { when: { $gt: 5 }, then: "Big number" },
                { when: { $lt: 5 }, then: "Small number" },
                { when: { $eq: 4 }, then: "Exactly four" },
              ],
              default: "Unknown",
            },
          },
          {},
        ),
      ).toEqual("Small number");
    });

    it("returns default when no case matches", () => {
      expect(
        apply(
          {
            $case: {
              value: 10,
              cases: [
                { when: { $lt: 5 }, then: "Small" },
                { when: { $eq: 7 }, then: "Lucky" },
              ],
              default: "Other",
            },
          },
          {},
        ),
      ).toEqual("Other");
    });

    it("handles complex boolean expressions", () => {
      expect(
        apply(
          {
            $case: {
              value: 4,
              cases: [
                {
                  when: { $and: [{ $gte: 2 }, { $lt: 6 }] },
                  then: "Preschool age",
                },
                {
                  when: { $gte: 6 },
                  then: "School age",
                },
              ],
              default: "Too young",
            },
          },
          {},
        ),
      ).toEqual("Preschool age");
    });

    it("prioritizes first matching case", () => {
      expect(
        apply(
          {
            $case: {
              value: 6,
              cases: [
                { when: { $gte: 0 }, then: "Any age" },
                { when: { $gte: 5 }, then: "School age" },
              ],
              default: "No age",
            },
          },
          {},
        ),
      ).toEqual("Any age");
    });

    it("handles literal values in when clause", () => {
      expect(
        apply(
          {
            $case: {
              value: 5,
              cases: [
                { when: "not matching", then: "Result" },
                { when: 5, then: "Found five" },
              ],
              default: "Default",
            },
          },
          {},
        ),
      ).toEqual("Found five");
    });

    it("handles expression values in when clause (literal mode)", () => {
      expect(
        apply(
          {
            $case: {
              value: 7,
              cases: [{ when: { $literal: 7 }, then: "Found seven" }],
              default: "Default",
            },
          },
          {},
        ),
      ).toEqual("Found seven");
    });

    it("handles expressions in value", () => {
      expect(
        apply(
          {
            $case: {
              value: { $get: "age" },
              cases: [
                { when: { $lt: 5 }, then: "Young" },
                { when: { $gte: 5 }, then: "Old enough" },
              ],
              default: "Unknown",
            },
          },
          { age: 3 },
        ),
      ).toEqual("Young");
    });

    it("handles expressions in then", () => {
      expect(
        apply(
          {
            $case: {
              value: 10,
              cases: [{ when: { $gt: 5 }, then: { $get: "message" } }],
              default: "Small",
            },
          },
          { message: "Big number!" },
        ),
      ).toEqual("Big number!");
    });

    it("handles expressions in default", () => {
      expect(
        apply(
          {
            $case: {
              value: 1,
              cases: [{ when: { $gt: 5 }, then: "Big" }],
              default: { $get: "smallMessage" },
            },
          },
          { smallMessage: "Very small" },
        ),
      ).toEqual("Very small");
    });
  });

  describe("evaluate form", () => {
    it("evaluates with boolean predicates", () => {
      expect(
        evaluate({
          $case: [
            {
              value: 7,
              cases: [
                { when: { $gt: 5 }, then: "Greater than 5" }, // Boolean predicate: is 7 > 5?
                { when: { $lt: 5 }, then: "Less than 5" }, // Boolean predicate: is 7 < 5?
              ],
              default: "Equal to 5",
            },
          ],
        }),
      ).toEqual("Greater than 5");
    });

    it("handles literal values in evaluate form", () => {
      expect(
        evaluate({
          $case: [
            {
              value: 5,
              cases: [
                { when: "not matching", then: "Result" },
                { when: 5, then: "Found five" },
              ],
              default: "Default",
            },
          ],
        }),
      ).toEqual("Found five");
    });

    it("supports unified behavior - mixed literal and expression cases", () => {
      expect(
        apply(
          {
            $case: {
              value: 4,
              cases: [
                { when: "active", then: "Status match" }, // Literal comparison
                { when: { $gt: 5 }, then: "Greater than 5" }, // Expression predicate
                { when: 4, then: "Exactly four" }, // Literal comparison
                { when: { $lt: 3 }, then: "Less than 3" }, // Expression predicate
              ],
              default: "No match",
            },
          },
          {},
        ),
      ).toEqual("Exactly four");
    });

    it("expression mode takes precedence over literal for expression-like objects", () => {
      expect(
        apply(
          {
            $case: {
              value: 10,
              cases: [
                { when: { $gt: 5 }, then: "Expression matched" }, // This should match as expression
                { when: 10, then: "Literal matched" }, // This would match if reached
              ],
              default: "No match",
            },
          },
          {},
        ),
      ).toEqual("Expression matched");
    });
  });
});

describe("$case - literal mode (unified behavior)", () => {
  describe("apply form", () => {
    it("matches first case", () => {
      expect(
        apply(
          {
            $case: {
              value: "playing",
              cases: [
                { when: "playing", then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
                { when: "eating", then: "Child is eating" },
              ],
              default: "Unknown activity",
            },
          },
          {},
        ),
      ).toEqual("Child is playing");
    });

    it("matches second case", () => {
      expect(
        apply(
          {
            $case: {
              value: "napping",
              cases: [
                { when: "playing", then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
                { when: "eating", then: "Child is eating" },
              ],
              default: "Unknown activity",
            },
          },
          {},
        ),
      ).toEqual("Child is napping");
    });

    it("returns default when no case matches", () => {
      expect(
        apply(
          {
            $case: {
              value: "crying",
              cases: [
                { when: "playing", then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
                { when: "eating", then: "Child is eating" },
              ],
              default: "Unknown activity",
            },
          },
          {},
        ),
      ).toEqual("Unknown activity");
    });

    it("handles expressions in value", () => {
      expect(
        apply(
          {
            $case: {
              value: { $get: "activity" },
              cases: [
                { when: "playing", then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
              ],
              default: "Unknown activity",
            },
          },
          { activity: "playing" },
        ),
      ).toEqual("Child is playing");
    });

    it("doesn't allow non-boolean expressions in when", () => {
      expect(() =>
        apply(
          {
            $case: {
              value: { $get: "activity" },
              cases: [
                { when: { $get: "playStatus" }, then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
              ],
              default: "Unknown activity",
            },
          },
          { activity: "playing", playStatus: "playing" },
        ),
      ).toThrow(
        "only expressions that return true of false may be used in when clauses",
      );
    });

    it("handles expressions in then", () => {
      expect(
        apply(
          {
            $case: {
              value: "playing",
              cases: [
                { when: "playing", then: { $get: "message" } },
                { when: "napping", then: "Child is napping" },
              ],
              default: "Unknown activity",
            },
          },
          { message: "Child is playing" },
        ),
      ).toEqual("Child is playing");
    });

    it("handles expressions in default", () => {
      expect(
        apply(
          {
            $case: {
              value: "crying",
              cases: [
                { when: "playing", then: "Child is playing" },
                { when: "napping", then: "Child is napping" },
              ],
              default: { $get: "defaultMessage" },
            },
          },
          { defaultMessage: "Unknown activity" },
        ),
      ).toEqual("Unknown activity");
    });

    it("evaluates value only once", () => {
      let callCount = 0;
      const testData = {
        get activity() {
          callCount++;
          return "playing";
        },
      };

      apply(
        {
          $case: {
            value: { $get: "activity" },
            cases: [
              { when: "playing", then: "Child is playing" },
              { when: "napping", then: "Child is napping" },
              { when: "eating", then: "Child is eating" },
            ],
            default: "Unknown activity",
          },
        },
        testData,
      );

      expect(callCount).toBe(1);
    });

    it("prioritizes first matching case", () => {
      expect(
        apply(
          {
            $case: {
              value: "playing",
              cases: [
                { when: "playing", then: "First match" },
                { when: "playing", then: "Second match" },
              ],
              default: "No match",
            },
          },
          {},
        ),
      ).toEqual("First match");
    });

    it("handles deep equality with child objects", () => {
      expect(
        apply(
          {
            $case: {
              value: { name: "Amara", age: 4, allergies: ["peanuts"] },
              cases: [
                {
                  when: { name: "Amara", age: 3, allergies: ["peanuts"] },
                  then: "Amara (3 years old)",
                },
                {
                  when: { name: "Amara", age: 4, allergies: ["peanuts"] },
                  then: "Amara (4 years old)",
                },
              ],
              default: "Child not found",
            },
          },
          {},
        ),
      ).toEqual("Amara (4 years old)");
    });

    it("should preserve literal expressions in then/else branches", () => {
      // This should preserve the literal expression and not execute it
      const result = apply({
        $if: {
          if: true,
          then: { $literal: { $get: "name" } },  // Should return expression object, not execute it
          else: "fallback"
        }
      }, { name: "Kenji" });

      // Should get the literal expression object, not "Kenji"
      expect(result).toEqual({ $get: "name" });
    });

    it("should preserve literal expressions in case branches", () => {
      // This should preserve literal expressions in then branches
      const result = apply({
        $case: {
          value: "active",
          cases: [
            { when: "active", then: { $literal: { $get: "name" } } },  // Should preserve expression
            { when: "inactive", then: "Child is sleeping" }
          ],
          default: "Unknown status"
        }
      }, { name: "Fatima" });

      // Should get the literal expression object, not "Fatima"
      expect(result).toEqual({ $get: "name" });
    });

    it("handles deep equality with meal arrays", () => {
      expect(
        apply(
          {
            $case: {
              value: ["apple", "crackers", "juice"],
              cases: [
                { when: ["banana", "crackers"], then: "Light snack" },
                { when: ["apple", "crackers", "juice"], then: "Full snack" },
                { when: ["sandwich", "fruit", "milk"], then: "Lunch meal" },
              ],
              default: "Unknown meal",
            },
          },
          {},
        ),
      ).toEqual("Full snack");
    });

    it("handles deep equality with nested child profiles", () => {
      expect(
        apply(
          {
            $case: {
              value: {
                child: { name: "Ravi", age: 3 },
                guardian: { name: "Priya", phone: "555-0123" },
              },
              cases: [
                {
                  when: {
                    child: { name: "Ravi", age: 2 },
                    guardian: { name: "Priya", phone: "555-0123" },
                  },
                  then: "Ravi (age 2) with Priya",
                },
                {
                  when: {
                    child: { name: "Ravi", age: 3 },
                    guardian: { name: "Priya", phone: "555-0123" },
                  },
                  then: "Ravi (age 3) with Priya",
                },
              ],
              default: "Profile not found",
            },
          },
          {},
        ),
      ).toEqual("Ravi (age 3) with Priya");
    });

    it("returns default when child profile deep equality fails", () => {
      expect(
        apply(
          {
            $case: {
              value: { name: "Zara", age: 5, room: "sunflower" },
              cases: [
                {
                  when: { name: "Zara", age: 4, room: "sunflower" },
                  then: "Zara in sunflower room (age 4)",
                },
                {
                  when: { name: "Zara", age: 5, room: "tulip" },
                  then: "Zara in tulip room (age 5)",
                },
              ],
              default: "Child assignment not found",
            },
          },
          {},
        ),
      ).toEqual("Child assignment not found");
    });
  });

  describe("evaluate form", () => {
    it("evaluates simple case matching", () => {
      const result = evaluate({
        $case: [
          {
            value: "playing",
            cases: [
              { when: "playing", then: "Child is playing" },
              { when: "napping", then: "Child is napping" },
            ],
            default: "Unknown",
          },
          "playing",
        ],
      });
      expect(result).toEqual("Child is playing");
    });

    it("evaluates deep equality with teacher objects in evaluate form", () => {
      const result = evaluate({
        $case: [
          {
            value: {
              name: "Kenji Tanaka",
              room: "rainbow",
              certification: "early childhood",
            },
            cases: [
              {
                when: {
                  name: "Kenji Tanaka",
                  room: "rainbow",
                  certification: "early childhood",
                },
                then: "Rainbow room teacher",
              },
              {
                when: {
                  name: "Kenji Tanaka",
                  room: "sunshine",
                  certification: "early childhood",
                },
                then: "Sunshine room teacher",
              },
            ],
            default: "Teacher not assigned",
          },
        ],
      });
      expect(result).toEqual("Rainbow room teacher");
    });

    it("evaluates deep equality with activity schedules in evaluate form", () => {
      const result = evaluate({
        $case: [
          {
            value: ["circle time", "outdoor play", "snack", "art"],
            cases: [
              {
                when: ["circle time", "outdoor play", "snack", "art"],
                then: "Morning schedule",
              },
              {
                when: ["story time", "quiet play", "lunch"],
                then: "Afternoon schedule",
              },
            ],
            default: "Schedule not found",
          },
        ],
      });
      expect(result).toEqual("Morning schedule");
    });
  });
});

describe("$if", () => {
  describe("apply form", () => {
    it("handles a true value", () => {
      expect(
        apply(
          { $if: { if: { $eq: "Arnar" }, then: "yep", else: "nope" } },
          "Arnar",
        ),
      ).toEqual("yep");
    });

    it("handles a false value", () => {
      expect(
        apply(
          { $if: { if: { $eq: "Arnar" }, then: "yep", else: "nope" } },
          "Sakura",
        ),
      ).toEqual("nope");
    });

    it("handles a true expression", () => {
      expect(
        apply(
          {
            $if: {
              if: { $eq: { name: "Arnar" } },
              then: { $get: "name" },
              else: "nope",
            },
          },
          { name: "Arnar" },
        ),
      ).toEqual("Arnar");
    });

    it("handles a false expression", () => {
      expect(
        apply(
          {
            $if: {
              if: { $eq: { name: "Arnar" } },
              then: "yep",
              else: { $get: "age" },
            },
          },
          { name: "Sakura", age: 50 },
        ),
      ).toEqual(50);
    });

    it("handles a true if value", () => {
      expect(
        apply({ $if: { if: true, then: "yep", else: "nope" } }, "Arnar"),
      ).toEqual("yep");
    });

    it("handles a false if value", () => {
      expect(
        apply({ $if: { if: false, then: "yep", else: "nope" } }, "Arnar"),
      ).toEqual("nope");
    });

    it("throws with an non-expression/non-boolean if value", () => {
      expect(() => {
        apply({ $if: { if: "Chicken", then: "yep", else: "nope" } }, "Sakura");
      }).toThrowError();
    });
  });

  describe("evaluate form", () => {
    it("evaluates with boolean condition", () => {
      expect(evaluate({ $if: { if: true, then: "yes", else: "no" } })).toEqual(
        "yes",
      );
      expect(evaluate({ $if: { if: false, then: "yes", else: "no" } })).toEqual(
        "no",
      );
    });

    it("evaluates with expression condition", () => {
      expect(
        evaluate({
          $if: { if: { $eq: [5, 5] }, then: "equal", else: "not equal" },
        }),
      ).toEqual("equal");
      expect(
        evaluate({
          $if: { if: { $eq: [5, 3] }, then: "equal", else: "not equal" },
        }),
      ).toEqual("not equal");
    });
  });
});
