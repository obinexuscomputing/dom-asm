import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts', // Root entry point
  output: [
    {
      file: 'dist/index.cjs', // CommonJS output
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.js', // ES Module output
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(), // Resolve third-party modules in node_modules
    commonjs(), // Convert CommonJS modules to ES6
    typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript with Rollup
    terser(), // Minify the output
  ],
  external: [
    // List dependencies to exclude from the bundle (e.g., Node.js built-ins or external packages)
    'path',
    'fs',
  ],
};
