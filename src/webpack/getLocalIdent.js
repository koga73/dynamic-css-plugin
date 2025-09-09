import getTransformFunc from "../transform/index.js";

function getLocalIdent({attributes, ignoreValues}) {
	return function getLocalIdent(loaderContext, localIdentName, localName, options) {
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
