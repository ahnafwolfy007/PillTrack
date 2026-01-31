import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    open: false,
    // Proxy API requests through Vite - solves firewall issues!
    // Phone only needs to connect to port 5173, Vite proxies to backend
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',  // Use IPv4 explicitly
        changeOrigin: true,
        secure: false,
        ws: true,  // Enable WebSocket proxying
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url, '-> 127.0.0.1:8081');
          });
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
