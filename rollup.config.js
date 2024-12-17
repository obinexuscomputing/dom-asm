import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from '@rollup/plugin-terser';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';

const banner = `/*!
 * @obinexuscomputing/dom-asm ${pkg.version}
 * (c) ${new Date().getFullYear()} Obinexus Computing
 * Released under the ISC License
 */`;

const footer = `/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */`;

export default [
  // Main Library Build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
        banner,
        footer,
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        banner,
        footer,
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
        extensions: ['.js', '.ts', '.json', '.mjs'],
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      production && terser(), // Minify in production
    ],
  },

  // CLI Build
  {
    input: 'src/cli/index.ts',
    output: {
      file: 'dist/cli/index.js',
      format: 'cjs',
      sourcemap: true,
      banner,
      footer,
    },
    external: ['commander', 'fs', 'path'],
    plugins: [
      resolve({
        extensions: ['.js', '.ts', '.json', '.mjs'],
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      production && terser(), // Minify in production
    ],
  },
];
