import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

// Detect production mode
const production = process.env.NODE_ENV === "production";

// Banner and footer for the output files
const banner = `/*!
 * @obinexuscomputing/dom-asm v${pkg.version}
 * (c) ${new Date().getFullYear()} Obinexus Computing
 * Released under the ISC License
 */`;

const footer = `/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */`;

// Common plugin configuration
const plugins = [
  resolve({
    extensions: [".js", ".ts", ".json", ".mjs"],
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: "./tsconfig.json",
    exclude: ["**/*.d.ts", "**/*.test.ts"], // Exclude declarations and tests
  }),
  production && terser(), // Minify in production mode
];

// External dependencies to exclude from the bundle
const externalDeps = [
  "@obinexuscomputing/css",
  "@obinexuscomputing/html",
  "@obinexuscomputing/js",
  "@obinexuscomputing/xml",
  "fs",
  "path",
  "commander",
];

export default [
  // **Main Library Build**
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "es",
        sourcemap: true,
        banner,
        footer,
      },
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: true,
        banner,
        footer,
      },
    ],
    external: externalDeps, // Mark dependencies as external
    plugins,
  },

  // **CLI Build**
  {
    input: "src/cli/index.ts",
    output: {
      file: "dist/cli/index.js",
      format: "cjs",
      sourcemap: true,
      banner,
      footer,
    },
    external: externalDeps,
    plugins,
  },
];
