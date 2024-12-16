import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from '@rollup/plugin-terser';
import pkg from './package.json';

const banner = `/*!
 * @obinexuscomputing/dom-asm ${pkg.version}
 * (c) ${new Date().getFullYear()} Obinexus Computing
 * Released under the ISC License
 */`;

const footer = `/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */`;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser()],
      banner, // Add banner to ES module
      footer, // Add footer to ES module
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      plugins: [terser()],
      banner, // Add banner to CommonJS module
      footer, // Add footer to CommonJS module
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
    terser(), // Global terser plugin for minification
  ],
};
