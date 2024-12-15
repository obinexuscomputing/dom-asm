import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

// A helper function to create configurations dynamically
function createConfig({ input, outputDir, umdName }) {
  return [
    {
      // Main JavaScript build
      input,
      output: [
        {
          file: `${outputDir}/index.cjs`,
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
        },
        {
          file: `${outputDir}/index.js`,
          format: 'esm',
          sourcemap: true,
        },
        {
          file: `${outputDir}/index.umd.js`,
          format: 'umd',
          name: umdName,
          sourcemap: true,
        },
      ],
      plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        terser(), // Minify for production
      ],
      external: [], // Add external dependencies here if needed
    },
    {
      // TypeScript declaration file build
      input,
      output: {
        file: `${outputDir}/index.d.ts`,
        format: 'es',
      },
      plugins: [dts()],
    },
  ];
}

// Export configurations for HTML, CSS, and JS
export default [
  ...createConfig({
    input: 'src/index.ts', // Entry point for the HTML package
    outputDir: 'dist/html', // Output directory for HTML package
    umdName: 'DOMHTML', // Global UMD name for the HTML package
  }),
  ...createConfig({
    input: 'src/index.ts', // Entry point for the CSS package
    outputDir: 'dist/css', // Output directory for CSS package
    umdName: 'DOMCSS', // Global UMD name for the CSS package
  }),
  ...createConfig({
    input: 'src/index.ts', // Entry point for the JS package
    outputDir: 'dist/js', // Output directory for JS package
    umdName: 'DOMJS', // Global UMD name for the JS package
  }),
];
