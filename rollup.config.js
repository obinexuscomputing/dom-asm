import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true, // Ensure declaration files are generated
    }),
    terser(),
  ],
  external: ["path", "fs"],
  onwarn(warning, warn) {
    // Catch warnings and print them
    if (warning.code === "CIRCULAR_DEPENDENCY") {
      
    } else {
      warn(warning);
    }
  },
};
