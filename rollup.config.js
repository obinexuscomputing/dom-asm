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
  input: {
    main: 'src/index.ts',
    cli: 'src/cli/index.ts', // CLI entry point (if applicable)
  },
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'es',
      sourcemap: true,
      banner,
      footer,
    },
    {
      dir: 'dist',
      entryFileNames: '[name].cjs',
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
      extensions: ['.js', '.ts', '.json'],
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json', // Ensure TypeScript is configured properly
    }),
    terser(), // Minify all outputs
  ],
};
