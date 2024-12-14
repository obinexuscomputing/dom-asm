import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
  // JavaScript Outputs
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyVueLibrary', 
        sourcemap: true,
        globals: { vue: 'Vue' },
      },
    ],
    plugins: [
      vue(), // Vue single-file components
      resolve(), // Resolve imports
      commonjs(), // Handle CommonJS modules
      typescript({ tsconfig: './tsconfig.json' }), // TypeScript
      terser(), // Minify for production
    ],
    external: ['vue'], // Externalize dependencies
  },

  // TypeScript Declarations
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
