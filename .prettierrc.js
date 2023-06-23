// @ts-check
/// <reference types="@prettier/plugin-pug/src/prettier" />

/**
 * @type {import('prettier').Options}
 */

module.exports = {
	trailingComma: "all",
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	printWidth: 80,
	arrowParens: "always",
	plugins: [require.resolve("@prettier/plugin-pug")],
	overrides: [
		{
			files: ["*.yml", "*.yaml"],
			options: {
				useTabs: false,
			},
		},
		{
			files: ["*.js", "*.ts", "*.vue", "*.json", "*.html", "*.css", "*.scss"],
			options: {
				useTabs: true,
			},
		},
	],
};
