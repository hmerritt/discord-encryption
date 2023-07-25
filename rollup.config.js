// @ts-nocheck
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

// https://rollupjs.org/introduction/
export default {
	input: 'src/index.ts',
	output: {
		file: 'encryption.plugin.js',
		format: 'cjs', // cjs | iife | umd
		sourcemap: false
	},
	plugins: [
		typescript(),
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
	],
	define: {
		"process.env": {},
	},
};
