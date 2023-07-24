// @ts-nocheck
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// https://rollupjs.org/introduction/
export default {
	input: 'src/index.js',
	output: {
		file: 'encryption.plugin.js',
		format: 'cjs', // cjs | iife | umd
		sourcemap: false
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
	],
	define: {
		"process.env": {},
	},
};
