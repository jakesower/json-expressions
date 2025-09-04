import { describe, expect, it } from "vitest";
import { defaultExpressionEngine } from "../../src/index.js";

const kids = [
	{ name: "Ximena", age: 4 },
	{ name: "Yousef", age: 5 },
	{ name: "Zoë", age: 6 },
];

const { apply, evaluate } = defaultExpressionEngine;

describe("$map", () => {
	describe("apply form", () => {
		it("should perform without subexpressions", () => {
			expect(apply({ $map: { $literal: 3 } }, [1])).toEqual([3]);
		});

		it("should perform with a subexpression", () => {
			expect(apply({ $map: { $get: "age" } }, kids)).toEqual([4, 5, 6]);
		});
	});

	describe("evaluate form", () => {
		it("maps over static arrays", () => {
			expect(evaluate({ $map: [{ $get: "age" }, kids] })).toEqual([4, 5, 6]);
		});
	});
});

describe("$filter", () => {
	describe("apply form", () => {
		it("filters arrays", () => {
			expect(apply({ $filter: { $eq: 2 } }, [1, 2, 3])).toEqual([2]);
		});
	});

	describe("evaluate form", () => {
		it("filters static arrays", () => {
			expect(evaluate({ $filter: [{ $eq: 2 }, [1, 2, 3]] })).toEqual([2]);
		});
	});
});

describe("$flatMap", () => {
	describe("evaluate form", () => {
		it("flattens mapped arrays", () => {
			expect(evaluate({ $flatMap: [{ $literal: [1, 2] }, [[1], [2]]] })).toEqual([
				1, 2, 1, 2,
			]);
		});

		it("works with property extraction", () => {
			const students = [
				{ name: "Kehinde", subjects: ["math", "science"] },
				{ name: "Priya", subjects: ["history", "art"] },
				{ name: "Zhang", subjects: ["literature"] },
			];
			expect(evaluate({ $flatMap: [{ $get: "subjects" }, students] })).toEqual([
				"math", "science", "history", "art", "literature",
			]);
		});

		it("handles empty arrays", () => {
			expect(evaluate({ $flatMap: [{ $literal: [] }, [1, 2, 3]] })).toEqual([]);
		});

		it("flattens nested data structures", () => {
			const groups = [
				{ members: ["Kwame", "Fatima"] },
				{ members: ["Yuki", "Elena"] },
			];
			expect(evaluate({ $flatMap: [{ $get: "members" }, groups] })).toEqual([
				"Kwame", "Fatima", "Yuki", "Elena",
			]);
		});
	});
});

describe("$any", () => {
	describe("apply form", () => {
		it("returns true if any element matches", () => {
			expect(apply({ $any: { $gt: 5 } }, [4, 5, 6])).toBe(true);
			expect(apply({ $any: { $gt: 10 } }, [4, 5, 6])).toBe(false);
		});
	});

	describe("evaluate form", () => {
		it("evaluates with static arrays", () => {
			expect(evaluate({ $any: [{ $gt: 5 }, [4, 5, 6]] })).toBe(true);
			expect(evaluate({ $any: [{ $gt: 10 }, [4, 5, 6]] })).toBe(false);
			expect(evaluate({ $any: [{ $eq: "Zoë" }, kids.map(k => k.name)] })).toBe(true);
		});
	});
});

describe("$all", () => {
	describe("apply form", () => {
		it("returns true if all elements match", () => {
			expect(apply({ $all: { $gt: 3 } }, [4, 5, 6])).toBe(true);
			expect(apply({ $all: { $gt: 5 } }, [4, 5, 6])).toBe(false);
		});
	});

	describe("evaluate form", () => {
		it("evaluates with static arrays", () => {
			expect(evaluate({ $all: [{ $gt: 3 }, [4, 5, 6]] })).toBe(true);
			expect(evaluate({ $all: [{ $gt: 5 }, [4, 5, 6]] })).toBe(false);
			expect(evaluate({ $all: [{ $gt: 0 }, kids.map(k => k.age)] })).toBe(true);
		});
	});
});

