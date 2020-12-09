const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  // webpack config
  mode: 'development',
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      inject: "body",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};