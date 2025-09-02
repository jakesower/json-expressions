import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
	// ESM build
	{
		input: "src/index.js",
		output: { file: "dist/index.esm.js", format: "es" },
		plugins: [nodeResolve()],
		external: [
			"es-toolkit",
			"didyoumean", 
			"glob",
		],
	},
	// CommonJS build
	{
		input: "src/index.js",
		output: { file: "dist/index.cjs", format: "cjs" },
		plugins: [nodeResolve()],
		external: [
			"es-toolkit",
			"didyoumean",
			"glob",
		],
	},
];