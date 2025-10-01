import getTransformFunc from "./transform/index.js";

class Tokenize {
	static compute({packageName, packageVersion}, {enabled, scope, template, attributes, ignoreTags, ignoreValues}) {
		return {
			__PACKAGE_NAME__: packageName,
			__PACKAGE_VERSION__: packageVersion,
			__ENABLED__: enabled,
			__TEMPLATE__: template,
			__ATTRIBUTES__: attributes,
			__IGNORE_TAGS__: ignoreTags,
			__IGNORE_VALUES__: ignoreValues,
			__SCOPE__: scope,
			__TRANSFORM_FUNC__: `(${getTransformFunc.toString()})("${template}")`
		};
	}

	static replace(input, tokens) {
		return Object.entries(tokens).reduce((output, [key, value]) => {
			const pattern = typeof value === "string" ? key : `["']?${key}["']?`;
			return output.replace(new RegExp(pattern, "g"), value);
		}, input);
	}
}

export default Tokenize;
