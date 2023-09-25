//This code gets injected into the bundle

import Md4 from "./algo/md4";

export default ({packageJson, localIdentName, attributes, exclusionTags, exclusionValues}) => {
	const IDENT_FUNC = getIdentFunc(localIdentName);

	//Invoke with window[`setAttributeDynamic`].call(node, name, value)
	window[`setAttributeDynamic`] = function (name, value) {
		if (attributes.test(name) && value) {
			if (!exclusionTags.test(this.tagName)) {
				value = value
					.split(" ")
					.map((attrVal) => (exclusionValues.test(attrVal) ? attrVal : IDENT_FUNC(attrVal)))
					.join(" ");
			}
		}
		this.setAttribute(name, value);
	};
	window[`setAttributeDynamic`].name = packageJson.name;
	window[`setAttributeDynamic`].version = packageJson.version;

	function getIdentFunc(pattern) {
		const [patternMatch, algo, digest, length] = /\[(.+):hash:(.+):(\d+)\]/i.exec(pattern);
		if (algo !== "md4") {
			throw new Error("algorithm is not supported");
		}
		if (digest !== "base64") {
			throw new Error("digest is not supported");
		}
		if (patternMatch) {
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
				return pattern.replace(patternMatch, result);
			};
		}
		return (input) => input;
	}
};
