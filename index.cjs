const packageJson = require("./package.json");
const getLocalIdent = require("./scripts/getLocalIdent.cjs");

class _class {
	static DEFAULT_OPTIONS = {
		enabled: true,
		localIdentName: "[md4:hash:base64:5]",
		attributes: /^(id|class)$/,
		exclusionTags: /(path)/i,
		exclusionValues: /^(css|sc|icon)-/i
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
		if (this.options.enabled !== true) {
			return;
		}
		compiler.hooks.beforeCompile.tapAsync(this.plugin.name, (params, done) => {
			console.log(params);

			process.exit(1);
			done();

			/*
			Inject loader
			{
				//react-dom.development.js
				//react-dom.production.min.js
				test: /react-dom\..+\.js$/,
				loader: "string-replace-loader",
				options: {
					search: /(\w+)\.setAttribute\(/g,
					replace: "window['setAttributeDynamic'].call($1,"
				}
			}
			*/

			/*
			Inject into MiniCssExtractPlugin options.modules
			{
				localIdentName: "[md4:hash:base64:5]",
				getLocalIdent
			}
			*/
		});
	}
}
module.exports = _class;
