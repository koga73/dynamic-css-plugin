import {defineConfig} from "vite";

import react from "@vitejs/plugin-react";
import reactDynamicCssPlugin from "react-dynamic-css-plugin/vite";

export default defineConfig(function viteConfig() {
	return {
		server: {
			port: 8080,
			strictPort: true,
			open: true
		},
		build: {
			outDir: "build",
			sourcemap: true
		},
		plugins: [
			react(),
			reactDynamicCssPlugin({
				enabled: true,
				localIdentName: "app_[md4:hash:base64:5]"
			})
		]
	};
});
