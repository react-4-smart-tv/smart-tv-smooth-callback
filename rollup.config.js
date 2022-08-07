import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import { obfuscator } from "rollup-obfuscator";

import pkg from "./package.json";

export default {
  moduleSideEffects: true,
  input: "index.ts",
  output: [
    {
      file: "./lib/cjs/index.js",
      format: "cjs",
    },
    {
      file: "./lib/esm/index.js",
      format: "es",
    },
  ],
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      typescript: require("typescript"),
    }),
    obfuscator({
      numbersToExpressions: true,
    }),
    terser(),
  ],
};
