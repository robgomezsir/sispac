import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      // Redirecionar APIs para o backend
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/form': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    // Garantir que as variáveis de ambiente sejam acessíveis
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://zibuyabpsvgulvigvdtb.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo'),
    'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ')
  }
})
