import { createExpressionEngine, comparisonPack } from "../src/index.js";

const engine = createExpressionEngine({ packs: [comparisonPack] });

function benchmark(fn, iterations = 1000000) {
	const start = process.hrtime.bigint();
	for (let i = 0; i < iterations; i++) {
		fn();
	}
	const end = process.hrtime.bigint();
	const durationMs = Number(end - start) / 1000000;
	return Math.round(iterations / (durationMs / 1000));
}

const nativeOps = benchmark(() => 25 > 18);
const jsonExprOps = benchmark(() => engine.apply({ $gt: 18 }, 25));

console.log(`Native:    ${nativeOps.toLocaleString()} ops/sec`);
console.log(`JSON Expr: ${jsonExprOps.toLocaleString()} ops/sec`);
console.log(`Slowdown:  ${(nativeOps / jsonExprOps).toFixed(1)}x`);
