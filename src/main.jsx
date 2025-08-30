import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { devLog, isDevelopment } from './config/development.js'
import './styles.css'

// Configuração de desenvolvimento
if (isDevelopment()) {
  devLog('🚀 [main] Iniciando aplicação em modo DESENVOLVIMENTO...')
  devLog('🔧 [main] Variáveis de ambiente:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV
  })
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  if (isDevelopment()) {
    devLog('🚀 [main] Root criado com sucesso')
  }
  
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  )
  
  if (isDevelopment()) {
    devLog('🚀 [main] Aplicação renderizada com sucesso')
    devLog('🔧 [main] Servidor rodando em: http://localhost:5173')
  }
} catch (error) {
  console.error('❌ [main] Erro ao renderizar aplicação:', error)
  if (isDevelopment()) {
    devLog('❌ [main] Erro detalhado:', error)
  }
  
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>Erro ao carregar a aplicação</h1>
      <p>${error.message}</p>
      <button onclick="location.reload()">Recarregar</button>
      ${isDevelopment() ? `<br><small>Modo desenvolvimento ativo</small>` : ''}
    </div>
  `
}
