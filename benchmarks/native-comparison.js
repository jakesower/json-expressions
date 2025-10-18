import {
	createExpressionEngine,
	mathPack,
	comparisonPack,
	arrayPack,
	objectPack,
	filteringPack,
} from "../src/index.js";

// Test data sets
const simpleData = { age: 25, score: 85, name: "Amin" };
const complexData = {
	users: [
		{ name: "Elena", age: 28, active: true, score: 92 },
		{ name: "Kai", age: 34, active: false, score: 78 },
		{ name: "Priya", age: 22, active: true, score: 95 },
		{ name: "Omar", age: 41, active: true, score: 83 },
	],
	config: { threshold: 80, multiplier: 1.2 },
};

const largeArray = Array.from({ length: 1000 }, (_, i) => ({
	id: i,
	value: Math.random() * 100,
	category: ["A", "B", "C"][i % 3],
}));

// Create engine with common packs
const engine = createExpressionEngine({
	packs: [mathPack, comparisonPack, arrayPack, objectPack, filteringPack],
});

// Benchmark function
function benchmark(name, fn, iterations = 10000) {
	const start = process.hrtime.bigint();

	for (let i = 0; i < iterations; i++) {
		fn();
	}

	const end = process.hrtime.bigint();
	const durationMs = Number(end - start) / 1000000;
	const opsPerSec = Math.round(iterations / (durationMs / 1000));

	return { name, durationMs, opsPerSec };
}

console.log("JSON Expressions vs Native JavaScript Performance");
console.log("=================================================\n");

// 1. Simple comparison
console.log("1. Simple Comparison (x > 18)");
console.log("   " + "─".repeat(50));
const nativeComparison = benchmark("Native", () => {
	simpleData.age > 18;
});
const exprComparison = benchmark("JSON Expr", () => {
	engine.apply({ $gt: 18 }, simpleData.age);
});
console.log(
	`   Native:     ${nativeComparison.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprComparison.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeComparison.opsPerSec / exprComparison.opsPerSec).toFixed(1)}x\n`,
);

// 2. Property access
console.log("2. Property Access (obj.name)");
console.log("   " + "─".repeat(50));
const nativeProp = benchmark("Native", () => {
	simpleData.name;
});
const exprProp = benchmark("JSON Expr", () => {
	engine.apply({ $get: "name" }, simpleData);
});
console.log(`   Native:     ${nativeProp.opsPerSec.toLocaleString()} ops/sec`);
console.log(`   JSON Expr:  ${exprProp.opsPerSec.toLocaleString()} ops/sec`);
console.log(
	`   Slowdown:   ${(nativeProp.opsPerSec / exprProp.opsPerSec).toFixed(1)}x\n`,
);

// 3. Math operation
console.log("3. Math Operation (10 + 20)");
console.log("   " + "─".repeat(50));
const nativeMath = benchmark("Native", () => {
	10 + 20;
});
const exprMath = benchmark("JSON Expr", () => {
	engine.apply({ $add: [10, 20] }, {});
});
console.log(`   Native:     ${nativeMath.opsPerSec.toLocaleString()} ops/sec`);
console.log(`   JSON Expr:  ${exprMath.opsPerSec.toLocaleString()} ops/sec`);
console.log(
	`   Slowdown:   ${(nativeMath.opsPerSec / exprMath.opsPerSec).toFixed(1)}x\n`,
);

// 4. Array filter
console.log("4. Array Filter (filter by active)");
console.log("   " + "─".repeat(50));
const nativeFilter = benchmark(
	"Native",
	() => {
		complexData.users.filter((u) => u.active);
	},
	2000,
);
const exprFilter = benchmark(
	"JSON Expr",
	() => {
		engine.apply({ $filter: { $get: "active" } }, complexData.users);
	},
	2000,
);
console.log(
	`   Native:     ${nativeFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeFilter.opsPerSec / exprFilter.opsPerSec).toFixed(1)}x\n`,
);

