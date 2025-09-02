import { describe, expect, it } from "vitest";
import { defaultExpressionEngine } from "../../src/index.js";

const kids = {
	ximena: { name: "Ximena", age: 4 },
	yousef: { name: "Yousef", age: 5 },
	zoë: { name: "Zoë", age: 6 },
};

const { apply, evaluate } = defaultExpressionEngine;

describe("apply", () => {
	describe("the $eq expression", () => {
		it("is determined deeply", async () => {
			const expression = {
				$eq: [3, { chicken: "butt" }],
			};
			expect(apply(expression, [3, { chicken: "butt" }])).toBe(true);
		});
	});

	it("implements the $gt expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $gt: 5 }] };

		expect(apply(exp, kids.ximena)).toBe(false);
		expect(apply(exp, kids.yousef)).toBe(false);
		expect(apply(exp, kids.zoë)).toBe(true);
	});

	it("implements the $gte expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $gte: 5 }] };

		expect(apply(exp, kids.ximena)).toBe(false);
		expect(apply(exp, kids.yousef)).toBe(true);
		expect(apply(exp, kids.zoë)).toBe(true);
	});

	it("implements the $lt expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $lt: 5 }] };

		expect(apply(exp, kids.ximena)).toBe(true);
		expect(apply(exp, kids.yousef)).toBe(false);
		expect(apply(exp, kids.zoë)).toBe(false);
	});

	it("implements the $lte expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $lte: 5 }] };

		expect(apply(exp, kids.ximena)).toBe(true);
		expect(apply(exp, kids.yousef)).toBe(true);
		expect(apply(exp, kids.zoë)).toBe(false);
	});

	it("implements the $ne expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $ne: 5 }] };

		expect(apply(exp, kids.ximena)).toBe(true);
		expect(apply(exp, kids.yousef)).toBe(false);
		expect(apply(exp, kids.zoë)).toBe(true);
	});

	it("implements the $in expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $in: [4, 6] }] };

		expect(apply(exp, kids.ximena)).toBe(true);
		expect(apply(exp, kids.yousef)).toBe(false);
		expect(apply(exp, kids.zoë)).toBe(true);
	});

	it("implements the $nin expression", () => {
		const exp = { $pipe: [{ $get: "age" }, { $nin: [4, 6] }] };

		expect(apply(exp, kids.ximena)).toBe(false);
		expect(apply(exp, kids.yousef)).toBe(true);
		expect(apply(exp, kids.zoë)).toBe(false);
	});
});

describe("evaluate", () => {
	const { evaluate } = defaultExpressionEngine;

	// $eq is pure mathematical - no currying needed, same operand for apply and evaluate
	it("$eq evaluates static comparisons", () => {
		expect(evaluate({ $eq: [5, 5] })).toBe(true);
		expect(evaluate({ $eq: [5, 10] })).toBe(false);
		expect(evaluate({ $eq: [{ a: 1 }, { a: 1 }] })).toBe(true);
	});

	it("$ne evaluates static comparisons", () => {
		expect(evaluate({ $ne: [5, 10] })).toBe(true);
		expect(evaluate({ $ne: [5, 5] })).toBe(false);
	});

	it("$gt evaluates static comparisons", () => {
		expect(evaluate({ $gt: [10, 5] })).toBe(true);
		expect(evaluate({ $gt: [5, 10] })).toBe(false);
		expect(evaluate({ $gt: [5, 5] })).toBe(false);
	});

	it("$gte evaluates static comparisons", () => {
		expect(evaluate({ $gte: [10, 5] })).toBe(true);
		expect(evaluate({ $gte: [5, 5] })).toBe(true);
		expect(evaluate({ $gte: [5, 10] })).toBe(false);
	});

	it("$lt evaluates static comparisons", () => {
		expect(evaluate({ $lt: [5, 10] })).toBe(true);
		expect(evaluate({ $lt: [10, 5] })).toBe(false);
		expect(evaluate({ $lt: [5, 5] })).toBe(false);
	});

	it("$lte evaluates static comparisons", () => {
		expect(evaluate({ $lte: [5, 10] })).toBe(true);
		expect(evaluate({ $lte: [5, 5] })).toBe(true);
		expect(evaluate({ $lte: [10, 5] })).toBe(false);
	});

	it("$in evaluates static array membership", () => {
		expect(evaluate({ $in: [[1, 2, 3], 2] })).toBe(true);
		expect(evaluate({ $in: [[1, 2, 3], 5] })).toBe(false);
	});

	it("$in throws error for non-array parameter in evaluate", () => {
		expect(() => evaluate({ $in: ["not-array", 2] })).toThrow(
			"$in parameter must be an array",
		);
	});

	it("$nin evaluates static array membership", () => {
		expect(evaluate({ $nin: [[1, 2, 3], 5] })).toBe(true);
		expect(evaluate({ $nin: [[1, 2, 3], 2] })).toBe(false);
	});

	it("$nin throws error for non-array operand in evaluate", () => {
		expect(() => apply({ $nin: 2 })).toThrow();
	});

	it("$nin throws error for non-array parameter in evaluate", () => {
		expect(() => evaluate({ $nin: ["not-array", 2] })).toThrow(
			"$nin parameter must be an array",
		);
	});
});

