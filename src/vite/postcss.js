import getTransformFunc from "../transform/index.js";

// A PostCSS plugin that applies the transform to class selectors
function DynamicCssPostcssPlugin(options, result) {
	const {transform} = options;
	const {template, ignoreValues, ignoreFiles} = transform;

	const transformFunc = getTransformFunc(template);

	return {
		postcssPlugin: "DynamicCssPostcssPlugin",
		Rule(rule) {
			// Check if we should ignore this file
			if (ignoreFiles.test(rule.source.input.file)) {
				return;
			}
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

					if (!result.didTransform) {
						result.didTransform = true;
					}
				});
			}
		}
	};
}
DynamicCssPostcssPlugin.postcss = true;

export default DynamicCssPostcssPlugin;
