import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  define: {
    'process.env.NEXT_PUBLIC_BACKURL': JSON.stringify('http://localhost:8080'),
  },
  test: {
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    environment: 'jsdom',
    env: {
      NEXT_PUBLIC_BACKURL: 'http://localhost:8080',
    },
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