describe("$matchesRegex", () => {
	describe("apply form", () => {
		it("should match a simple pattern", () => {
			expect(apply({ $matchesRegex: "hello" }, "hello world")).toBe(true);
			expect(apply({ $matchesRegex: "hello" }, "goodbye world")).toBe(false);
		});

		it("should match complex patterns", () => {
			expect(
				apply({ $matchesRegex: "\\d{3}-\\d{2}-\\d{4}" }, "123-45-6789"),
			).toBe(true);
			expect(
				apply({ $matchesRegex: "\\d{3}-\\d{2}-\\d{4}" }, "12-345-6789"),
			).toBe(false);
		});

		it("should handle start and end anchors", () => {
			expect(apply({ $matchesRegex: "^hello" }, "hello world")).toBe(true);
			expect(apply({ $matchesRegex: "^hello" }, "say hello")).toBe(false);
			expect(apply({ $matchesRegex: "world$" }, "hello world")).toBe(true);
			expect(apply({ $matchesRegex: "world$" }, "world peace")).toBe(false);
		});

		it("should handle case-sensitive matching by default", () => {
			expect(apply({ $matchesRegex: "Hello" }, "Hello World")).toBe(true);
			expect(apply({ $matchesRegex: "Hello" }, "hello world")).toBe(false);
		});

		it("should support case-insensitive flag", () => {
			expect(apply({ $matchesRegex: "(?i)hello" }, "Hello World")).toBe(true);
			expect(apply({ $matchesRegex: "(?i)hello" }, "HELLO WORLD")).toBe(true);
			expect(apply({ $matchesRegex: "(?i)hello" }, "goodbye")).toBe(false);
		});

		it("should support multiline flag", () => {
			const text = "line1\nline2\nline3";
			expect(apply({ $matchesRegex: "(?m)^line2" }, text)).toBe(true);
			expect(apply({ $matchesRegex: "^line2" }, text)).toBe(false);
		});

		it("should support dotall flag", () => {
			const text = "hello\nworld";
			expect(apply({ $matchesRegex: "(?s)hello.world" }, text)).toBe(true);
			expect(apply({ $matchesRegex: "hello.world" }, text)).toBe(false);
		});

		it("should support combined flags", () => {
			const text = "Hello\nWORLD";
			expect(apply({ $matchesRegex: "(?ims)^hello.world$" }, text)).toBe(true);
			expect(apply({ $matchesRegex: "(?is)hello.world" }, text)).toBe(true);
			expect(apply({ $matchesRegex: "(?i)hello.world" }, text)).toBe(false); // no dotall
		});

		it("should handle unsupported flags gracefully", () => {
			expect(apply({ $matchesRegex: "(?x)hello" }, "hello")).toBe(true); // unsupported flag stripped
			expect(apply({ $matchesRegex: "(?q)test" }, "test")).toBe(true); // unsupported flag stripped
			expect(apply({ $matchesRegex: "hello" }, "hello")).toBe(true); // no flags
		});

		it("should throw when input is not a string", () => {
			expect(() => apply({ $matchesRegex: "pattern" }, 123)).toThrow(
				"$matchesRegex requires string input",
			);
			expect(() => apply({ $matchesRegex: "pattern" }, null)).toThrow(
				"$matchesRegex requires string input",
			);
			expect(() => apply({ $matchesRegex: "pattern" }, undefined)).toThrow(
				"$matchesRegex requires string input",
			);
			expect(() => apply({ $matchesRegex: "pattern" }, [])).toThrow(
				"$matchesRegex requires string input",
			);
			expect(() => apply({ $matchesRegex: "pattern" }, {})).toThrow(
				"$matchesRegex requires string input",
			);
		});

		it("should handle invalid regex patterns", () => {
			expect(() => apply({ $matchesRegex: "[" }, "test")).toThrow(); // Invalid regex
			expect(() => apply({ $matchesRegex: "(?i)[" }, "test")).toThrow(); // Invalid regex with flags
		});
	});

	describe("evaluate form", () => {
		it("should work with evaluate form", () => {
			expect(evaluate({ $matchesRegex: ["hello", "hello world"] })).toBe(true);
			expect(evaluate({ $matchesRegex: ["hello", "goodbye world"] })).toBe(
				false,
			);
		});

		it("should work with flags in evaluate form", () => {
			expect(evaluate({ $matchesRegex: ["(?i)hello", "HELLO WORLD"] })).toBe(
				true,
			);
			expect(evaluate({ $matchesRegex: ["(?m)^line2", "line1\nline2"] })).toBe(
				true,
			);
		});

		it("should throw with invalid input in evaluate form", () => {
			expect(() => evaluate({ $matchesRegex: ["pattern", 123] })).toThrow(
				"$matchesRegex requires string input",
			);
		});
	});

	describe("edge cases", () => {
		it("should handle empty string input", () => {
			expect(apply({ $matchesRegex: "" }, "")).toBe(true);
			expect(apply({ $matchesRegex: "test" }, "")).toBe(false);
			expect(apply({ $matchesRegex: ".*" }, "")).toBe(true);
		});

		it("should handle special regex characters in pattern", () => {
			expect(apply({ $matchesRegex: "\\$\\^\\*\\+\\?\\." }, "$^*+?.")).toBe(
				true,
			);
			expect(apply({ $matchesRegex: "test\\.com" }, "test.com")).toBe(true);
			expect(apply({ $matchesRegex: "test\\.com" }, "testXcom")).toBe(false);
		});

		it("should handle unicode characters", () => {
			expect(apply({ $matchesRegex: "café" }, "café")).toBe(true);
			expect(apply({ $matchesRegex: "(?i)café" }, "CAFÉ")).toBe(true);
		});
	});
});

