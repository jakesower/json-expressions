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

		expect(() =>
			engine.apply({ $pipe: [{ $throws: null }] }, {}),
		).toThrowError("[$pipe[0].$throws] nested error");
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
