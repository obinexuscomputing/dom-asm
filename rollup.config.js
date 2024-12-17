const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const { terser } = require("@rollup/plugin-terser");
const copy = require("rollup-plugin-copy");
const pkg = require("./package.json");

// Detect production mode
const production = process.env.NODE_ENV === "production";

// Banner and footer for metadata
const banner = `/*!
 * @obinexuscomputing/dom-asm v${pkg.version}
 * (c) ${new Date().getFullYear()} OBINexus Computing
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
const basePlugins = [
  typescript({
    tsconfig: "./tsconfig.json",
    include: ["src/**/*.ts"],
    exclude: ["**/*.d.ts", "**/*.test.ts"],
  }),
  resolve({
    extensions: [".ts", ".js", ".json"],
  }),
  commonjs(),
  json(),
  production && terser(),
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
  external: externalDeps,
  plugins: [
    ...basePlugins,
    // Copy package.json so dist includes it
    copy({
      targets: [{ src: "package.json", dest: "dist" }],
      hook: "writeBundle",
    }),
  ],
};

// CLI Build Configuration
const cliConfig = {
  input: "src/cli/index.ts", // Entry point for the CLI
  output: {
    file: "dist/cli/index.js", // Output in CommonJS format
    format: "cjs",
    sourcemap: true,
    banner,
    footer,
  },
  external: externalDeps,
  plugins: basePlugins,
};

module.exports = [libraryConfig, cliConfig];
