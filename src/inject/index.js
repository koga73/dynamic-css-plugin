//This code gets injected into the bundle by __PACKAGE_NAME__

import Md4 from "./algo/md4.js";
import setDynamicAttribute from "./setAttributeDynamic.js";

setDynamicAttribute(
	//These values get replaced when the plugin runs
	{
		packageName: "__PACKAGE_NAME__",
		packageVersion: "__PACKAGE_VERSION__",
		template: "__TEMPLATE__",
		attributes: "__ATTRIBUTES__",
		ignoreTags: "__IGNORE_TAGS__",
		ignoreValues: "__IGNORE_VALUES__",
		scope: "__SCOPE__",
		transformFunc: __TRANSFORM_FUNC__
	}
);
