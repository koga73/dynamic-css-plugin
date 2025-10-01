// Private reference used to enforce singleton pattern
const _METHOD_NAME = "setAttributeDynamic";
const _SINGLETON_ENFORCER = Symbol(_METHOD_NAME);

let _singleton = null;

class SetAttributeDynamic {
	static initialize({packageName, packageVersion, scope, attributes, ignoreTags, ignoreValues, transformFunc}) {
		const instance = new SetAttributeDynamic(_SINGLETON_ENFORCER, {
			attributes,
			ignoreTags,
			ignoreValues,
			transformFunc
		});

		// Invoke with window[`setAttributeDynamic`].call(node, name, value)
		const scopedName = `${scope}${_METHOD_NAME}`;
		globalThis[scopedName] = instance._setAttributeDynamic;
		// Expose metadata since this gets written to globalThis
		globalThis[scopedName].packageName = packageName;
		globalThis[scopedName].packageVersion = packageVersion;

		_singleton = instance;
	}
	static getInstance() {
		if (!_singleton) {
			throw new Error("Not initialized");
		}
		return _singleton;
	}

	_options = {}; // configuration options
	_cache = {}; // key/value of original/transformed

	constructor(singletonEnforcer, options) {
		if (singletonEnforcer !== _SINGLETON_ENFORCER) {
			throw new Error("Unable to create instance of singleton class");
		}
		this._options = options;
	}

	// Transform attribute value
	_setAttributeDynamic(name, value) {
		if (!(this instanceof Element)) {
			throw new Error("Must be called in the context of a DOM Element");
		}
		const instance = SetAttributeDynamic.getInstance();

		return this.setAttribute(name, instance._getAttributeValue.call(this, name, value));
	}

	// Transform attribute value
	_getAttributeValue(name, value) {
		const instance = SetAttributeDynamic.getInstance();
		const {attributes, ignoreTags} = instance._options;

		if (attributes.test(name) && value) {
			if (!ignoreTags.test(this.tagName)) {
				return instance._processValue(value);
			}
		}
		return value;
	}

	// Process individual value
	_processValue(value) {
		const instance = SetAttributeDynamic.getInstance();
		if (!instance._isString(value)) {
			return value;
		}
		const {_options, _cache} = instance;
		const {ignoreValues, transformFunc} = _options;

		return value
			.split(" ")
			.map((val) => {
				// Check exclusion and cache values
				if (ignoreValues.test(val)) {
					return val;
				}
				if (val in _cache) {
					return _cache[val];
				}
				const newVal = transformFunc(val);
				_cache[val] = newVal;
				return newVal;
			})
			.join(" ")
			.trim();
	}

	_isString(str) {
		return typeof str === typeof "";
	}
}
export default SetAttributeDynamic;
