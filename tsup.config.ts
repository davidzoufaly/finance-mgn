import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'es2022',
  clean: true,
  sourcemap: true,
  dts: false,
  shims: false,
  splitting: false,
  skipNodeModulesBundle: true,
})