describe("$matchesLike", () => {
	it("handles basic LIKE patterns", () => {
		expect(apply({ $matchesLike: "hello%" }, "hello world")).toBe(true);
		expect(apply({ $matchesLike: "hello%" }, "hello")).toBe(true);
		expect(apply({ $matchesLike: "hello%" }, "hi")).toBe(false);

		expect(apply({ $matchesLike: "%world" }, "hello world")).toBe(true);
		expect(apply({ $matchesLike: "%world" }, "world")).toBe(true);
		expect(apply({ $matchesLike: "%world" }, "hi")).toBe(false);

		expect(apply({ $matchesLike: "h_llo" }, "hello")).toBe(true);
		expect(apply({ $matchesLike: "h_llo" }, "hallo")).toBe(true);
		expect(apply({ $matchesLike: "h_llo" }, "hxllo")).toBe(true);
		expect(apply({ $matchesLike: "h_llo" }, "hllo")).toBe(false);
		expect(apply({ $matchesLike: "h_llo" }, "hello world")).toBe(false);
	});

	it("handles email patterns", () => {
		expect(apply({ $matchesLike: "%@gmail.com" }, "test@gmail.com")).toBe(true);
		expect(apply({ $matchesLike: "%@gmail.com" }, "user123@gmail.com")).toBe(
			true,
		);
		expect(apply({ $matchesLike: "%@gmail.com" }, "test@yahoo.com")).toBe(
			false,
		);
	});

	it("escapes regex special characters", () => {
		expect(apply({ $matchesLike: "test.txt" }, "test.txt")).toBe(true);
		expect(apply({ $matchesLike: "test.txt" }, "testXtxt")).toBe(false); // . should be literal
		expect(apply({ $matchesLike: "a+b" }, "a+b")).toBe(true);
		expect(apply({ $matchesLike: "a+b" }, "aab")).toBe(false); // + should be literal
	});
});

