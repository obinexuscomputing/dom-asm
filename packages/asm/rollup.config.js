import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import ts from 'rollup-plugin-ts';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
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
    ],
    plugins: [
      resolve(),
      commonjs(),
      vue(),
      ts({
        tsconfig: './tsconfig.json',
        hook: {
          outputPath(path, kind) {
            // Ensure TypeScript-generated `.d.ts` files are properly output
            if (kind === 'declaration') return path.replace('src/', '');
            return path;
          },
        },
      }),
      terser(),
    ],
    external: ['vue'], 
  },
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
