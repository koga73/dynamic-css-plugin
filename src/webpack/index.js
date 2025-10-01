import {promises as fs} from "fs";

import Options from "../options.js";
import Tokenize from "../tokenize.js";
import getLocalIdent from "./get-local-ident.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

class DynamicCssWebpackPlugin {
	constructor(opts) {
		this.options = new Options(opts);

		this.plugin = {
			name: packageName,
			version: packageVersion
		};
		this._hasGenerated = false;

		this._afterEnvironment = this._afterEnvironment.bind(this);
		this._beforeCompile = this._beforeCompile.bind(this);
	}

	apply(compiler) {
		const {options, plugin} = this;
		const {enabled} = options;
		const {name} = plugin;
		
		if (enabled === true) {
			compiler.hooks.afterEnvironment.tap(name, () => this._afterEnvironment(compiler));
		}
		compiler.hooks.beforeCompile.tapPromise(name, () => this._beforeCompile(compiler));
	}

	_afterEnvironment(compiler) {
		const {options} = this;
		const {debug, patch: createPatch, inject, transform} = options;
		if (debug) {
			console.info(`[${packageName}] Configuring webpack...`);
		}

		const rules = compiler.options.module.rules;

		//Add options into css-loader
		const cssRule = rules.find((rule) => rule.test.test(".css"));
		if (!cssRule) {
			throw new Error(".css rule not found");
		}
		const cssLoader = cssRule.use.find((loader) => loader.loader === "css-loader");
		if (!cssLoader) {
			throw new Error("css-loader not found");
		}
		const cssLoaderOptions = cssLoader.options || {};
		const cssLoaderOptionsModules = cssLoaderOptions.modules || {};
		cssLoaderOptionsModules.localIdentName = transform.template;
		cssLoaderOptionsModules.getLocalIdent = getLocalIdent(transform);
		cssLoaderOptions.modules = cssLoaderOptionsModules;
		cssLoader.options = cssLoaderOptions;

		//Add string-replace-loader to apply the patch
		const patch = createPatch(options.scope);
		rules.unshift({
			loader: "string-replace-loader",
			test: patch.test,
			options: {
				search: patch.search,
				replace: patch.replace
			}
		});

		//Inject into the bundle
		const entry = compiler.options.entry;
		const entryName = options.entryPoint || Object.keys(entry)[0];
		const entryChunk = entry[entryName];
		if (!entryChunk) {
			throw new Error("Entry chunk not found");
		}
		const hasImport = typeof entryChunk.import !== typeof undefined;
		let entryChunkImport = hasImport ? entryChunk.import : entryChunk;
		if (!Array.isArray(entryChunkImport)) {
			entryChunkImport = [entryChunkImport];
		}

		entryChunkImport.unshift(inject.file);
		if (hasImport) {
			entryChunk.import = entryChunkImport;
		} else {
			entry[entryName] = entryChunkImport;
		}
	}

	// Always generate the inject script as it could be used in vanilla js
	async _beforeCompile(compiler) {
		if (this._hasGenerated) {
			return;
		}
		this._hasGenerated = true;

		const {options} = this;
		const {debug, enabled, scope, inject, transform} = options;
		if (debug) {
			console.info(`[${packageName}] Generating inject script '${inject.file}'...`);
		}

		const input = await fs.readFile(inject.src, Options.ENCODING);
		const tokens = Tokenize.compute({packageName, packageVersion}, {...transform, scope, enabled});
		const output = Tokenize.replace(input, tokens);

		await fs.writeFile(inject.file, output, Options.ENCODING);
	}
}

export {Options};
export default DynamicCssWebpackPlugin;
