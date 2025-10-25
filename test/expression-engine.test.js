import { describe, expect, it } from "vitest";
import { createExpressionEngine } from "../src/index.js";
import { allExpressionsForTesting } from "../src/packs/all.js";
import { base } from "../src/packs/base.js";

const engine = createExpressionEngine({
	packs: [allExpressionsForTesting],
});
const { apply } = engine;

describe("Expression Engine", () => {
	it("gives a top path error path", () => {
		expect(() => apply({ $any: "howdy" })).toThrowError("[$any]");
	});

	it("gives a nested path error path", () => {
		expect(() => apply({ $pipe: [{ $any: "howdy" }] })).toThrowError(
			"[$pipe[0].$any]",
		);
	});
});

describe("validateExpression", () => {
	const { validateExpression } = engine;

	it("returns empty array for valid simple expressions", () => {
		expect(validateExpression({ $get: "name" })).toEqual([]);
		expect(validateExpression({ $identity: null })).toEqual([]);
		expect(validateExpression({ $literal: { room: "rose" } })).toEqual([]);
	});

	it("returns empty array for valid nested expressions", () => {
		expect(validateExpression({ $get: { $get: "room" } })).toEqual([]);
		expect(
			validateExpression({
				$pipe: [{ $get: "name" }, { $uppercase: null }],
			}),
		).toEqual([]);
		expect(
			validateExpression({
				$if: { if: { $gt: 5 }, then: "toddler", else: "infant" },
			}),
		).toEqual([]);
	});

	it("returns empty array for non-expression literals", () => {
		expect(validateExpression("Chen")).toEqual([]);
		expect(validateExpression(4)).toEqual([]);
		expect(validateExpression(null)).toEqual([]);
		expect(validateExpression({ name: "Luna", age: 3 })).toEqual([]);
		expect(validateExpression(["blocks", "dolls", "cars"])).toEqual([]);
	});

	it("returns error for invalid expression operator at top level", () => {
		const errors = validateExpression({ $napTime: "invalid" });
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('Unknown expression operator: "$napTime"');
	});

	it("returns error for invalid nested expression operator", () => {
		const errors = validateExpression({ $get: { $oops: "invalid!" } });
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('Unknown expression operator: "$oops"');
	});

	it("returns all errors for multiple invalid operators", () => {
		const errors = validateExpression({
			$pipe: [{ $bad1: "oops" }, { $bad2: "another" }],
		});
		expect(errors).toHaveLength(2);
		expect(errors[0]).toContain('Unknown expression operator: "$bad1"');
		expect(errors[1]).toContain('Unknown expression operator: "$bad2"');
	});

	it("returns errors for invalid operators in object values", () => {
		const errors = validateExpression({
			$select: { childName: { $get: "name" }, bad: { $invalid: "x" } },
		});
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('Unknown expression operator: "$invalid"');
	});

	it("validates complex nested structures for daycare queries", () => {
		const validExpression = {
			$pipe: [
				{ $get: "children" },
				{
					$map: {
						$select: {
							name: { $get: "name" },
							isToddler: { $gte: [{ $get: "age" }, 3] },
						},
					},
				},
				{ $filter: { $get: "isToddler" } },
			],
		};
		expect(validateExpression(validExpression)).toEqual([]);
	});

	it("finds multiple errors in complex daycare enrollment queries", () => {
		const invalidExpression = {
			$pipe: [
				{ $wrongOp1: "first error" },
				{ $get: "children" },
				{
					$map: {
						$select: {
							name: { $get: "name" },
							status: { $eq: [{ $get: "enrolled" }, true] },
							invalid: { $wrongOp2: "second error" },
						},
					},
				},
			],
		};
		const errors = validateExpression(invalidExpression);
		expect(errors).toHaveLength(2);
		expect(errors[0]).toContain('Unknown expression operator: "$wrongOp1"');
		expect(errors[1]).toContain('Unknown expression operator: "$wrongOp2"');
	});

	it("validates $literal with non-expression content", () => {
		const validExpression = {
			$literal: { $notAnExpression: "but it's OK" },
		};

		expect(validateExpression(validExpression)).toEqual([]);
	});
});

