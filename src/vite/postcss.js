// A PostCSS plugin that applies the localIdentName to class selectors

function ReactDynamicCssPostcssPlugin(options = {}) {
	return {
		postcssPlugin: "ReactDynamicCssPostcssPlugin",
		Rule(rule) {
			const {selector} = rule;

			// Find classes in selector
			const matches = selector.match(/\.[\w-]+/gi);
			if (matches) {
				matches.forEach((match) => {
					//TODO: ACTUAL CODE TO GENERATE CSS CLASS NAMES!
					rule.selector = rule.selector.replace(match, `${match}${options.postfix}`);
				});
			}
		}
	};
}
ReactDynamicCssPostcssPlugin.postcss = true;

export default ReactDynamicCssPostcssPlugin;
