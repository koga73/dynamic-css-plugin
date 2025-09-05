import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Constants {
	static ENCODING = "utf8";

	static DEFAULT_OPTIONS = {
		enabled: true,
		entryName: undefined,
		localIdentName: "[md4:hash:base64:5]",
		attributes: /^(class)$/,
		exclusionTags: /(path)/i,
		exclusionValues: /^(css|sc|icon)-/i,
		scope: "",

		_inject: {
			src: path.resolve(__dirname, "./inject/index.js"),
			out: path.resolve(__dirname, "./inject/index_generated.js")
		}
	};
}

export default Constants;
