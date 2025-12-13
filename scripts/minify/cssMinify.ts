import CleanCSS from "clean-css";

// A simple custom plugin to find and minify CSS in template strings
export const cssMinify = () => {
	const cleanCss = new CleanCSS();
	return {
		name: "minify-css-template-strings",
		transform(code) {
			// Updated Regex: Captures the property and the raw content separately
			const cssRegex = /\b(css)(`[\s\S]*?`)/g;
			if (!cssRegex.test(code)) return null;

			const transformedCode = code.replace(
				cssRegex,
				(match, tag, templateString) => {
					// SAFETY CHECK: Abort if the string contains JS interpolation (${...})
					// Minifying partial CSS fragments mixed with JS is unsafe via Regex.
					if (templateString.includes("${")) {
						return match;
					}

					// 1. Slice off backticks
					const rawCss = templateString.slice(1, -1);

					// 2. Minify
					const output = cleanCss.minify(rawCss);

					// Handle minification errors/warnings if necessary
					if (output.errors.length || !output.styles) return match;

					// 3. Rebuild preserving the tag.
					return `\`${output.styles}\``;
				}
			);

			return {
				code: transformedCode,
				map: null
			};
		}
	};
};
