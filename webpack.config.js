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
        test: /\.(png|jpeg|ttf|woff|woff2)$/,
        use: [{ 
          loader: "file-loader",
          options: {
            publicPath: '../' 
        } }]
      },
      {
        test: /\.(svg)$/,
        use: [{ loader: "svg-url-loader" }]
      }
    ]
  }
};
