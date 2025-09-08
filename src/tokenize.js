import Md4 from "./inject/algo/md4.js";

class Tokenize {
	static compute({packageName, packageVersion}, {template, attributes, ignoreTags, ignoreValues, scope}) {
		return {
			__PACKAGE_NAME__: packageName,
			__PACKAGE_VERSION__: packageVersion,
			__TEMPLATE__: template,
			__ATTRIBUTES__: attributes,
			__IGNORE_TAGS__: ignoreTags,
			__IGNORE_VALUES__: ignoreValues,
			__SCOPE__: scope,
			__TRANSFORM_FUNC__: `(function ${this.getTransformFunc.toString()})("${template}")`
		};
	}

	static replace(input, tokens) {
		return Object.entries(tokens).reduce((output, [key, value]) => {
			const pattern = typeof value === "string" ? key : `["']?${key}["']?`;
			return output.replace(new RegExp(pattern, "g"), value);
		}, input);
	}

	static getTransformFunc(template) {
		const [patternMatch, algo, encoding, length] = /\[(.+):hash:(.+):(\d+)\]/i.exec(template);
		if (!patternMatch) {
			return (input) => input;
		}
		if (algo !== "md4") {
			throw new Error(`not supported algorithm '${algo}'`);
		}
		if (encoding !== "base64") {
			throw new Error(`not supported encoding '${encoding}'`);
		}

		return (input) => {
			const hash = Md4.array(input);
			const b64 = btoa(String.fromCharCode(...hash));
			const result = b64
				// Remove all leading digits
				.replace(/^\d+/, "")
				// Replace all slashes with underscores (same as in base64url)
				.replace(/\//g, "_")
				// Remove everything that is not an alphanumeric or underscore
				.replace(/[^A-Za-z0-9_]+/g, "")
				.slice(0, length);

			return template.replace(patternMatch, result);
		};
	}
}

// Node polyfill
function btoa(str) {
	return Buffer.from(str, "binary").toString("base64");
}

export default Tokenize;
