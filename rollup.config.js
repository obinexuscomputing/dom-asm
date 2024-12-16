import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es', // ES Module
      sourcemap: true,
      plugins: [terser()], // Minify output
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs', // CommonJS Module
      sourcemap: true,
      plugins: [terser()], // Minify output
    },
  ],
  external: [
    '@obinexuscomputing/css',
    '@obinexuscomputing/html',
    '@obinexuscomputing/js',
    '@obinexuscomputing/xml',
    'fs',
    'path',
    'os',
    'util',
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
    terser(), // Minify output
  ],
};
