import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

// Detect if we're in production mode
const production = process.env.NODE_ENV === "production";

// Banner and footer for output files
const banner = `/*!
 * @obinexuscomputing/dom-asm ${pkg.version}
 * (c) ${new Date().getFullYear()} Obinexus Computing
 * Released under the ISC License
 */`;

const footer = `/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */`;

export default [
  // **Main Library Build**
  {
    input: "src/index.ts", // Main entry point
    output: [
      {
        file: "dist/index.js", // ES Module
        format: "es",
        sourcemap: true,
        banner,
        footer,
      },
      {
        file: "dist/index.cjs", // CommonJS Module
        format: "cjs",
        sourcemap: true,
        banner,
        footer,
      },
    ],
    external: [
      "@obinexuscomputing/css",
      "@obinexuscomputing/html",
      "@obinexuscomputing/js",
      "@obinexuscomputing/xml",
      "fs",
      "path",
    ],
    plugins: [
      // Resolve modules from node_modules
      resolve({
        extensions: [".js", ".ts", ".json"],
      }),
      // Convert CommonJS modules to ES6
      commonjs(),
      // Include JSON files
      json(),
      // TypeScript compilation
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      // Minify in production mode
      production && terser(),
    ],
  },

  // **CLI Build**
  {
    input: "src/cli/index.ts", // CLI entry point
    output: {
      file: "dist/cli/index.js",
      format: "cjs",
      sourcemap: true,
      banner,
      footer,
    },
    external: ["commander", "fs", "path"], // Exclude dependencies
    plugins: [
      resolve({
        extensions: [".js", ".ts", ".json", ".mjs"],
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      production && terser(),
    ],
  },
];
