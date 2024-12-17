import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
  // Main build configuration for JavaScript
  {
    input: 'src/index.ts', // Entry point for your library
    output: [
      {
        file: 'dist/index.cjs', // CommonJS output
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
      {
        file: 'dist/index.js', // ES Module output
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js', // UMD output for browsers
        format: 'umd',
        name: 'DOMXML', 
     
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(), // Resolves node_modules imports
      commonjs(), // Converts CommonJS modules to ES Modules
      typescript({ tsconfig: './tsconfig.json' }), // TypeScript support
      terser(), // Minifies the output for production
    ],
  },

  // Configuration for TypeScript declarations
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
