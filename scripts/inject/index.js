//This code gets injected into the bundle by __PACKAGE_NAME__

import setDynamicAttribute from "./setAttributeDynamic";

setDynamicAttribute(
	//These values get replaced when the plugin runs
	{
		packageName: "__PACKAGE_NAME__",
		packageVersion: "__PACKAGE_VERSION__",
		localIdentName: "__LOCAL_IDENT_NAME__",
		attributes: "__ATTRIBUTES__",
		exclusionTags: "__EXCLUSION_TAGS__",
		exclusionValues: "__EXCLUSION_VALUES__",
		scope: "__SCOPE__"
	}
);
