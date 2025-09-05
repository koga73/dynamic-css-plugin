// Replace setAttribute with a dynamic version that can modify class names
function PatchSetAttribute(scope = "") {
	return {
		search: /(\w+)\.setAttribute\(/g,
		replace: `globalThis['${scope}setAttributeDynamic'].call($1,`
	};
}

export default PatchSetAttribute;
