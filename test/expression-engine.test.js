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
