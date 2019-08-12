const path = require("path");

module.exports = {
  entry: {
    main: "./src/index.js",
    wallet: "./src/wallet.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src")
    }
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