describe("$matchesGlob", () => {
	it("handles basic GLOB patterns", () => {
		expect(apply({ $matchesGlob: "hello*" }, "hello world")).toBe(true);
		expect(apply({ $matchesGlob: "hello*" }, "hello")).toBe(true);
		expect(apply({ $matchesGlob: "hello*" }, "hi")).toBe(false);

		expect(apply({ $matchesGlob: "*world" }, "hello world")).toBe(true);
		expect(apply({ $matchesGlob: "*world" }, "world")).toBe(true);
		expect(apply({ $matchesGlob: "*world" }, "hi")).toBe(false);

		expect(apply({ $matchesGlob: "h?llo" }, "hello")).toBe(true);
		expect(apply({ $matchesGlob: "h?llo" }, "hallo")).toBe(true);
		expect(apply({ $matchesGlob: "h?llo" }, "hxllo")).toBe(true);
		expect(apply({ $matchesGlob: "h?llo" }, "hllo")).toBe(false);
		expect(apply({ $matchesGlob: "h?llo" }, "hello world")).toBe(false);
	});

	it("handles character classes", () => {
		expect(apply({ $matchesGlob: "[hw]ello" }, "hello")).toBe(true);
		expect(apply({ $matchesGlob: "[hw]ello" }, "wello")).toBe(true);
		expect(apply({ $matchesGlob: "[hw]ello" }, "bello")).toBe(false);

		expect(apply({ $matchesGlob: "[A-Z]*" }, "Hello")).toBe(true);
		expect(apply({ $matchesGlob: "[A-Z]*" }, "hello")).toBe(false);

		expect(apply({ $matchesGlob: "[!hw]ello" }, "bello")).toBe(true);
		expect(apply({ $matchesGlob: "[!hw]ello" }, "hello")).toBe(false);
		expect(apply({ $matchesGlob: "[!hw]ello" }, "wello")).toBe(false);
	});

	it("handles file extensions", () => {
		expect(apply({ $matchesGlob: "*.txt" }, "file.txt")).toBe(true);
		expect(apply({ $matchesGlob: "*.txt" }, "document.txt")).toBe(true);
		expect(apply({ $matchesGlob: "*.txt" }, "file.pdf")).toBe(false);

		expect(
			apply({ $matchesGlob: "IMG_[0-9][0-9][0-9][0-9]" }, "IMG_1234"),
		).toBe(true);
		expect(
			apply({ $matchesGlob: "IMG_[0-9][0-9][0-9][0-9]" }, "IMG_abcd"),
		).toBe(false);
	});

	it("escapes regex special characters", () => {
		expect(apply({ $matchesGlob: "test.txt" }, "test.txt")).toBe(true);
		expect(apply({ $matchesGlob: "test.txt" }, "testXtxt")).toBe(false); // . should be literal
		expect(apply({ $matchesGlob: "a+b" }, "a+b")).toBe(true);
		expect(apply({ $matchesGlob: "a+b" }, "aab")).toBe(false); // + should be literal
	});
});
