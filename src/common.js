class Common {
	static computeTokens({packageName, packageVersion}, {localIdentName, attributes, exclusionTags, exclusionValues, scope}) {
		return {
			__PACKAGE_NAME__: packageName,
			__PACKAGE_VERSION__: packageVersion,
			__LOCAL_IDENT_NAME__: localIdentName,
			__ATTRIBUTES__: attributes,
			__EXCLUSION_TAGS__: exclusionTags,
			__EXCLUSION_VALUES__: exclusionValues,
			__SCOPE__: scope
		};
	}

	static replaceTokens(input, tokens) {
		return Object.entries(tokens).reduce((output, [key, value]) => {
			const pattern = typeof value === "string" ? key : `["']?${key}["']?`;
			return output.replace(new RegExp(pattern, "g"), value);
		}, input);
	}
}

export default Common;
