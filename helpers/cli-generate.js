#!/usr/bin/env node

// Pass in a template and input and get the transformed output

import Options from "../src/options.js";
import getTransformFunc from "../src/transform/index.js";

//package.json
import packageJson from "../package.json" assert {type: "json"};
const {name: packageName, version: packageVersion} = packageJson;

const DEFAULT_OPTIONS = {
	transform: Options.DEFAULT.transform.template,
	in: []
};

// Main CLI entry point
(async function main(args) {
	try {
		const options = parseArgs(args);
		if (options) {
			const transformFunc = getTransformFunc(options.template);

			console.log();
			for (const input of options.in) {
				console.log(
					JSON.stringify(
						{
							input,
							output: transformFunc(input)
						},
						null,
						2
					)
				);
			}
			console.log();
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}

	process.exit(0);
})(process.argv.splice(2));

// Parse args into options object
function parseArgs(args) {
	const options = {...DEFAULT_OPTIONS};

	let optionKey = null;

	const argsLen = args.length;
	if (argsLen === 0) {
		showCommands();
		return null;
	}

	for (let i = 0; i < argsLen; i++) {
		const arg = args[i];

		// Check if the current arg is an option or value
		if (arg.startsWith("-")) {
			optionKey = null;
		} else {
			if (optionKey) {
				if (Array.isArray(options[optionKey])) {
					options[optionKey].push(arg);
				} else {
					options[optionKey] = arg;
				}
			}
			continue;
		}

		// It's an option
		switch (arg.replace(/^-+/, "")) {
			case "t":
			case "template":
				optionKey = "template";
				break;

			case "i":
			case "in":
				optionKey = "in";
				break;

			case "?":
			case "help":
				showCommands();
				return null;
		}
	}

	return options;
}

function showCommands() {
	console.log(`
${packageName} v${packageVersion}
Usage: ${packageName} [options]

Options:
  -t --template <template>  Template for transforming class names (default: "${DEFAULT_OPTIONS.transform.template}")
  -i --in <strings...>		Input strings to transform
`);
}
