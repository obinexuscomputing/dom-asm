import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";

export default [
  // Main JS build
  {
    input: "src/index.ts", // Entry point for the library
    output: [
      {
        file: "dist/index.cjs", // CommonJS output
        format: "cjs",
        sourcemap: true,
        exports: "auto",
      },
      {
        file: "dist/index.js", // ES Module output
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({ extensions: [".ts", ".js"] }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.json", // Use tsconfig for compilation
      }),
    ],
    external: ["fs", "path"], // Exclude Node.js built-ins
  },

  // TypeScript declaration build
  {
    input: "src/index.ts", // Source entry point
    output: {
      file: "dist/index.d.ts", // Output TypeScript declarations
      format: "es",
    },
    plugins: [dts()],
  },
];
