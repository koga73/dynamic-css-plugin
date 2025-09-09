import DynamicCssRollupPlugin from "./rollup.js";
import DynamicCssPostcssPlugin from "./postcss.js";
import DynamicCssEsbuildPlugin from "./esbuild.js";

import Options from "../options.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

function DynamicCssVitePlugin(opts = {}) {
	const options = new Options(opts);

	const plugin = {
		name: packageName,
		version: packageVersion
	};
	return options.enabled !== true
		? plugin
		: {
				// Vite is built on Rollup
				...DynamicCssRollupPlugin.call(this, options),
				...plugin,

				//Add postcss and esbuild plugins
				config: (config) => {
					//Add postcss plugin
					config.css ||= {};
					config.css.postcss ||= {};
					config.css.postcss.plugins ||= [];
					config.css.postcss.plugins.push(DynamicCssPostcssPlugin(options));

					//Add esbuild plugin
					config.optimizeDeps ||= {};
					config.optimizeDeps.esbuildOptions ||= {};
					config.optimizeDeps.esbuildOptions.plugins ||= [];
					config.optimizeDeps.esbuildOptions.plugins.push(DynamicCssEsbuildPlugin(options));
				}
		  };
}

export {Options};
export default DynamicCssVitePlugin;
