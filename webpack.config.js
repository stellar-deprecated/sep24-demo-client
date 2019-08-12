const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/index.js",
    wallet: "./src/wallet.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpeg|ttf)$/,
        use: [{ loader: "file-loader" }]
      },
      {
        test: /\.(svg)$/,
        use: [{ loader: "svg-url-loader" }]
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        use: 'file-loader?name=fonts/[name].[ext]!static'
       }
    ]
  }
};
