import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

// Detect production mode
const production = process.env.NODE_ENV === "production";

// Banner and footer
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

const plugins = [
  typescript({
    tsconfig: "./tsconfig.json", // Process TypeScript before anything else
    exclude: ["**/*.d.ts", "**/*.test.ts"],
  }),
  resolve({ extensions: [".ts", ".js", ".json"] }),
  commonjs(),
  json(),
  production && terser(),
];

// Main Library Configuration
const libraryConfig = {
  input: "src/index.ts",
  output: [
    { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "auto", banner, footer },
    { file: "dist/index.js", format: "esm", sourcemap: true, banner, footer },
  ],
  external: externalDeps,
  plugins,
};

// CLI Configuration
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
  plugins,
};

// Export configs
export default [libraryConfig, cliConfig];
