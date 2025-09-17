import {defineConfig} from "vite";

import react from "@vitejs/plugin-react";
import dynamicCssPlugin from "dynamic-css-plugin/vite";

export default defineConfig(function viteConfig() {
	return {
		server: {
			open: true
		},
		build: {
			outDir: "build",
			sourcemap: true
		},
		plugins: [
			react(),
			dynamicCssPlugin({
				debug: true,
				transform: "app_[md4:hash:base64:5]"
			})
		]
	};
});
