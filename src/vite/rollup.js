import path from "path";
import {promises as fs} from "fs";
import {fileURLToPath} from "url";

import MagicString from "magic-string";

import Options from "../options.js";
import Tokenize from "../tokenize.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to virtual scripts that need to be resolved
const VIRTUAL = {
	PACKAGE: `virtual:${packageName}`,
	SET_ATTRIBUTE_DYNAMIC: {
		name: `virtual:${packageName}/setAttributeDynamic.js`,
		replace: `./setAttributeDynamic.js`,
		src: path.resolve(__dirname, "../inject/setAttributeDynamic.js")
	},
	MD4: {
		name: `virtual:${packageName}/algo/md4.js`,
		replace: `./algo/md4.js`,
		src: path.resolve(__dirname, "../inject/algo/md4.js")
	}
};

function DynamicCssRollupPlugin(options) {
	const createPatch = options.patch;
	const patch = createPatch(options.scope);

	let entryId = null;

	const plugin = {
		name: packageName,
		version: packageVersion
	};
	return options.enabled !== true
		? plugin
		: {
				...plugin,

				// Generate the inject script when the build starts
				async buildStart() {
					if (options.debug) {
						console.info(`[${packageName}] Generating inject script...`);
					}

					const {inject, transform, scope} = options;

					const input = await fs.readFile(inject.src, Options.ENCODING);
					const tokens = Tokenize.compute({packageName, packageVersion}, {...transform, scope});
					const output = Tokenize.replace(input, tokens);

					await fs.writeFile(inject.file, output, Options.ENCODING);
				},

				// Transform code AFTER pre-bundle
				// NOTE: pre-bundle chunks will not get transformed
				transform(code, id) {
					switch (true) {
						//Apply the patch
						case patch.test.test(id): {
							if (options.debug) {
								console.info(`[${packageName}] Patching '${id}'...`);
							}

							const s = new MagicString(code);
							s.replace(patch.search, patch.replace);

							return {
								code: s.toString(),
								map: s.generateMap()
							};
						}

						// Inject into the entry
						case entryId && entryId === id:
						case !entryId && options.entryPoint && id === options.entryPoint:
						// Find the first module that isn't in node_modules and treat it as the entry
						// https://regex101.com/r/4Jmcli/2
						case !entryId && !options.entryPoint && /^(?!.*(node_modules)).+(js|jsx|cjs|mjs)$/.test(id): {
							if (!entryId) {
								entryId = id;
							}
							if (options.debug) {
								console.info(`[${packageName}] Injecting into entry: '${id}'...`);
							}

							const s = new MagicString(code);
							s.prepend(`import "${VIRTUAL.PACKAGE}";\n`);

							return {
								code: s.toString(),
								map: s.generateMap()
							};
						}
					}

					return null;
				},

				// Ensure if our transformed code is modified that we re-transform it
				shouldTransformCachedModule(id) {
					switch (true) {
						case patch.test.test(id):
						case entryId && id === entryId:
							return true;
					}
					return false;
				},

				// Resolve virtual modules
				resolveId(id) {
					switch (id) {
						case VIRTUAL.PACKAGE:
						case VIRTUAL.SET_ATTRIBUTE_DYNAMIC.name:
						case VIRTUAL.MD4.name:
							return id;
					}
					return null;
				},

				// Load virtual modules
				async load(id) {
					const {inject} = options;

					switch (id) {
						case VIRTUAL.PACKAGE:
							// prettier-ignore
							return (await fs.readFile(inject.file, Options.ENCODING))
								.replace(VIRTUAL.SET_ATTRIBUTE_DYNAMIC.replace, VIRTUAL.SET_ATTRIBUTE_DYNAMIC.name)
								.replace(VIRTUAL.MD4.replace, VIRTUAL.MD4.name);

						case VIRTUAL.SET_ATTRIBUTE_DYNAMIC.name:
							// prettier-ignore
							return (await fs.readFile(VIRTUAL.SET_ATTRIBUTE_DYNAMIC.src, Options.ENCODING));

						case VIRTUAL.MD4.name:
							return await fs.readFile(VIRTUAL.MD4.src, Options.ENCODING);
					}

					return null;
				}
		  };
}

export {Options};
export default DynamicCssRollupPlugin;
