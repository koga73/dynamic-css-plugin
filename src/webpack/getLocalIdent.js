function getLocalIdent({attributes, exclusionValues}) {
	//Modified from original at: https://github.com/webpack-contrib/css-loader/blob/master/src/utils.js
	return function getLocalIdent(loaderContext, localIdentName, localName, options) {
		if (options.node && !attributes.test(options.node.type)) {
			return localName;
		}
		if (exclusionValues.test(localName)) {
			return localName;
		}

		let {hashFunction, hashDigest, hashDigestLength} = options;

		const matches = localIdentName.match(/\[(?:([^:\]]+):)?(?:(hash|contenthash|fullhash))(?::([a-z]+\d*))?(?::(\d+))?\]/i);
		if (matches) {
			const hashName = matches[2] || hashFunction;

			hashFunction = matches[1] || hashFunction;
			hashDigest = matches[3] || hashDigest;
			hashDigestLength = matches[4] || hashDigestLength;

			// `hash` and `contenthash` are same in `loader-utils` context
			// let's keep `hash` for backward compatibility
			localIdentName = localIdentName.replace(/\[(?:([^:\]]+):)?(?:hash|contenthash|fullhash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi, () =>
				hashName === "fullhash" ? "[fullhash]" : "[contenthash]"
			);
		}

		const hash =
			loaderContext.utils && typeof loaderContext.utils.createHash === "function"
				? loaderContext.utils.createHash(hashFunction)
				: loaderContext._compiler.webpack.util.createHash(hashFunction);

		//Hash the id/class
		hash.update(localName);

		const hashStr = hash
			.digest(hashDigest)
			// Remove all leading digits
			.replace(/^\d+/, "")
			// Replace all slashes with underscores (same as in base64url)
			.replace(/\//g, "_")
			// Remove everything that is not an alphanumeric or underscore
			.replace(/[^A-Za-z0-9_]+/g, "")
			.slice(0, hashDigestLength);

		return localIdentName.replace(/\[contenthash\]/, hashStr);
	};
}
export default getLocalIdent;
