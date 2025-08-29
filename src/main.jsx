import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import './styles.css'

console.log('🚀 [main] Iniciando aplicação...')

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  console.log('🚀 [main] Root criado com sucesso')
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
  console.log('🚀 [main] Aplicação renderizada com sucesso')
} catch (error) {
  console.error('❌ [main] Erro ao renderizar aplicação:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>Erro ao carregar a aplicação</h1>
      <p>${error.message}</p>
      <button onclick="location.reload()">Recarregar</button>
    </div>
  `
}
