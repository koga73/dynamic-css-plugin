const METHOD_NAME = "setAttributeDynamic";

const cacheStore = {};

function setDynamicAttribute({packageName, packageVersion, attributes, ignoreTags, ignoreValues, scope, transformFunc}) {
	//Invoke with window[`setAttributeDynamic`].call(node, name, value)
	globalThis[`${scope}${METHOD_NAME}`] = function (name, value) {
		if (attributes.test(name) && value) {
			if (!ignoreTags.test(this.tagName)) {
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
		if (ignoreValues.test(val)) {
			return val;
		}
		if (val in cacheStore) {
			return cacheStore[val];
		}
		const newVal = transformFunc(val);
		cacheStore[val] = newVal;
		return newVal;
	}
}

export default setDynamicAttribute;