describe("ensureValidExpression", () => {
	const { ensureValidExpression } = engine;

	it("returns true for valid expressions", () => {
		expect(ensureValidExpression({ $get: "name" })).toBe(true);
		expect(
			ensureValidExpression({
				$pipe: [{ $get: "children" }, { $count: null }],
			}),
		).toBe(true);
	});

	it("throws with single error message for one invalid operator", () => {
		expect(() => ensureValidExpression({ $napTime: "invalid" })).toThrow(
			'Unknown expression operator: "$napTime"',
		);
	});

	it("throws with all errors joined by newline for multiple invalid operators", () => {
		expect(() =>
			ensureValidExpression({
				$pipe: [{ $bad1: "oops" }, { $bad2: "another" }],
			}),
		).toThrow(/\$bad1[\s\S]*\$bad2/);
	});
});

describe("exclude configuration", () => {
	it("excludes specified expressions from base pack", () => {
		const engine = createExpressionEngine({
			exclude: ["$map", "$filter"],
		});

		// $get should still work (not excluded)
		expect(engine.apply({ $get: "name" }, { name: "test" })).toBe("test");

		// $map should not be available
		expect(() => engine.apply({ $map: { $get: "x" } }, [{ x: 1 }])).toThrow(
			'Unknown expression operator: "$map"',
		);

		// $filter should not be available
		expect(() => engine.apply({ $filter: { $gt: 5 } }, [1, 6, 3])).toThrow(
			'Unknown expression operator: "$filter"',
		);
	});

	it("excludes expressions from multiple packs", () => {
		const engine = createExpressionEngine({
			packs: [allExpressionsForTesting],
			exclude: ["$sum", "$mean", "$count"],
		});

		expect(engine.apply({ $get: "value" }, { value: 42 })).toBe(42);

		expect(() => engine.apply({ $sum: null }, [1, 2, 3])).toThrow(
			'Unknown expression operator: "$sum"',
		);

		expect(() => engine.apply({ $mean: null }, [1, 2, 3])).toThrow(
			'Unknown expression operator: "$mean"',
		);
	});

	it("excludes custom expressions", () => {
		const engine = createExpressionEngine({
			custom: {
				$custom: () => "custom",
			},
			exclude: ["$custom"],
		});

		expect(() => engine.apply({ $custom: null }, {})).toThrow(
			'Unknown expression operator: "$custom"',
		);
	});

	it("silently ignores non-existent expressions in exclude list", () => {
		const engine = createExpressionEngine({
			exclude: ["$nonExistent", "$alsoNotThere"],
		});

		expect(engine.apply({ $get: "name" }, { name: "test" })).toBe("test");
	});

	it("cannot exclude $literal", () => {
		const engine = createExpressionEngine({
			exclude: ["$literal"],
		});

		// $literal should still be available
		expect(engine.apply({ $literal: { $get: "test" } }, {})).toEqual({
			$get: "test",
		});
		expect(engine.expressionNames).toContain("$literal");
	});

	it("excludes expressions before they appear in expressionNames", () => {
		const engine = createExpressionEngine({
			exclude: ["$map", "$filter"],
		});

		expect(engine.expressionNames).not.toContain("$map");
		expect(engine.expressionNames).not.toContain("$filter");
		expect(engine.expressionNames).toContain("$get");
		expect(engine.expressionNames).toContain("$literal");
	});

	it("works with includeBase: false and exclude", () => {
		const engine = createExpressionEngine({
			includeBase: false,
			packs: [base],
			exclude: ["$map"],
		});

		expect(engine.apply({ $get: "name" }, { name: "test" })).toBe("test");
		expect(() => engine.apply({ $map: { $get: "x" } }, [{ x: 1 }])).toThrow(
			'Unknown expression operator: "$map"',
		);
	});

	it("applies exclusions after pack merging (last pack wins before exclusion)", () => {
		const customPack = {
			$get: () => "overridden",
		};

		const engine = createExpressionEngine({
			packs: [customPack],
			exclude: ["$get"],
		});

		// $get should be excluded entirely, even though it was overridden
		expect(() => engine.apply({ $get: "name" }, { name: "test" })).toThrow(
			'Unknown expression operator: "$get"',
		);
	});
});

