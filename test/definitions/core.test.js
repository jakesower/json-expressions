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

		it("gets value with default when path exists", () => {
			expect(
				evaluate({ $get: [{ name: "Amara", age: 30 }, "name", "defaultName"] }),
			).toEqual("Amara");
		});

		it("returns default when path does not exist", () => {
			expect(
				evaluate({ $get: [{ age: 30 }, "name", "defaultName"] }),
			).toEqual("defaultName");
		});

		it("returns default when nested path does not exist", () => {
			expect(
				evaluate({ $get: [{ user: {} }, "user.name", "Anonymous"] }),
			).toEqual("Anonymous");
		});

		it("works with complex default values", () => {
			expect(
				evaluate({ $get: [{ age: 30 }, "user", { name: "Guest", role: "visitor" }] }),
			).toEqual({ name: "Guest", role: "visitor" });
		});

		it("throws with non-array operand", () => {
			expect(() => {
				evaluate({ $get: "name" });
			}).toThrowError(
				"$get evaluate form requires array operand: [object, path] or [object, path, default]",
			);
		});

		it("throws with object operand", () => {
			expect(() => {
				evaluate({ $get: { object: {}, path: "name" } });
			}).toThrowError(
				"$get evaluate form requires array operand: [object, path] or [object, path, default]",
			);
		});

		it("throws with invalid array length", () => {
			expect(() => {
				evaluate({ $get: [{}] });
			}).toThrowError(
				"$get evaluate form requires array operand: [object, path] or [object, path, default]",
			);
		});
	});

	describe("apply form", () => {
		it("gets value using string path", () => {
			expect(apply({ $get: "name" }, { name: "Fatima", age: 25 })).toEqual("Fatima");
		});

		it("gets nested value using string path", () => {
			expect(apply({ $get: "user.name" }, { user: { name: "Chen" } })).toEqual("Chen");
		});

		it("gets value with default when path exists", () => {
			expect(apply({ $get: ["name", "defaultName"] }, { name: "Kenji", age: 25 })).toEqual("Kenji");
		});

		it("returns default when path does not exist", () => {
			expect(apply({ $get: ["name", "defaultName"] }, { age: 25 })).toEqual("defaultName");
		});

		it("returns default when nested path does not exist", () => {
			expect(apply({ $get: ["user.name", "Anonymous"] }, { user: {} })).toEqual("Anonymous");
		});

		it("works with expression as default", () => {
			expect(
				apply(
					{ $get: ["name", { $get: "fallbackName" }] }, 
					{ age: 25, fallbackName: "Guest" },
				),
			).toEqual("Guest");
		});

		it("works with complex default values", () => {
			expect(
				apply({ $get: ["user", { name: "Guest", role: "visitor" }] }, { age: 25 }),
			).toEqual({ name: "Guest", role: "visitor" });
		});

		it("handles undefined vs null correctly", () => {
			expect(apply({ $get: ["name", "default"] }, { name: null })).toEqual(null);
			expect(apply({ $get: ["name", "default"] }, {})).toEqual("default");
		});

		it("throws with invalid operand type", () => {
			expect(() => {
				apply({ $get: 123 }, {});
			}).toThrowError("$get operand must be string or array");
		});
	});
});

describe("$prop", () => {
	describe("apply form", () => {
		it("gets simple property", () => {
			expect(apply({ $prop: "name" }, { name: "Kenji", age: 25 })).toEqual("Kenji");
		});

		it("gets property using expression", () => {
			expect(apply({ $prop: { $literal: "age" } }, { name: "Yuki", age: 30 })).toEqual(30);
		});

		it("returns undefined for missing property", () => {
			expect(apply({ $prop: "missing" }, { name: "Sato" })).toBeUndefined();
		});

		it("throws when accessing property on null", () => {
			expect(() => {
				apply({ $prop: "name" }, null);
			}).toThrowError("Cannot read properties of null");
		});

		it("throws when accessing property on undefined", () => {
			expect(() => {
				apply({ $prop: "name" }, undefined);
			}).toThrowError("Cannot read properties of undefined");
		});

		it("works with numeric properties", () => {
			expect(apply({ $prop: 0 }, ["first", "second"])).toEqual("first");
			expect(apply({ $prop: "length" }, ["a", "b", "c"])).toEqual(3);
		});

		it("works with symbol properties", () => {
			const sym = Symbol("test");
			const obj = { [sym]: "symbol value" };
			expect(apply({ $prop: { $literal: sym } }, obj)).toEqual("symbol value");
		});
	});

	describe("evaluate form", () => {
		it("gets property from object", () => {
			expect(evaluate({ $prop: [{ name: "Chen", age: 28 }, "name"] })).toEqual("Chen");
		});

		it("gets numeric property", () => {
			expect(evaluate({ $prop: [["zero", "one", "two"], 1] })).toEqual("one");
		});

		it("returns undefined for missing property", () => {
			expect(evaluate({ $prop: [{ age: 25 }, "name"] })).toBeUndefined();
		});

		it("throws when object is null", () => {
			expect(() => {
				evaluate({ $prop: [null, "name"] });
			}).toThrowError("Cannot read properties of null");
		});

		it("throws when object is undefined", () => {
			expect(() => {
				evaluate({ $prop: [undefined, "name"] });
			}).toThrowError("Cannot read properties of undefined");
		});

		it("throws with non-array operand", () => {
			expect(() => {
				evaluate({ $prop: "name" });
			}).toThrowError(
				"$prop evaluate form requires array operand: [object, property]",
			);
		});

		it("handles single element array gracefully", () => {
			expect(evaluate({ $prop: [{ someKey: "value" }] })).toBeUndefined();
		});

		it("works with computed property names", () => {
			expect(
				evaluate({ $prop: [{ a: "value-a", b: "value-b" }, { $literal: "a" }] }),
			).toEqual("value-a");
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

