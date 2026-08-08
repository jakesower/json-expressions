import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

// Only build CommonJS - ESM uses source files directly for better tree-shaking
export default {
	input: "src/index.js",
	output: {
		file: "dist/index.cjs",
		format: "cjs",
		exports: "named"
	},
	plugins: [
		nodeResolve({ extensions: [".js", ".ts"] }),
		typescript({ noEmit: false, declaration: false }),
	],
	external: [
		"es-toolkit",
		"didyoumean",
		"date-fns",
	],
};