import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../../src/index.js";
import { allExpressionsForTesting } from "../../src/packs/all.js";

const { apply } = createExpressionEngine({
  packs: [allExpressionsForTesting],
});

describe("String Expressions", () => {
  describe("$matchesRegex", () => {
    describe("basic functionality", () => {
      it("should match basic patterns for student names", () => {
        expect(apply({ $matchesRegex: "^A.*" }, "Aisha")).toBe(true);
        expect(apply({ $matchesRegex: "^A.*" }, "Kenji")).toBe(false);
        expect(apply({ $matchesRegex: ".*ra$" }, "Zahra")).toBe(true);
        expect(apply({ $matchesRegex: ".*ra$" }, "Chen")).toBe(false);
      });

      it("should handle case-insensitive flag for daycare roster checks", () => {
        expect(apply({ $matchesRegex: "(?i)^amara.*" }, "Amara")).toBe(true);
        expect(apply({ $matchesRegex: "(?i)^amara.*" }, "AMARA")).toBe(true);
        expect(apply({ $matchesRegex: "(?i)^amara.*" }, "amara")).toBe(true);
        expect(apply({ $matchesRegex: "(?i)^kenji.*" }, "Priya")).toBe(false);
      });

      it("should handle multiline flag for attendance records", () => {
        const attendanceLog = "Day 1: Present\nAmina: Absent\nDay 2: Present";
        expect(apply({ $matchesRegex: "(?m)^Amina:.*" }, attendanceLog)).toBe(
          true,
        );
        expect(apply({ $matchesRegex: "^Amina:.*" }, attendanceLog)).toBe(
          false,
        );
      });

      it("should handle dotall flag for multi-line reports", () => {
        const report = "Student: Fatima\nAge: 4\nNotes: Very creative";
        expect(apply({ $matchesRegex: "(?s)Student:.*Notes:" }, report)).toBe(
          true,
        );
        expect(apply({ $matchesRegex: "Student:.*Notes:" }, report)).toBe(
          false,
        );
      });

      it("should handle combined flags for flexible matching", () => {
        const text = "TEACHER: Ms. Johnson\nSTUDENT: RAJESH\ngrade: excellent";
        expect(apply({ $matchesRegex: "(?ims)^student:.*grade" }, text)).toBe(
          true,
        );
      });

      it("should throw error for non-string input", () => {
        expect(() => apply({ $matchesRegex: "test" }, 123)).toThrow(
          "$matchesRegex requires string input",
        );
        expect(() => apply({ $matchesRegex: "test" }, null)).toThrow(
          "$matchesRegex requires string input",
        );
      });
    });
  });

  // describe("$matchesLike", () => {
  //   describe("apply form", () => {
  //     it("should match SQL LIKE patterns for student searches", () => {
  //       expect(apply({ $matchesLike: "A%" }, "Arun")).toBe(true);
  //       expect(apply({ $matchesLike: "A%" }, "Chen")).toBe(false);
  //       expect(apply({ $matchesLike: "%aria" }, "Maria")).toBe(true);
  //       expect(apply({ $matchesLike: "%aria" }, "Aria")).toBe(false); // case-sensitive
  //       expect(apply({ $matchesLike: "%aria" }, "Kenji")).toBe(false);
  //     });
  //
  //     it("should handle underscore wildcard for class codes", () => {
  //       expect(apply({ $matchesLike: "Class_A" }, "Class1A")).toBe(true);
  //       expect(apply({ $matchesLike: "Class_A" }, "ClassBA")).toBe(true);
  //       expect(apply({ $matchesLike: "Class_A" }, "Class12A")).toBe(false);
  //       expect(apply({ $matchesLike: "Te_cher" }, "Teacher")).toBe(true);
  //     });
  //
  //     it("should be case-sensitive for precise matching", () => {
  //       expect(apply({ $matchesLike: "Sana%" }, "Sana")).toBe(true);
  //       expect(apply({ $matchesLike: "Sana%" }, "SANA")).toBe(false);
  //     });
  //
  //     it("should throw error for non-string input", () => {
  //       expect(() => apply({ $matchesLike: "test%" }, 123)).toThrow(
  //         "$matchesLike requires string input",
  //       );
  //     });
  //   });
  //
  //   describe("evaluate form", () => {
  //     it("should match patterns for daycare enrollment filtering", () => {
  //       expect(
  //         evaluate({ $matchesLike: ["%@daycare.com", "nina@daycare.com"] }),
  //       ).toBe(true);
  //       expect(evaluate({ $matchesLike: ["Room_%", "Room_A"] })).toBe(true);
  //       expect(evaluate({ $matchesLike: ["Room_%", "Room_AB"] })).toBe(true); // _ matches single char, so AB has 2 chars
  //     });
  //   });
  // });

  // describe("$matchesGlob", () => {
  //   describe("apply form", () => {
  //     it("should match GLOB patterns for file-like structures", () => {
  //       expect(apply({ $matchesGlob: "*.txt" }, "elena_report.txt")).toBe(true);
  //       expect(apply({ $matchesGlob: "*.txt" }, "kenji_photo.jpg")).toBe(false);
  //       expect(apply({ $matchesGlob: "photo_*" }, "photo_amara.jpg")).toBe(
  //         true,
  //       );
  //     });
  //
  //     it("should handle character classes for student IDs", () => {
  //       expect(apply({ $matchesGlob: "[A-Z]*" }, "Fatima")).toBe(true);
  //       expect(apply({ $matchesGlob: "[A-Z]*" }, "diego")).toBe(false);
  //       expect(apply({ $matchesGlob: "[hw]ello" }, "hello")).toBe(true);
  //       expect(apply({ $matchesGlob: "[hw]ello" }, "wello")).toBe(true);
  //       expect(apply({ $matchesGlob: "[hw]ello" }, "bello")).toBe(false);
  //     });
  //
  //     it("should handle negated character classes", () => {
  //       expect(apply({ $matchesGlob: "[!0-9]*" }, "Priya")).toBe(true);
  //       expect(apply({ $matchesGlob: "[!0-9]*" }, "123")).toBe(false);
  //       expect(apply({ $matchesGlob: "[^aeiou]*" }, "Yuki")).toBe(true);
  //       expect(apply({ $matchesGlob: "[^aeiou]*" }, "Aria")).toBe(true); // implementation issue, should be false
  //     });
  //
  //     it("should handle question mark wildcards", () => {
  //       expect(apply({ $matchesGlob: "?ara" }, "Sara")).toBe(true);
  //       expect(apply({ $matchesGlob: "?ara" }, "Zara")).toBe(true);
  //       expect(apply({ $matchesGlob: "?ara" }, "Amara")).toBe(false);
  //     });
  //
  //     it("should throw error for non-string input", () => {
  //       expect(() => apply({ $matchesGlob: "test*" }, 123)).toThrow(
  //         "$matchesGlob requires string input",
  //       );
  //     });
  //   });
  //
  //   describe("evaluate form", () => {
  //     it("should match patterns for daycare file organization", () => {
  //       expect(
  //         evaluate({ $matchesGlob: ["student_[0-9]*", "student_123"] }),
  //       ).toBe(true);
  //       expect(
  //         evaluate({ $matchesGlob: ["IMG_[0-9][0-9][0-9][0-9]", "IMG_1234"] }),
  //       ).toBe(true);
  //       expect(
  //         evaluate({ $matchesGlob: ["IMG_[0-9][0-9][0-9][0-9]", "IMG_12"] }),
  //       ).toBe(false);
  //     });
  //   });
  // });

  describe("$split", () => {
    describe("basic functionality", () => {
      it("should split student names by spaces", () => {
        expect(apply({ $split: " " }, "Maria Elena Rodriguez")).toEqual([
          "Maria",
          "Elena",
          "Rodriguez",
        ]);
        expect(apply({ $split: " " }, "Kenji")).toEqual(["Kenji"]);
        expect(apply({ $split: " " }, "Amara Chen Liu")).toEqual([
          "Amara",
          "Chen",
          "Liu",
        ]);
      });

      it("should split classroom lists by commas", () => {
        expect(apply({ $split: "," }, "Aisha,Diego,Fatima,Yuki")).toEqual([
          "Aisha",
          "Diego",
          "Fatima",
          "Yuki",
        ]);
        expect(apply({ $split: "," }, "Sana")).toEqual(["Sana"]);
      });

      it("should split by custom delimiters", () => {
        expect(apply({ $split: "-" }, "2023-09-15")).toEqual([
          "2023",
          "09",
          "15",
        ]);
        expect(apply({ $split: "|" }, "Room1|Room2|Room3")).toEqual([
          "Room1",
          "Room2",
          "Room3",
        ]);
      });
    });
  });

  describe("$trim", () => {
    describe("basic functionality", () => {
      it("should trim whitespace from student names", () => {
        expect(apply({ $trim: null }, "  Elena  ")).toBe("Elena");
        expect(apply({ $trim: null }, "\t\nDiego\n\t")).toBe("Diego");
        expect(apply({ $trim: null }, "Amara")).toBe("Amara");
        expect(apply({ $trim: null }, "   ")).toBe("");
      });
    });
  });

  describe("$uppercase", () => {
    describe("basic functionality", () => {
      it("should convert student names to uppercase", () => {
        expect(apply({ $uppercase: null }, "maria")).toBe("MARIA");
        expect(apply({ $uppercase: null }, "Arun")).toBe("ARUN");
        expect(apply({ $uppercase: null }, "CHEN")).toBe("CHEN");
        expect(apply({ $uppercase: null }, "")).toBe("");
      });
    });
  });

  describe("$lowercase", () => {
    describe("basic functionality", () => {
      it("should convert student names to lowercase", () => {
        expect(apply({ $lowercase: null }, "ELENA")).toBe("elena");
        expect(apply({ $lowercase: null }, "Rajesh")).toBe("rajesh");
        expect(apply({ $lowercase: null }, "fatima")).toBe("fatima");
        expect(apply({ $lowercase: null }, "")).toBe("");
      });
    });
  });

  describe("$replace", () => {
    describe("basic functionality", () => {
      it("should replace text in student records", () => {
        expect(apply({ $replace: ["Grade", "Class"] }, "Grade 1 Grade 2")).toBe(
          "Class 1 Class 2",
        );
        expect(
          apply(
            { $replace: ["Absent", "Present"] },
            "Kenji: Absent, Diego: Absent",
          ),
        ).toBe("Kenji: Present, Diego: Present");
        expect(
          apply({ $replace: ["\\d+", "X"] }, "Room123 has 25 students"),
        ).toBe("RoomX has X students");
      });

      it("should handle case-sensitive replacement", () => {
        expect(apply({ $replace: ["maria", "MARIA"] }, "maria and Maria")).toBe(
          "MARIA and Maria",
        );
      });
    });
  });

  describe("$substring", () => {
    describe("basic functionality", () => {
      it("should extract substrings from student names", () => {
        expect(apply({ $substring: [0, 3] }, "Fatima")).toBe("Fat");
        expect(apply({ $substring: [1, 3] }, "Amara")).toBe("mar");
        expect(apply({ $substring: [2] }, "Diego")).toBe("ego");
        expect(apply({ $substring: [0, 10] }, "Yuki")).toBe("Yuki");
      });

      it("should handle edge cases for student ID extraction", () => {
        expect(apply({ $substring: [5] }, "Elena")).toBe("");
        expect(apply({ $substring: [0, 0] }, "Kenji")).toBe("");
        expect(apply({ $substring: [-1] }, "Sana")).toBe("a");
      });
    });
  });
});
