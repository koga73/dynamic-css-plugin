//This code gets injected into the bundle by __PACKAGE_NAME__

import Md4 from "./algo/md4.js";
import SetAttributeDynamic from "./set-attribute-dynamic.js";

//These values get replaced when the plugin runs
if (__ENABLED__ === true) {
	SetAttributeDynamic.initialize({
		packageName: "__PACKAGE_NAME__",
		packageVersion: "__PACKAGE_VERSION__",
		template: "__TEMPLATE__",
		attributes: "__ATTRIBUTES__",
		ignoreTags: "__IGNORE_TAGS__",
		ignoreValues: "__IGNORE_VALUES__",
		scope: "__SCOPE__",
		transformFunc: __TRANSFORM_FUNC__
	});
}

// Export a helper function for use with classList and vanilla JS
function DynamicCss(...values) {
	let instance = null;
	try {
		instance = SetAttributeDynamic.getInstance();
	} catch (err) {
		// We could be disabled, don't error
	}
	if (!instance) {
		return values.join(" ").trim();
	}

	// Process multiple values if specified
	return values.map(instance._processValue).join(" ").trim();
}
export default DynamicCss;
