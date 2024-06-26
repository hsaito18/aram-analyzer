import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const rendererPatterns = [
  {
    from: path.resolve(__dirname, "src", "assets"),
    to: path.resolve(__dirname, ".webpack/renderer", "assets"),
  },
];

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),
  new CopyPlugin({
    patterns: rendererPatterns,
  }),
];
