import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // In production/Vercel: API routes in api/ folder are served automatically on the same domain
  // No proxy needed - relative URLs like /api/create-conversation work directly
  // In development: Proxy API calls to Express server
  const apiUrl = process.env.VITE_API_URL || (mode === 'development' ? 'http://localhost:3000' : undefined)
  
  const proxyConfig = mode === 'development' && apiUrl ? {
    '/api': {
      target: apiUrl,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path, // Don't rewrite the path, keep /api prefix
    },
  } : undefined

  return {
    plugins: [react()],
    server: {
      proxy: proxyConfig,
      port: 5173,
    },
  }
})
