// A PostCSS plugin that applies the transform to class selectors

import Tokenize from "../tokenize.js";

function DynamicCssPostcssPlugin(options) {
	const transformFunc = Tokenize.getTransformFunc(options.transform.template);

	return {
		postcssPlugin: "DynamicCssPostcssPlugin",
		Rule(rule) {
			const {selector} = rule;

			// Find classes in selector
			const matches = selector.match(/\.[\w-]+/gi);
			if (matches) {
				matches.forEach((match) => {
					const className = match.slice(1); // Remove the dot
					rule.selector = rule.selector.replace(match, `.${transformFunc(className)}`);
				});
			}
		}
	};
}
DynamicCssPostcssPlugin.postcss = true;

export default DynamicCssPostcssPlugin;
