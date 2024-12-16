import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';import { terser } from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser()], // Minify ES Module
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      plugins: [terser()], // Minify CommonJS Module
    },
  ],
  external: [
    '@obinexuscomputing/css',
    '@obinexuscomputing/html',
    '@obinexuscomputing/js',
    '@obinexuscomputing/xml',
    'fs',
    'path',
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.ts', '.json'],
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    terser(), // Add terser plugin
  ],
};
