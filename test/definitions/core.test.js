import { describe, expect, it, vi } from "vitest";
import { defaultExpressionEngine } from "../../src/index.js";

const { apply, evaluate } = defaultExpressionEngine;


describe("$debug", () => {
	it("applies debug expression and logs result", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		expect(apply({ $debug: { $get: "name" } }, { name: "test" })).toEqual(
			"test",
		);
		expect(consoleSpy).toHaveBeenCalledWith("test");
		consoleSpy.mockRestore();
	});

	it("debugs identity expression", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		expect(apply({ $debug: { $literal: "input" } }, "input")).toEqual("input");
		expect(consoleSpy).toHaveBeenCalledWith("input");
		consoleSpy.mockRestore();
	});

	describe("evaluate form", () => {
		it("evaluates debug expression and logs result", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			expect(evaluate({ $debug: { $sum: [1, 2, 3] } })).toEqual(6);
			expect(consoleSpy).toHaveBeenCalledWith(6);
			consoleSpy.mockRestore();
		});

		it("debugs literal values", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			expect(evaluate({ $debug: { $literal: "hello" } })).toEqual("hello");
			expect(consoleSpy).toHaveBeenCalledWith("hello");
			consoleSpy.mockRestore();
		});
	});
});

describe("$ensurePath", () => {
	it("echo with a valid path", () => {
		expect(apply({ $ensurePath: "name" }, { name: "Arnar" })).toEqual({
			name: "Arnar",
		});
	});

	it("echo with a valid nested path", () => {
		expect(
			apply({ $ensurePath: "hello.name" }, { hello: { name: "Arnar" } }),
		).toEqual({ hello: { name: "Arnar" } });
	});

	it("throws filtering on invalid attribute names", () => {
		expect(() => {
			apply({ $ensurePath: "hello.name" }, { name: "Arnar" });
		}).toThrowError();
	});

	describe("evaluate form", () => {
		const { evaluate } = defaultExpressionEngine;

		it("validates object has a valid path", () => {
			expect(evaluate({ $ensurePath: [{ name: "Arnar" }, "name"] })).toEqual({
				name: "Arnar",
			});
		});

		it("validates object has a valid nested path", () => {
			expect(
				evaluate({ $ensurePath: [{ hello: { name: "Arnar" } }, "hello.name"] }),
			).toEqual({ hello: { name: "Arnar" } });
		});

		it("throws when object missing a path", () => {
			expect(() => {
				evaluate({ $ensurePath: [{ name: "Arnar" }, "hello.name"] });
			}).toThrowError();
		});

		it("throws when object missing a nested path", () => {
			expect(() => {
				evaluate({ $ensurePath: [{ hello: {} }, "hello.name"] });
			}).toThrowError();
		});

		it("works with deeply nested paths", () => {
			expect(
				evaluate({
					$ensurePath: [{ a: { b: { c: { d: "found" } } } }, "a.b.c.d"],
				}),
			).toEqual({ a: { b: { c: { d: "found" } } } });
		});

		it("throws when deeply nested path is incomplete", () => {
			expect(() => {
				evaluate({ $ensurePath: [{ a: { b: { c: {} } } }, "a.b.c.d"] });
			}).toThrowError();
		});

		it("throws with non-array operand", () => {
			expect(() => {
				evaluate({ $ensurePath: "user.name" });
			}).toThrowError(
				"$ensurePath evaluate form requires array operand: [object, path]",
			);
		});
	});
});

describe("$isDefined", () => {
	describe("evaluate form", () => {
		const { evaluate } = defaultExpressionEngine;

		it("returns true for defined values", () => {
			expect(evaluate({ $isDefined: ["hello"] })).toBe(true);
			expect(evaluate({ $isDefined: [0] })).toBe(true);
			expect(evaluate({ $isDefined: [false] })).toBe(true);
			expect(evaluate({ $isDefined: [null] })).toBe(true);
		});

		it("returns false for undefined values", () => {
			expect(evaluate({ $isDefined: [undefined] })).toBe(false);
		});

		it("works with complex values", () => {
			expect(evaluate({ $isDefined: [{ name: "test" }] })).toBe(true);
			expect(evaluate({ $isDefined: [[1, 2, 3]] })).toBe(true);
		});

		it("throws with non-array operand", () => {
			expect(() => {
				evaluate({ $isDefined: null });
			}).toThrowError(
				"$isDefined evaluate form requires array operand: [value]",
			);
		});
	});
});


