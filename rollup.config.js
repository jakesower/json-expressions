import { nodeResolve } from "@rollup/plugin-node-resolve";

// Only build CommonJS - ESM uses source files directly for better tree-shaking
export default {
	input: "src/index.js",
	output: {
		file: "dist/index.cjs",
		format: "cjs",
		exports: "named"
	},
	plugins: [nodeResolve()],
	external: [
		"es-toolkit",
		"didyoumean",
		"date-fns",
	],
};