import {promises as fs} from "fs";

import Options from "../options.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName} = packageJson;

// An Esbuild plugin that applies the patch
function DynamicCssEsbuildPlugin(options) {
	const {patch: createPatch} = options;
	const patch = createPatch(options.scope);

	return {
		name: "DynamicCssEsbuildPlugin",
		setup(build) {
			build.onLoad(
				{
					filter: patch.test
				},
				async (args) => {
					console.info(`[${packageName}] Patching '${args.path}'...`);

					const source = await fs.readFile(args.path, Options.ENCODING);

					// Apply the patch
					return {
						contents: source.replace(patch.search, patch.replace)
					};
				}
			);
		}
	};
}

export default DynamicCssEsbuildPlugin;
