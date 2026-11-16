import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/*.log']
    },
    hmr: {
      clientPort: 80,
      protocol: 'ws'
    }
  },
  plugins: [react()],
})
