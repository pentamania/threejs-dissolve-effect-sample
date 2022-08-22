const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      // TS
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },

      // Assets: Common
      {
        test: /\.(png|jpg|gif|webp|glb|obj|hdr|exr)/,
        type: "asset",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, "src/index.html"),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "docs"),
  },
  devServer: {
    port: 9999,
    host: "0.0.0.0",
  },
  devtool: "eval-cheap-module-source-map",
};