describe("$get", () => {
	describe("evaluate form", () => {
		const { evaluate } = defaultExpressionEngine;

		it("gets value from object using array syntax", () => {
			expect(evaluate({ $get: [{ name: "Arnar", age: 30 }, "name"] })).toEqual(
				"Arnar",
			);
		});

		it("gets nested value from object", () => {
			expect(
				evaluate({ $get: [{ user: { name: "Arnar" } }, "user.name"] }),
			).toEqual("Arnar");
		});

		it("throws with non-array operand", () => {
			expect(() => {
				evaluate({ $get: "name" });
			}).toThrowError(
				"$get evaluate form requires array operand: [object, path]",
			);
		});

		it("throws with object operand", () => {
			expect(() => {
				evaluate({ $get: { object: {}, path: "name" } });
			}).toThrowError(
				"$get evaluate form requires array operand: [object, path]",
			);
		});
	});
});

describe("$compose", () => {
	it("composes expressions right-to-left (mathematical order)", () => {
		expect(apply({ $compose: [{ $get: "name" }] }, { name: "Zarina" })).toEqual(
			"Zarina",
		);
	});

	it("composes multiple expressions in mathematical order", () => {
		// $compose: [f, g, h] means f(g(h(x))) - mathematical composition
		const result = apply(
			{
				$compose: [
					{ $add: 0 }, // f: identity (add 0)
					{ $multiply: 2 }, // g: multiply by 2  
					{ $get: "value" }, // h: get value
				],
			},
			{ value: 5 },
		);
		expect(result).toEqual(10); // 5 * 2 + 0 = 10
	});

	it("throws with a non-expression", () => {
		expect(() => {
			apply([{ $compose: ["lol"] }, { name: "Zarina" }]);
		}).toThrowError();
	});

	it("throws with an invalid expression", () => {
		expect(() => {
			apply({ $compose: [{ $in: "should be an array" }] }, { name: "Zarina" });
		}).toThrowError();
	});

	describe("evaluate form", () => {
		it("evaluates expressions right-to-left (mathematical order)", () => {
			expect(
				evaluate({ $compose: [[{ $get: "name" }], { name: "Zarina" }] }),
			).toEqual("Zarina");
		});

		it("composes multiple expressions in mathematical order", () => {
			const result = evaluate({
				$compose: [
					[
						{ $add: 1 },
						{ $multiply: 2 },
						{ $literal: 5 },
					],
					null,
				],
			});
			expect(result).toEqual(11); // ((5 * 2) + 1) = 11
		});

		it("works with nested data extraction", () => {
			const result = evaluate({
				$compose: [
					[
						{ $get: "length" },
						{ $get: "name" },
					],
					{ name: "Amara" },
				],
			});
			expect(result).toEqual(5); // "Amara".length = 5
		});
	});
});

describe("$pipe", () => {
	it("pipes expressions left-to-right (pipeline order)", () => {
		expect(apply({ $pipe: [{ $get: "name" }] }, { name: "Zarina" })).toEqual(
			"Zarina",
		);
	});

	it("pipes multiple expressions in pipeline order", () => {
		// $pipe: [h, g, f] means f(g(h(x))) - pipeline order
		const result = apply(
			{
				$pipe: [
					{ $get: "value" }, // h: get value
					{ $multiply: 2 }, // g: multiply by 2
					{ $add: 0 }, // f: identity (add 0)
				],
			},
			{ value: 5 },
		);
		expect(result).toEqual(10); // 5 * 2 + 0 = 10
	});

	it("demonstrates the difference between $compose and $pipe", () => {
		const data = { child: { name: "Fatoumata" } };

		// $compose: [f, g, h] means f(g(h(x)))
		const composeResult = apply(
			{
				$compose: [
					{ $get: "name" }, // f
					{ $get: "child" }, // g
				],
			},
			data,
		);

		// $pipe: [h, g, f] means f(g(h(x)))
		const pipeResult = apply(
			{
				$pipe: [
					{ $get: "child" }, // h
					{ $get: "name" }, // g
				],
			},
			data,
		);

		expect(composeResult).toEqual("Fatoumata");
		expect(pipeResult).toEqual("Fatoumata");
	});

	it("throws with a non-expression", () => {
		expect(() => {
			evaluate([{ $pipe: "lol" }, { name: "Zarina" }]);
		}).toThrowError();
	});

	it("throws with an invalid expression", () => {
		expect(() => {
			apply({ $pipe: [{ $in: "should be an array" }] }, { name: "Zarina" });
		}).toThrowError();
	});
});

describe("$literal", () => {
	it("doesn't apply to expression operands", () => {
		const expr = { $random: "" };
		expect(apply({ $literal: expr })).toEqual(expr);
	});

	it("doesn't evaluate expression operands", () => {
		const expr = { $random: "" };
		expect(evaluate({ $literal: expr })).toEqual(expr);
	});
});

