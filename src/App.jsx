import React, { useCallback, useMemo } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import { useAuth } from './hooks/useAuth.jsx'
import { LogOut } from 'lucide-react'

// Componente NavBar otimizado
const NavBar = React.memo(function NavBar(){
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  
  // Função de logout otimizada
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }, [signOut, navigate])
  
  // Links de navegação memoizados
  const navLinks = useMemo(() => [
    { to: "/form", label: "📝 Formulário", icon: "📝" },
    ...(user ? [{ to: "/dashboard", label: "📊 Dashboard", icon: "📊" }] : []),
    ...(role === 'admin' ? [
      { to: "/config", label: "⚙️ Configurações", icon: "⚙️" },
      { to: "/api", label: "🔌 Painel de API", icon: "🔌" }
    ] : [])
  ], [user, role])
  
  return (
    <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg hover:text-blue-600 transition-colors">
          SisPAC
        </Link>
        
        <nav className="flex gap-3 text-sm">
          {navLinks.map(({ to, label, icon }) => (
            <Link 
              key={to}
              to={to} 
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              {label}
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <button 
              className="btn-secondary flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors" 
              onClick={handleSignOut}
              aria-label="Sair da aplicação"
            >
              <LogOut size={16}/> Sair
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// Componente Protected otimizado
const Protected = React.memo(function Protected({ children }){
  const { user, isLoading } = useAuth()
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500">Verificando autenticação...</div>
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
        <div className="text-gray-500">Verificando permissões...</div>
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
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </main>
    </div>
  )
}
