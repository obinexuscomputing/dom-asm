import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";

// Determine production mode for minification
const production = process.env.NODE_ENV === "production";

export default [
  // **Main Build Configuration for JavaScript**
  {
    input: "src/index.ts", // Entry point
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
      {
        file: "dist/index.umd.js", // UMD output for browsers
        format: "umd",
        name: "DOMXML", // Global name for UMD
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        extensions: [".js", ".ts"], // Support resolving .ts files
      }),
      commonjs(), // Convert CommonJS to ES Modules
      typescript({
        tsconfig: "./tsconfig.json", // Use project-specific TypeScript configuration
      }),
      production && terser(), // Minify in production mode
    ],
    external: ["fs", "path"], // Exclude built-in Node.js modules
  },

  // **TypeScript Declarations Build**
  {
    input: "src/index.ts", // Input must point to the TypeScript source
    output: {
      file: "dist/index.d.ts", // Single declaration file output
      format: "es",
    },
    plugins: [dts()],
  },
];
