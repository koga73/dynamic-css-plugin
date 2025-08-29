import Md4 from "./algo/md4";

const METHOD_NAME = "setAttributeDynamic";

const cacheStore = {};

export default function setDynamicAttribute({packageName, packageVersion, localIdentName, attributes, exclusionTags, exclusionValues, scope}) {
	const IDENT_FUNC = getIdentFunc(localIdentName);

	//Invoke with window[`setAttributeDynamic`].call(node, name, value)
	globalThis[`${scope}${METHOD_NAME}`] = function (name, value) {
		if (attributes.test(name) && value) {
			if (!exclusionTags.test(this.tagName)) {
				// Process value
				value = value
					.split(" ")
					.map((attrVal) => processVal(attrVal))
					.join(" ");
			}
		}
		return this.setAttribute(name, value);
	};
	globalThis[`${scope}${METHOD_NAME}`].packageName = packageName;
	globalThis[`${scope}${METHOD_NAME}`].packageVersion = packageVersion;

	// Check exclusion and cache values
	function processVal(val) {
		if (exclusionValues.test(val)) {
			return val;
		}
		if (val in cacheStore) {
			return cacheStore[val];
		}
		const newVal = IDENT_FUNC(val);
		cacheStore[val] = newVal;
		return newVal;
	}

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
}
