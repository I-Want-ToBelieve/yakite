import { defineConfig } from 'tsup'
import { $ } from 'execa'

export default defineConfig({
  entry: ['src/bin/yakite-daemon.ts'],
  outDir: 'dist/bin',
  splitting: false,
  sourcemap: true,
  clean: true,
  format: 'esm',
  onSuccess: async () => {
    await $`tsc --emitDeclarationOnly --declaration`
    await $`tsc-alias`
  }
})
