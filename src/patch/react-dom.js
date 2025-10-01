const _METHOD_NAME = "setAttributeDynamic";

// Replace setAttribute with a dynamic version that can modify class names
function PatchReactDom(scope = "") {
	return {
		test: /react-dom/,
		search: /(\w+)\.setAttribute\(/g,
		replace: `globalThis['${scope}${_METHOD_NAME}'].call($1,`
	};
}

export default PatchReactDom;
