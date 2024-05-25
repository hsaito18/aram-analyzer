import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});
rules.push({
  test: /\.(jpg|png|svg)$/,
  use: {
    loader: "file-loader",
    options: {
      name: "[name].[hash].[ext]",
      outputPath: "assets/",
    },
  },
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
