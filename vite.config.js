// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // THIS LINE FIXES EVERYTHING
      "config": path.resolve(__dirname, "src/config-shim.js"),   // ← MUST BE THIS PATH
    },
  },

  optimizeDeps: {
    include: ['@apollo/client', '@apollo/client/react', '@apollo/client/core'],
  },

  server: {
    port: 8887,
    host: true,
  },

  define: {
    'process.env': JSON.stringify(import.meta.env),
    global: 'globalThis',
  },
})