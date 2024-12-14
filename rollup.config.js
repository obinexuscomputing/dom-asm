import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue'; // Vue plugin for handling `.vue` files
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
  // Main build configuration for JavaScript outputs
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs', // CommonJS output
        format: 'cjs',
        sourcemap: true,
        exports: 'auto', // Ensures default exports are handled correctly in CommonJS
      },
      {
        file: 'dist/index.js', // ES Module output
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js', // UMD output for browser and Node environments
        format: 'umd',
        name: 'MyVueLibrary', // Replace with your library's global UMD name
        sourcemap: true,
        globals: {
          vue: 'Vue',
        },
      },
    ],
    plugins: [
      vue(), // Handle Vue single-file components
      resolve(), // Resolves node_modules imports
      commonjs(), // Converts CommonJS to ES Modules for Rollup
      typescript({ tsconfig: './tsconfig.json' }), // TypeScript support
      terser(), // Minify output for production
    ],
    external: ['vue'], // Mark peer dependencies or externals
  },

  // Configuration for TypeScript declaration files
  {
    input: 'dist/types/index.d.ts', // Adjust based on your `tsconfig.json` declarationDir
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()], // Generate bundled .d.ts file
  },
];
