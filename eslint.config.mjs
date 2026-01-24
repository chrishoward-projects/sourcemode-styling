import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default tseslint.config(
	...obsidianmd.configs.recommended,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json",
			},
			globals: {
				// Browser globals
				document: "readonly",
				window: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				requestAnimationFrame: "readonly",
				cancelAnimationFrame: "readonly",
				// Node globals (for build scripts)
				process: "readonly",
				__dirname: "readonly",
				module: "readonly",
				require: "readonly",
			},
		},
		rules: {
			// Keep existing rules from previous config
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-function": "off",
			// Disable overly strict rules
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-argument": "off",

			// Turn off sample-names since this is not a template
			"obsidianmd/sample-names": "off",
			"obsidianmd/no-sample-code": "off",
		},
	},
	{
		ignores: ["main.js", "esbuild.config.mjs", "version-bump.mjs", "prepare-changelog.mjs", "node_modules/**"],
	}
);
