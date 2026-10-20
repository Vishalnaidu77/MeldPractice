import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  plugins: [react()],
  watch: {
    usePolling: true,
    interval: 300,
    ignored: ['node_modules']
  }
})