// 5. Array map + reduce
console.log("5. Array Map + Sum");
console.log("   " + "─".repeat(50));
const nativeMapSum = benchmark(
	"Native",
	() => {
		complexData.users.map((u) => u.score).reduce((a, b) => a + b, 0);
	},
	1000,
);
const exprMapSum = benchmark(
	"JSON Expr",
	() => {
		engine.apply(
			{
				$pipe: [
					{ $get: "users" },
					{ $map: { $get: "score" } },
					{ $sum: { $identity: null } },
				],
			},
			complexData,
		);
	},
	1000,
);
console.log(
	`   Native:     ${nativeMapSum.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprMapSum.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeMapSum.opsPerSec / exprMapSum.opsPerSec).toFixed(1)}x\n`,
);

// 6. Complex filtering
console.log("6. Complex Filter (active && score > 80)");
console.log("   " + "─".repeat(50));
const nativeComplexFilter = benchmark(
	"Native",
	() => {
		complexData.users.filter((u) => u.active && u.score > 80);
	},
	1000,
);
const exprComplexFilter = benchmark(
	"JSON Expr",
	() => {
		engine.apply(
			{
				$pipe: [
					{ $get: "users" },
					{
						$filter: {
							$and: [{ $get: "active" }, { $gt: [{ $get: "score" }, 80] }],
						},
					},
				],
			},
			complexData,
		);
	},
	1000,
);
console.log(
	`   Native:     ${nativeComplexFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprComplexFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeComplexFilter.opsPerSec / exprComplexFilter.opsPerSec).toFixed(1)}x\n`,
);

// 7. Large array filter
console.log("7. Large Array Filter (1000 items, value > 50)");
console.log("   " + "─".repeat(50));
const nativeLargeFilter = benchmark(
	"Native",
	() => {
		largeArray.filter((item) => item.value > 50);
	},
	100,
);
const exprLargeFilter = benchmark(
	"JSON Expr",
	() => {
		engine.apply({ $filter: { $gt: [{ $get: "value" }, 50] } }, largeArray);
	},
	100,
);
console.log(
	`   Native:     ${nativeLargeFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprLargeFilter.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeLargeFilter.opsPerSec / exprLargeFilter.opsPerSec).toFixed(1)}x\n`,
);

// 8. Large array groupBy
console.log("8. Large Array GroupBy (1000 items by category)");
console.log("   " + "─".repeat(50));
const nativeLargeGroupBy = benchmark(
	"Native",
	() => {
		const groups = {};
		for (const item of largeArray) {
			const key = item.category;
			if (!groups[key]) groups[key] = [];
			groups[key].push(item);
		}
		return groups;
	},
	50,
);
const exprLargeGroupBy = benchmark(
	"JSON Expr",
	() => {
		engine.apply({ $groupBy: { $get: "category" } }, largeArray);
	},
	50,
);
console.log(
	`   Native:     ${nativeLargeGroupBy.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   JSON Expr:  ${exprLargeGroupBy.opsPerSec.toLocaleString()} ops/sec`,
);
console.log(
	`   Slowdown:   ${(nativeLargeGroupBy.opsPerSec / exprLargeGroupBy.opsPerSec).toFixed(1)}x\n`,
);

// Summary
console.log("Summary");
console.log("=======");
console.log(
	`Average slowdown across all operations: ${(
		((nativeComparison.opsPerSec / exprComparison.opsPerSec +
			nativeProp.opsPerSec / exprProp.opsPerSec +
			nativeMath.opsPerSec / exprMath.opsPerSec +
			nativeFilter.opsPerSec / exprFilter.opsPerSec +
			nativeMapSum.opsPerSec / exprMapSum.opsPerSec +
			nativeComplexFilter.opsPerSec / exprComplexFilter.opsPerSec +
			nativeLargeFilter.opsPerSec / exprLargeFilter.opsPerSec +
			nativeLargeGroupBy.opsPerSec / exprLargeGroupBy.opsPerSec) /
		8)
	).toFixed(1)}x`,
);
