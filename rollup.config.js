#!/usr/bin/env node
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

// Detect production mode
const production = process.env.NODE_ENV === "production";

// Banner and footer for metadata
const banner = `/*!
 * @obinexuscomputing/dom-asm v${pkg.version}
 * (c) ${new Date().getFullYear()} Obinexus Computing
 * Released under the ISC License
 */`;

const footer = `/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */`;

// External dependencies
const externalDeps = [
  "@obinexuscomputing/css",
  "@obinexuscomputing/html",
  "@obinexuscomputing/js",
  "@obinexuscomputing/xml",
  "fs",
  "path",
  "commander",
];

// Common plugins for both builds
const plugins = [
  typescript({
    tsconfig: "./tsconfig.json",
    include: ["src/**/*.ts"], // Include all source files
    exclude: ["**/*.d.ts", "**/*.test.ts"], // Exclude unnecessary files
  }),
  resolve({
    extensions: [".ts", ".js", ".json"],
  }),
  commonjs(),
  json(),
  production && terser(), // Minify only in production
];

// Main Library Configuration
const libraryConfig = {
  input: "src/index.ts", // Entry point for the library
  output: [
    {
      file: "dist/index.cjs", // CommonJS output
      format: "cjs",
      sourcemap: true,
      exports: "auto",
      banner,
      footer,
    },
    {
      file: "dist/index.js", // ESM output
      format: "esm",
      sourcemap: true,
      banner,
      footer,
    },
  ],
  external: externalDeps, // Do not bundle external dependencies
  plugins,
};

// CLI Build Configuration
const cliConfig = {
  input: "src/cli/index.ts", // Entry point for the CLI
  output: {
    file: "dist/cli/index.cjs",
    format: "cjs",
    sourcemap: true,
    banner,
    footer,
  },
  
  external: externalDeps, // Do not bundle external dependencies
  plugins,
};

// Export configurations
export default [libraryConfig, cliConfig];
