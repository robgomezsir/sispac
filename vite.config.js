import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173,
    host: true, // Permite acesso externo
    open: true  // Abre o navegador automaticamente
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Configurações para produção
    minify: 'esbuild',
    target: 'es2015'
  },
  define: {
    global: 'globalThis'
  },
  // Configurações de desenvolvimento
  mode: process.env.NODE_ENV || 'development',
  // Variáveis de ambiente para desenvolvimento
  envPrefix: 'VITE_',
  // Configurações de debug
  logLevel: 'info',
  clearScreen: false,
  // Configurações de assets
  assetsInclude: ['**/*.ico', '**/*.png', '**/*.svg'],
  // Configurações de favicon
  publicDir: 'public',
  // Configurações para SPA
  base: '/',
  // Configurações de preview
  preview: {
    port: 4173,
    host: true
  }
})
