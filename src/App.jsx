import React, { useCallback, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import { Navigation } from './components/Navigation.jsx'
import { useAuth } from './hooks/useAuth.jsx'

// Componente Protected otimizado
const Protected = React.memo(function Protected({ children }){
  const { user, isLoading } = useAuth()
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Verificando autenticação...</div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return children
})

// Componente AdminOnly otimizado
const AdminOnly = React.memo(function AdminOnly({ children }){
  const { role, isLoading } = useAuth()
  
  // Mostrar loading enquanto verifica role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Verificando permissões...</div>
      </div>
    )
  }
  
  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
})

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
