import { defineConfig } from "rolldown";

import { cssMinify, htmlMinify } from "./scripts/minify";
import { configStore } from "./src/state/slices/config/configStore";

// https://rollupjs.org/introduction/
export default defineConfig({
	input: "src/index.ts",
	tsconfig: "tsconfig.json",
	external: ["electron", "request"],
	plugins: [cssMinify(), htmlMinify()],
	resolve: {
		extensions: [".ts", ".js", ".tsx", ".jsx"]
	},
	output: {
		file: configStore.outputFile,
		format: "cjs",
		sourcemap: false,
		minify: true
	},
	watch: {
		include: "src/**"
	}
});
