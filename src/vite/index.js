import DynamicCssRollupPlugin from "./rollup.js";
import DynamicCssPostcssPlugin from "./postcss.js";
import DynamicCssEsbuildPlugin from "./esbuild.js";

import Options from "../options.js";

import packageJson from "../../package.json" with {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

function DynamicCssVitePlugin(opts = {}) {
	const options = new Options(opts);

	const result = {
		didGenerate: false,
		didInject: false,
		didPatch: false,
		didTransform: false
	};

	return {
		// Vite is built on Rollup
		...DynamicCssRollupPlugin.call(this, options, result),
		name: packageName,
		version: packageVersion,

		// Add postcss and esbuild plugins
		config(config) {
			if (options.enabled !== true) {
				return;
			}
			//Add postcss plugin
			config.css ||= {};
			config.css.postcss ||= {};
			config.css.postcss.plugins ||= [];
			config.css.postcss.plugins.push(DynamicCssPostcssPlugin(options, result));

			//Add esbuild plugin
			config.optimizeDeps ||= {};
			config.optimizeDeps.esbuildOptions ||= {};
			config.optimizeDeps.esbuildOptions.plugins ||= [];
			config.optimizeDeps.esbuildOptions.plugins.push(DynamicCssEsbuildPlugin(options, result));
		},

		// Check the result when the build is done
		buildEnd() {
			if (!result.didGenerate) {
				throw new Error(`[${packageName}] The inject script was not generated`);
			}
			if (options.enabled !== true) {
				return;
			}

			if (!result.didInject) {
				throw new Error(`[${packageName}] Could not find an entry point for injection`);
			}
			if (!result.didPatch) {
				throw new Error(`[${packageName}] The patch was not applied`);
			}
			if (!result.didTransform) {
				console.warn(`[${packageName}] Warning: No CSS class names were transformed`);
			}
		}
	};
}

export {Options};
export default DynamicCssVitePlugin;
