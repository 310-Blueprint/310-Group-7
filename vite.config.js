import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom', // fake browser, so components can render
    globals: true, // lets Testing Library clean up between tests
    setupFiles: './src/test/setup.js',
  },
})
