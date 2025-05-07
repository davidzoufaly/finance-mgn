// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  // main app
  {
    entry: ['./src/index.ts'],
    outDir: './dist/app',
    format: ['esm'],
    target: 'es2022',
    clean: true,
    sourcemap: true,
    dts: false,
    shims: false,
    splitting: false,
    skipNodeModulesBundle: true,
  },
  // integration tests
  {
    entry: ['./src/integrationTests/index.ts'],
    outDir: './dist/tests',
    format: ['esm'],
    target: 'es2022',
    clean: true,
    sourcemap: true,
    dts: false,
    shims: false,
    splitting: false,
    skipNodeModulesBundle: true,
  },
]);
