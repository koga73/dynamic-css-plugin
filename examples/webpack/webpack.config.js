import path from "path";
import {fileURLToPath} from "url";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import DynamicCssPlugin from "dynamic-css-plugin/webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = "src";
const ENTRY_FILE = "index.jsx";
const OUTPUT_DIR = "build";

export default function webpackConfig(env, argv) {
	return {
		target: "web",
		devServer: {
			host: process.env.HOST,
			port: process.env.PORT,
			open: true,
			historyApiFallback: true
		},
		mode: "development",
		entry: path.join(__dirname, INPUT_DIR, ENTRY_FILE),
		output: {
			path: path.join(__dirname, OUTPUT_DIR),
			filename: `js/[name].min.js`,
			chunkFilename: "js/[name].min.js",
			clean: true
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					resolve: {
						extensions: [".js", ".jsx"],
						fullySpecified: false
					},
					use: {
						loader: "babel-loader",
						options: {
							extends: "./babel.config.json"
						}
					}
				},
				{
					test: /\.(css)$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: "css-loader"
						}
					]
				}
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: `css/[name].min.css`,
				chunkFilename: `css/[name].min.css`
			}),
			new HtmlWebpackPlugin({
				title: "Example - Webpack | Dynamic CSS Plugin",
				filename: "index.html",
				template: path.join(__dirname, INPUT_DIR, "index.html")
			}),
			new DynamicCssPlugin({
				enabled: true,
				debug: true,
				transform: "app_[md4:hash:base64:5]"
			})
		]
	};
}
