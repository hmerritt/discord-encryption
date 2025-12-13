import { defineConfig } from "rolldown";

import { cssMinify, htmlMinify } from "./scripts/minify";
import { config } from "./src/lib/config";

// https://rollupjs.org/introduction/
export default defineConfig({
	input: "src/index.ts",
	tsconfig: "tsconfig.json",
	external: ["electron", "request"],
	// @TODO: Fix these plugins:
	// plugins: [cssMinify(), htmlMinify()],
	resolve: {
		extensions: [".ts", ".js", ".tsx", ".jsx"]
	},
	output: {
		file: config.outputFile,
		format: "cjs",
		sourcemap: false,
		minify: true
	},
	watch: {
		include: "src/**"
	}
});
