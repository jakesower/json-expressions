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

    it("throws when when clause doesn't resolve to boolean", () => {
      expect(() => {
        apply(
          {
            $case: {
              value: 5,
              cases: [{ when: "not a boolean", then: "Result" }],
              default: "Default",
            },
          },
          {},
        );
      }).toThrowError(
        '$case.when must resolve to a boolean, got "not a boolean"',
      );
    });

    it("throws when when clause resolves to number", () => {
      expect(() => {
        apply(
          {
            $case: {
              value: 5,
              cases: [{ when: { $add: 2 }, then: "Result" }],
              default: "Default",
            },
          },
          {},
        );
      }).toThrowError("$case.when must resolve to a boolean, got 7");
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
                { when: { $gt: [7, 5] }, then: "Greater than 5" },
                { when: { $lt: [7, 5] }, then: "Less than 5" },
              ],
              default: "Equal to 5",
            },
          ],
        }),
      ).toEqual("Greater than 5");
    });

    it("throws on non-boolean when in evaluate form", () => {
      expect(() => {
        evaluate({
          $case: [
            {
              value: 5,
              cases: [{ when: "not boolean", then: "Result" }],
              default: "Default",
            },
          ],
        });
      }).toThrowError("$case.when must resolve to a boolean");
    });
  });
});

describe("$switch", () => {
  describe("apply form", () => {
    it("matches first case", () => {
      expect(
        apply(
          {
            $switch: {
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
            $switch: {
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
            $switch: {
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
            $switch: {
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

    it("handles expressions in when", () => {
      expect(
        apply(
          {
            $switch: {
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
      ).toEqual("Child is playing");
    });

    it("handles expressions in then", () => {
      expect(
        apply(
          {
            $switch: {
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
            $switch: {
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
          $switch: {
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
            $switch: {
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
            $switch: {
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

    it("handles deep equality with meal arrays", () => {
      expect(
        apply(
          {
            $switch: {
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
            $switch: {
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
            $switch: {
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
        $switch: [
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
        $switch: [
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
        $switch: [
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