describe("middleware", () => {
	it("works with no middleware", () => {
		const engine = createExpressionEngine();
		expect(engine.apply({ $get: "name" }, { name: "test" })).toBe("test");
	});

	it("allows middleware to observe expressions", () => {
		const calls = [];
		const observer = (operand, inputData, next, { expressionName, path }) => {
			calls.push({ expressionName, operand, inputData, path });
			return next(operand, inputData);
		};

		const engine = createExpressionEngine({ middleware: [observer] });
		const result = engine.apply({ $get: "name" }, { name: "Alice" });

		expect(result).toBe("Alice");
		expect(calls).toHaveLength(1);
		expect(calls[0]).toEqual({
			expressionName: "$get",
			operand: "name",
			inputData: { name: "Alice" },
			path: [],
		});
	});

	it("allows middleware to transform operand", () => {
		const rewritePath = (operand, inputData, next, { expressionName }) => {
			if (expressionName === "$get" && operand === "oldName") {
				// Rewrite old property name to new one
				return next("newName", inputData);
			}
			return next(operand, inputData);
		};

		const engine = createExpressionEngine({ middleware: [rewritePath] });
		const result = engine.apply(
			{ $get: "oldName" },
			{ newName: "test", oldName: "wrong" },
		);

		expect(result).toBe("test");
	});

	it("allows middleware to transform inputData", () => {
		const addTimestamp = (operand, inputData, next) => {
			return next(operand, { ...inputData, _timestamp: 12345 });
		};

		const engine = createExpressionEngine({ middleware: [addTimestamp] });
		const result = engine.apply({ $get: "_timestamp" }, { name: "test" });

		expect(result).toBe(12345);
	});

	it("composes multiple middleware in correct order", () => {
		const order = [];

		const first = (operand, inputData, next) => {
			order.push("first-before");
			const result = next(operand, inputData);
			order.push("first-after");
			return result;
		};

		const second = (operand, inputData, next) => {
			order.push("second-before");
			const result = next(operand, inputData);
			order.push("second-after");
			return result;
		};

		const engine = createExpressionEngine({ middleware: [first, second] });
		engine.apply({ $get: "name" }, { name: "test" });

		expect(order).toEqual([
			"first-before",
			"second-before",
			"second-after",
			"first-after",
		]);
	});

	it("allows middleware to short-circuit evaluation", () => {
		const shortCircuit = (operand, inputData, next, { expressionName }) => {
			if (expressionName === "$get" && operand === "blocked") {
				return "BLOCKED";
			}
			return next(operand, inputData);
		};

		const engine = createExpressionEngine({ middleware: [shortCircuit] });
		const result = engine.apply({ $get: "blocked" }, { blocked: "secret" });

		expect(result).toBe("BLOCKED");
	});

	it("allows middleware to catch and transform errors", () => {
		const errorHandler = (operand, inputData, next) => {
			try {
				return next(operand, inputData);
			} catch (err) {
				return `ERROR: ${err.message}`;
			}
		};

		const engine = createExpressionEngine({
			middleware: [errorHandler],
			custom: {
				$throws: () => {
					throw new Error("intentional error");
				},
			},
		});
		const result = engine.apply({ $throws: null }, {});

		expect(result).toBe("ERROR: intentional error");
	});

	it("preserves error paths when middleware doesn't catch", () => {
		const passthrough = (operand, inputData, next) => next(operand, inputData);

		const engine = createExpressionEngine({
			middleware: [passthrough],
			custom: {
				$throws: () => {
					throw new Error("nested error");
				},
			},
		});

		expect(() => engine.apply({ $pipe: [{ $throws: null }] }, {})).toThrowError(
			"[$pipe[0].$throws] nested error",
		);
	});

	it("allows middleware to add timing information", () => {
		let duration = 0;

		const timer = (operand, inputData, next) => {
			const start = performance.now();
			const result = next(operand, inputData);
			duration = performance.now() - start;
			return result;
		};

		const engine = createExpressionEngine({ middleware: [timer] });
		engine.apply({ $get: "name" }, { name: "test" });

		expect(duration).toBeGreaterThanOrEqual(0);
	});
});
