const { resolve } = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {
  target: "node",
  mode: "production",
  entry: "./src/build.ts",
  output: {
    filename: "build.js",
    path: resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    splitChunks: false,
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "src/HttpClient.ts",
          to: "",
        },
      ],
    }),
  ],
  externals: {
    typescript: "commonjs typescript",
    prettier: "commonjs prettier",
  },
};
