import path from "path";
import {promises as fs} from "fs";
import {fileURLToPath} from "url";

import MagicString from "magic-string";

import Constants from "../constants.js";
import Common from "../common.js";
import Patch from "../patch/setAttribute.js";

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

function ReactDynamicCssRollupPlugin(options = null) {
	options = {
		...Constants.DEFAULT_OPTIONS,
		...options
	};

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
					console.info(`[${packageName}] Generating inject script...`);

					const {_inject, ...opts} = options;

					const input = await fs.readFile(_inject.src, Constants.ENCODING);
					const tokens = Common.computeTokens({packageName, packageVersion}, opts);
					const output = Common.replaceTokens(input, tokens);

					await fs.writeFile(_inject.out, output, Constants.ENCODING);
				},

				// Transform code AFTER pre-bundle
				// NOTE: pre-bundle chunks will not get transformed
				transform(code, id) {
					switch (true) {
						//Hook into react-dom setAttribute
						case /react-dom/.test(id): {
							console.info(`[${packageName}] Patching '${id}'...`);

							const s = new MagicString(code);
							const patch = Patch(options.scope);
							s.replace(patch.search, patch.replace);

							return {
								code: s.toString(),
								map: s.generateMap()
							};
						}

						// Inject into the entry
						case !entryId && options.entryName && id === options.entryName:
						// Find the first module that isn't in node_modules and treat it as the entry
						// https://regex101.com/r/4Jmcli/2
						case !entryId && !options.entryName && /^(?!.*(node_modules|vite)).+(js|jsx|cjs|mjs)$/.test(id): {
							entryId = id;
							
							console.info(`[${packageName}] Injecting into entry: '${id}'...`);

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
						case /react-dom/.test(id):
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
					const {_inject} = options;

					switch (id) {
						case VIRTUAL.PACKAGE:
							// prettier-ignore
							return (await fs.readFile(_inject.out, Constants.ENCODING))
								.replace(VIRTUAL.SET_ATTRIBUTE_DYNAMIC.replace, VIRTUAL.SET_ATTRIBUTE_DYNAMIC.name);

						case VIRTUAL.SET_ATTRIBUTE_DYNAMIC.name:
							// prettier-ignore
							return (await fs.readFile(VIRTUAL.SET_ATTRIBUTE_DYNAMIC.src, Constants.ENCODING))
								.replace(VIRTUAL.MD4.replace, VIRTUAL.MD4.name);

						case VIRTUAL.MD4.name:
							return await fs.readFile(VIRTUAL.MD4.src, Constants.ENCODING);
					}

					return null;
				}
		  };
}

export default ReactDynamicCssRollupPlugin;
