// Replace setAttribute with a dynamic version that can modify class names
function PatchReactDom(scope = "") {
	return {
		test: /react-dom/,
		search: /(\w+)\.setAttribute\(/g,
		replace: `globalThis['${scope}setAttributeDynamic'].call($1,`
	};
}

export default PatchReactDom;
