const fs = require("fs");
const path = require("path");

const packageJson = require("./package.json");
const getLocalIdent = require("./scripts/getLocalIdent.cjs");

const SCRIPT_INJECT_SRC = path.resolve(__dirname, "./scripts/inject/setAttributeDynamic.js");
const SCRIPT_INJECT = SCRIPT_INJECT_SRC.replace(/\.js$/, "_generated.js");

class _class {
	static DEFAULT_OPTIONS = {
		enabled: true,
		localIdentName: "[md4:hash:base64:5]",
		attributes: /^(id|class)$/,
		exclusionTags: /(path)/i,
		exclusionValues: /^(css|sc|icon)-/i,
		entryName: undefined,

		scriptInject: {
			src: SCRIPT_INJECT_SRC,
			out: SCRIPT_INJECT
		}
	};

	constructor(options) {
		this.plugin = {
			name: packageJson.name,
			version: packageJson.version
		};
		this.options = {
			..._class.DEFAULT_OPTIONS,
			...options
		};
	}

	apply(compiler) {
		const _this = this;
		const {options} = _this;
		if (options.enabled !== true) {
			return;
		}
		compiler.hooks.beforeRun.tap(_this.plugin, (compiler) => {
			const miniCssExtractPlugin = compiler.options.plugins.find((plugin) => plugin.constructor.name === "MiniCssExtractPlugin");
			if (!miniCssExtractPlugin) {
				throw new Error("MiniCssExtractPlugin not found");
			}

			//Inject options into MiniCssExtractPlugin
			const modules = miniCssExtractPlugin.options.modules || {};
			modules.localIdentName = options.localIdentName;
			modules.getLocalIdent = getLocalIdent(options);
			miniCssExtractPlugin.options.modules = modules;
			//console.log(miniCssExtractPlugin);

			//Inject string-replace-loader to hook into react-dom setAttribute
			const rules = compiler.options.module.rules || {};
			rules.unshift({
				//react-dom.development.js
				//react-dom.production.min.js
				test: /react-dom\..+\.js$/,
				loader: "string-replace-loader",
				options: {
					search: /(\w+)\.setAttribute\(/g,
					replace: "window['setAttributeDynamic'].call($1,"
				}
			});
			compiler.options.module.rules = rules;
			//console.log(rules);

			//Inject the setAttributeDynamic function into the bundle
			const entry = compiler.options.entry;
			const entryName = options.entryName || Object.keys(entry)[0];
			const entryBundle = entry[entryName];
			if (!entryBundle) {
				throw new Error("Entry bundle not found");
			}
			const hasImport = typeof entryBundle.import !== typeof undefined;
			let entryBundleImport = hasImport ? entryBundle.import : entryBundle;
			if (!Array.isArray(entryBundleImport)) {
				entryBundleImport = [entryBundleImport];
			}
			_this._generateInjectScript(options);
			entryBundleImport.unshift(options.scriptInject.out);
			if (hasImport) {
				entryBundle.import = entryBundleImport;
			} else {
				entry[entryName] = entryBundleImport;
			}
			//console.log(entry);

			//process.exit(1);
		});
	}

	_generateInjectScript(options) {
		const _this = this;
		const {src, out} = options.scriptInject;
		const data = fs.readFileSync(src, "utf8");
		const tokens = _this._computeTokens(options);
		const output = _this._replaceTokens(data, tokens);
		fs.writeFileSync(out, output, "utf8");
	}

	_computeTokens(options) {
		return {
			__PACKAGE_NAME__: packageJson["name"],
			__PACKAGE_VERSION__: packageJson["version"],
			__LOCAL_IDENT_NAME__: options.localIdentName,
			__ATTRIBUTES__: options.attributes,
			__EXCLUSION_TAGS__: options.exclusionTags,
			__EXCLUSION_VALUES__: options.exclusionValues
		};
	}

	_replaceTokens(input, tokens) {
		return Object.entries(tokens).reduce((output, [key, value]) => {
			const pattern = typeof value === "string" ? key : `["']?${key}["']?`;
			return output.replace(new RegExp(pattern, "g"), value);
		}, input);
	}
}
module.exports = _class;
