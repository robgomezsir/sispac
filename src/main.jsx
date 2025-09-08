import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { devLog, isDevelopment } from './config/development.js'
import './styles.css'

// Configuração de desenvolvimento
if (isDevelopment()) {
  devLog('🚀 [main] Iniciando aplicação em modo DESENVOLVIMENTO...')
} else {
  console.log('🚀 [main] Iniciando aplicação em modo PRODUÇÃO...')
}

try {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Elemento root não encontrado')
  }
  
  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
  
  if (isDevelopment()) {
    devLog('🚀 [main] Aplicação renderizada com sucesso')
  } else {
    console.log('✅ [main] Aplicação renderizada com sucesso em produção')
  }
} catch (error) {
  console.error('❌ [main] Erro ao renderizar aplicação:', error)
  
  if (isDevelopment()) {
    devLog('❌ [main] Erro detalhado:', error)
  }
  
  // Fallback para erro em produção
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red; font-family: Arial, sans-serif;">
        <h1>Erro ao carregar a aplicação</h1>
        <p>${error.message}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
        ${isDevelopment() ? '<br><small>Modo desenvolvimento ativo</small>' : ''}
      </div>
    `
  }
}
