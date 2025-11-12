import getTransformFunc from "../transform/index.js";

function getLocalIdent({attributes, ignoreValues, ignoreFiles}) {
	return function getLocalIdent(loaderContext, localIdentName, localName, options) {
		// Check if we should ignore this file
		if (ignoreFiles.test(loaderContext.resourcePath)) {
			return localName;
		}

		if (options.node && !attributes.test(options.node.type)) {
			return localName;
		}
		if (ignoreValues.test(localName)) {
			return localName;
		}

		return getTransformFunc(localIdentName)(localName);
	};
}
export default getLocalIdent;
