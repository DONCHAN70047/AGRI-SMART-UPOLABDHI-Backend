import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: process.env.PORT || 5173,
    
    // ✅ Add this block to allow backend host
    allowedHosts: [
      'localhost',
      'https://agri-smart-upolabdhi-backend-8.onrender.com'
    ],
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173
  }
})
