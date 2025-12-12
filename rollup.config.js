// @ts-nocheck
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

// https://rollupjs.org/introduction/
export default {
	input: "src/index.ts",
	output: {
		file: "encryption.plugin.js",
		format: "cjs", // cjs | es
		sourcemap: false
	},
	plugins: [typescript(), resolve(), commonjs()],
	define: {
		"process.env": {}
	}
};
