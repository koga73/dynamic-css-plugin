import getTransformFunc from "../transform/index.js";

// A PostCSS plugin that applies the transform to class selectors
function DynamicCssPostcssPlugin(options) {
	const {transform} = options;
	const {template, ignoreValues} = transform;

	const transformFunc = getTransformFunc(template);

	return {
		postcssPlugin: "DynamicCssPostcssPlugin",
		Rule(rule) {
			const {selector} = rule;

			// Find classes in selector
			const matches = selector.match(/\.[\w-]+/g);
			if (matches) {
				matches.forEach((match) => {
					const className = match.slice(1); // Remove the dot
					if (ignoreValues.test(className)) {
						return;
					}
					rule.selector = rule.selector.replace(match, `.${transformFunc(className)}`);
				});
			}
		}
	};
}
DynamicCssPostcssPlugin.postcss = true;

export default DynamicCssPostcssPlugin;
