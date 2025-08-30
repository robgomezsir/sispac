import React, { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/ThemeContext.jsx'
import { Protected } from './components/Protected.jsx'
import { AdminOnly } from './components/AdminOnly.jsx'
import Navigation from './components/Navigation.jsx'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import AuthDebug from './components/AuthDebug.jsx'

// Componente App principal otimizado
export default function App(){
  console.log('🚀 [App] Componente App renderizando...')
  
  // Rotas memoizadas para evitar re-criação
  const routes = useMemo(() => [
    { path: "/", element: <Home /> },
    { path: "/form", element: <Formulario /> },
    { 
      path: "/dashboard", 
      element: <Protected><Dashboard /></Protected> 
    },
    { 
      path: "/config", 
      element: <AdminOnly><Configuracoes /></AdminOnly> 
    },
    { 
      path: "/api", 
      element: <AdminOnly><ApiPanel /></AdminOnly> 
    },
    { 
      path: "/debug", 
      element: <AuthDebug /> 
    },
    { 
      path: "*", 
      element: <Navigate to="/" replace /> 
    }
  ], [])
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </main>
    </div>
  )
}
