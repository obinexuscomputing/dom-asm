import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es', // ES Module
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs', // CommonJS Module
      sourcemap: true,
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
  ],
};
