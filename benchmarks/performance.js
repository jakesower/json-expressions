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

	console.log(
		`${name}: ${durationMs.toFixed(2)}ms (${opsPerSec.toLocaleString()} ops/sec)`,
	);
	return { durationMs, opsPerSec };
}

console.log("JSON Expressions Performance Benchmarks");
console.log("======================================\n");

// Simple operations
console.log("🔢 Simple Operations:");
benchmark("Simple comparison ($gt)", () => {
	engine.apply({ $gt: 18 }, simpleData.age);
});

benchmark("Property access ($get)", () => {
	engine.apply({ $get: "name" }, simpleData);
});

benchmark("Math operation ($add)", () => {
	engine.apply({ $add: [10, 20] }, {});
});

console.log("\n🔍 Complex Operations:");
benchmark(
	"Object matching ($matchesAll)",
	() => {
		engine.apply(
			{
				$matchesAll: {
					age: { $gte: 18 },
					score: { $gt: 80 },
				},
			},
			simpleData,
		);
	},
	5000,
);

benchmark("Nested data access", () => {
	engine.apply({ $get: "users.0.name" }, complexData);
});

benchmark(
	"Array filtering ($filter)",
	() => {
		engine.apply(
			{
				$filter: { $get: "active" },
			},
			complexData.users,
		);
	},
	2000,
);

console.log("\n📊 Data Processing:");
benchmark(
	"Array mapping + sum",
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

benchmark(
	"Complex filtering + transformation",
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
					{ $map: { $get: "name" } },
				],
			},
			complexData,
		);
	},
	1000,
);

console.log("\n⚡ Large Dataset Operations:");
benchmark(
	"Filter 1000 items",
	() => {
		engine.apply(
			{
				$filter: { $gt: [{ $get: "value" }, 50] },
			},
			largeArray,
		);
	},
	100,
);

benchmark(
	"Group 1000 items",
	() => {
		engine.apply(
			{
				$groupBy: { $get: "category" },
			},
			largeArray,
		);
	},
	50,
);

// Memory usage test
console.log("\n💾 Memory Usage:");
const memBefore = process.memoryUsage();

// Create many engines to test memory
const engines = Array.from({ length: 100 }, () =>
	createExpressionEngine({ packs: [mathPack, comparisonPack] }),
);

// Execute many operations
for (let i = 0; i < 1000; i++) {
	engines[i % 100].apply({ $gt: Math.random() * 100 }, Math.random() * 100);
}

const memAfter = process.memoryUsage();
const memDiff = memAfter.heapUsed - memBefore.heapUsed;

console.log(
	`Memory usage: ${(memDiff / 1024 / 1024).toFixed(2)} MB for 100 engines + 1000 operations`,
);

console.log("\nPerformance Targets:");
console.log("Simple operations: >10,000 ops/sec");
console.log("Complex operations: >1,000 ops/sec");
console.log("Large dataset ops: >50 ops/sec");
console.log("Memory efficient: <50MB per 100 engines");
