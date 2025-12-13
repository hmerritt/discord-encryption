import { minify } from "html-minifier-terser";

// A simple custom plugin to find and minify CSS in template strings
export const htmlMinify = () => {
	return {
		name: "minify-html-template-strings",
		async transform(code) {
			// This regex looks for 'html' followed by a backtick,
			// and captures the content within the backticks.
			const htmlRegex = /markup`([\s\S]*?)`/g;

			let newCode = code;
			const matches = Array.from(code.matchAll(htmlRegex));

			for (const match of matches) {
				// match[0] is the full match (e.g., html`...`)
				// match[1] is the raw HTML content inside the backticks
				const [fullMatch, rawHtml] = match as RegExpMatchArray;

				if (rawHtml === undefined) {
					continue;
				}

				// Minify the captured HTML content
				const minifiedHtml = await minify(rawHtml, {
					removeComments: true,
					collapseWhitespace: true,
					// This is important for template literals with placeholders
					// It prevents minifier from breaking template placeholders like ${t}
					ignoreCustomFragments: [/\${.*?}/g]
				});

				// Reconstruct the code, replacing the original tagged template
				// with a simple minified string.
				const replacement = `\`${minifiedHtml}\``;
				newCode = newCode.replace(fullMatch, replacement);
			}

			return {
				code: newCode,
				map: null // Source maps are not generated for this transformation
			};
		}
	};
};
