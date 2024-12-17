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

// Common plugins configuration
const commonPlugins = [
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

// Main Library Build Configuration
const libraryConfig = {
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
  external: externalDeps,
  plugins: commonPlugins,
};

// CLI Build Configuration
const cliConfig = {
  input: "src/cli/index.ts",
  output: {
    file: "dist/cli/index.js",
    format: "cjs",
    sourcemap: true,
    banner,
    footer,
  },
  external: externalDeps,
  plugins: commonPlugins,
};

// Export the configurations
const config = [libraryConfig, cliConfig];
export default config;
