import {promises as fs} from "fs";

import Constants from "../constants.js";
import Common from "../common.js";
import Patch from "../patch/setAttribute.js";
import getLocalIdent from "./getLocalIdent.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

class ReactDynamicCssWebpackPlugin {
	constructor(options) {
		this.plugin = {
			name: packageName,
			version: packageVersion
		};
		this.options = {
			...Constants.DEFAULT_OPTIONS,
			...options
		};
		this._hasGenerated = false;

		this._afterEnvironment = this._afterEnvironment.bind(this);
		this._beforeCompile = this._beforeCompile.bind(this);
	}

	apply(compiler) {
		const {options, plugin} = this;
		const {enabled} = options;
		if (enabled !== true) {
			return;
		}
		const {name} = plugin;

		compiler.hooks.afterEnvironment.tap(name, () => this._afterEnvironment(compiler));
		compiler.hooks.beforeCompile.tapPromise(name, () => this._beforeCompile(compiler));
	}

	_afterEnvironment(compiler) {
		console.info(`[${packageName}] Configuring webpack...`);

		const {options} = this;

		const rules = compiler.options.module.rules;

		//Inject options into css-loader
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
		cssLoaderOptionsModules.localIdentName = options.localIdentName;
		cssLoaderOptionsModules.getLocalIdent = getLocalIdent(options);
		cssLoaderOptions.modules = cssLoaderOptionsModules;
		cssLoader.options = cssLoaderOptions;

		//Inject string-replace-loader to hook into react-dom setAttribute
		rules.unshift({
			//react-dom.development.js
			//react-dom.production.min.js
			test: /react-dom\..+\.js$/,
			loader: "string-replace-loader",
			options: Patch(options.scope)
		});

		//Inject into the bundle
		const entry = compiler.options.entry;
		const entryName = options.entryName || Object.keys(entry)[0];
		const entryChunk = entry[entryName];
		if (!entryChunk) {
			throw new Error("Entry chunk not found");
		}
		const hasImport = typeof entryChunk.import !== typeof undefined;
		let entryChunkImport = hasImport ? entryChunk.import : entryChunk;
		if (!Array.isArray(entryChunkImport)) {
			entryChunkImport = [entryChunkImport];
		}

		entryChunkImport.unshift(options._inject.out);
		if (hasImport) {
			entryChunk.import = entryChunkImport;
		} else {
			entry[entryName] = entryChunkImport;
		}
	}

	// Generate the inject script
	async _beforeCompile(compiler) {
		if (this._hasGenerated) {
			return;
		}
		this._hasGenerated = true;

		console.info(`[${packageName}] Generating inject script...`);

		const {options} = this;
		const {_inject, ...opts} = options;

		const input = await fs.readFile(_inject.src, Constants.ENCODING);
		const tokens = Common.computeTokens({packageName, packageVersion}, opts);
		const output = Common.replaceTokens(input, tokens);

		await fs.writeFile(_inject.out, output, Constants.ENCODING);
	}
}

export default ReactDynamicCssWebpackPlugin;