describe("$find", () => {
	describe("apply form", () => {
		it("finds matching element", () => {
			expect(apply({ $find: { $eq: 5 } }, [4, 5, 6])).toBe(5);
			expect(apply({ $find: { $gt: 10 } }, [4, 5, 6])).toBe(undefined);
		});
	});

	describe("evaluate form", () => {
		it("finds elements in static arrays", () => {
			expect(evaluate({ $find: [{ $eq: 5 }, [4, 5, 6]] })).toBe(5);
			expect(evaluate({ $find: [{ $gt: 10 }, [4, 5, 6]] })).toBe(undefined);
			expect(evaluate({ $find: [{ $eq: "Zoë" }, kids.map(k => k.name)] })).toBe("Zoë");
		});
	});
});

describe("$append", () => {
	describe("apply form", () => {
		it("appends elements to arrays", () => {
			expect(apply({ $append: [4, 5] }, [1, 2, 3])).toEqual([1, 2, 3, 4, 5]);
			expect(apply({ $append: [] }, [1, 2, 3])).toEqual([1, 2, 3]);
			expect(apply({ $append: ["d", "e"] }, ["a", "b", "c"])).toEqual(["a", "b", "c", "d", "e"]);
		});
	});

	describe("evaluate form", () => {
		it("appends with static arrays", () => {
			expect(evaluate({ $append: [[4, 5], [1, 2, 3]] })).toEqual([1, 2, 3, 4, 5]);
			expect(evaluate({ $append: [[], [1, 2]] })).toEqual([1, 2]);
			expect(evaluate({ $append: [["d", "e"], ["a", "b", "c"]] })).toEqual(["a", "b", "c", "d", "e"]);
		});
	});
});

describe("$prepend", () => {
	describe("apply form", () => {
		it("prepends elements to arrays", () => {
			expect(apply({ $prepend: [4, 5] }, [1, 2, 3])).toEqual([4, 5, 1, 2, 3]);
			expect(apply({ $prepend: [] }, [1, 2, 3])).toEqual([1, 2, 3]);
			expect(apply({ $prepend: ["a", "b"] }, ["c", "d", "e"])).toEqual(["a", "b", "c", "d", "e"]);
		});
	});

	describe("evaluate form", () => {
		it("prepends with static arrays", () => {
			expect(evaluate({ $prepend: [[4, 5], [1, 2, 3]] })).toEqual([4, 5, 1, 2, 3]);
			expect(evaluate({ $prepend: [[], [1, 2]] })).toEqual([1, 2]);
			expect(evaluate({ $prepend: [["a", "b"], ["c", "d", "e"]] })).toEqual(["a", "b", "c", "d", "e"]);
		});
	});
});

describe("$join", () => {
	describe("apply form", () => {
		it("joins array elements", () => {
			expect(apply({ $join: ", " }, [1, 2, 3])).toBe("1, 2, 3");
			expect(apply({ $join: "" }, ["a", "b", "c"])).toBe("abc");
		});
	});

	describe("evaluate form", () => {
		it("joins with static arrays", () => {
			expect(evaluate({ $join: [", ", [1, 2, 3]] })).toBe("1, 2, 3");
			expect(evaluate({ $join: ["-", ["a", "b", "c"]] })).toBe("a-b-c");
			expect(evaluate({ $join: ["", [1, 2, 3]] })).toBe("123");
		});
	});
});

describe("$reverse", () => {
	describe("apply form", () => {
		it("reverses arrays", () => {
			expect(apply({ $reverse: {} }, [1, 2, 3])).toEqual([3, 2, 1]);
		});
	});

	describe("evaluate form", () => {
		it("reverses static arrays", () => {
			expect(evaluate({ $reverse: [1, 2, 3] })).toEqual([3, 2, 1]);
			expect(evaluate({ $reverse: ["a", "b", "c"] })).toEqual(["c", "b", "a"]);
			expect(evaluate({ $reverse: [] })).toEqual([]);
		});
	});
});