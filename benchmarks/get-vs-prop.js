import { createExpressionEngine } from "../src/index.js";

const engine = createExpressionEngine();
const simpleData = { age: 25, score: 85, name: "Amin" };

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

console.log("$get vs $prop Performance Comparison");
console.log("====================================\n");

console.log("Simple property access (obj.name):");
console.log("─".repeat(50));

const nativeBench = benchmark("Native", () => {
	simpleData.name;
});

const getBench = benchmark("$get", () => {
	engine.apply({ $get: "name" }, simpleData);
});

const propBench = benchmark("$prop", () => {
	engine.apply({ $prop: "name" }, simpleData);
});

console.log(`Native:  ${nativeBench.opsPerSec.toLocaleString()} ops/sec`);
console.log(`$get:    ${getBench.opsPerSec.toLocaleString()} ops/sec`);
console.log(`$prop:   ${propBench.opsPerSec.toLocaleString()} ops/sec\n`);

console.log("Performance ratios:");
console.log(
	`$prop vs native: ${(nativeBench.opsPerSec / propBench.opsPerSec).toFixed(1)}x slower`,
);
console.log(
	`$get vs native:  ${(nativeBench.opsPerSec / getBench.opsPerSec).toFixed(1)}x slower`,
);
console.log(
	`$prop vs $get:   ${(propBench.opsPerSec / getBench.opsPerSec).toFixed(1)}x faster`,
);
