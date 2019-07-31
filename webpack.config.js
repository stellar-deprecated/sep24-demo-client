const path = require("path");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist")
	},
	plugins: [
		new Dotenv(),
		new webpack.EnvironmentPlugin([
			"URL",
			"USER_PK",
			"USER_SK",
			"TESTNET_URI",
			"ASSET_CODE",
			"AMOUNT"
		])
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			}
		]
	}
};
