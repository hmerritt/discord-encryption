import CleanCSS from "clean-css";

// A simple custom plugin to find and minify CSS in template strings
export const cssMinify = () => {
    const cleanCss = new CleanCSS();
    return {
        name: "minify-css-template-strings",
        transform(code) {
            // Updated Regex: Captures the property and the raw content separately
            const cssRegex = /(css:\s*)css(`[\s\S]*?`)/g;

            if (cssRegex.test(code)) {
                const transformedCode = code.replace(
                    cssRegex,
                    (_, property, templateString) => {
                        // 1. Get the raw content by slicing off the backticks
                        const rawCss = templateString.slice(1, -1);

                        // 2. Minify the raw content
                        const minifiedCss = cleanCss.minify(rawCss).styles;

                        // 3. Rebuild the string without the tag, using single quotes
                        return `${property}'${minifiedCss}'`;
                    }
                );
                return {
                    code: transformedCode,
                    map: null
                };
            }
        }
    };
};
