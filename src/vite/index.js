import ReactDynamicCssRollupPlugin from "./rollup.js";
import ReactDynamicCssPostcssPlugin from "./postcss.js";
import ReactDynamicCssEsbuildPlugin from "./esbuild.js";

import Constants from "../constants.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

function ReactDynamicCssVitePlugin(options = {}) {
	options = {
		...Constants.DEFAULT_OPTIONS,
		...options
	};

	const plugin = {
		name: packageName,
		version: packageVersion
	};
	return options.enabled !== true
		? plugin
		: {
				// Vite is built on Rollup
				...ReactDynamicCssRollupPlugin.call(this, options),
				...plugin,

				//Add postcss and esbuild plugins
				config: (config) => {
					//Add postcss plugin
					config.css ||= {};
					config.css.postcss ||= {};
					config.css.postcss.plugins ||= [];
					config.css.postcss.plugins.push(ReactDynamicCssPostcssPlugin(options));

					//Add esbuild plugin
					/*
					config.esbuild ||= {};
					config.esbuild.plugins ||= [];
					config.esbuild.plugins.push(ReactDynamicCssEsbuildPlugin(options));
					*/
				}
		  };
}

export default ReactDynamicCssVitePlugin;
