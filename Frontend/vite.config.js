import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: process.env.PORT || 5173,
    
    // ✅ Add this line:
    allowedHosts: ['https://agri-smart-upolabdhi-backend-4-i6y6.onrender.com/']
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173
  }
})
