import path from "path";
import {fileURLToPath} from "url";

import PatchReactDom from "./patch/react-dom.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Options {
	static ENCODING = "utf8";

	static DEFAULT = {
		enabled: true,
		scope: "",
		transform: {
			template: "[md4:hash:base64:5]",
			attributes: /^(class)$/,
			ignoreTags: /(path)/i,
			ignoreValues: /^(css|sc|icon)-/i
		},
		inject: {
			entryPoint: undefined,
			src: path.resolve(__dirname, "./inject/index.js"),
			file: path.resolve(__dirname, "./inject/index_generated.js")
		},
		patch: PatchReactDom
	};

	constructor(options = {}) {
		const {transform, inject, ...opts} = options;

		// Spread onto this
		Object.assign(this, {
			...Options.DEFAULT,
			transform: {
				...Options.DEFAULT.transform,
				...(typeof transform === "string" ? {template: transform} : transform)
			},
			inject: {
				...Options.DEFAULT.inject,
				...inject
			},
			...opts
		});
	}
}

export default Options;
