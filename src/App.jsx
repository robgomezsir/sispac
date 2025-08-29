import React from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import { useAuth } from './hooks/useAuth.jsx'
import { LogOut } from 'lucide-react'

function NavBar(){
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  
  console.log("🔍 [NavBar] Estado da autenticação:", { 
    user: user?.email, 
    role, 
    userId: user?.id,
    isAuthenticated: !!user 
  })
  
  return (
    <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold">SisPAC</Link>
        <nav className="flex gap-3 text-sm">
          <Link to="/form">Formulário</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {role==='admin' && <Link to="/config">Configurações</Link>}
          {role==='admin' && <Link to="/api">Painel de API</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <button className="btn-secondary flex items-center gap-2" onClick={()=>{signOut(); navigate('/')}}>
              <LogOut size={16}/> Sair
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Protected({ children }){
  const { user } = useAuth()
  console.log("🔒 [Protected] Verificando acesso:", { 
    user: user?.email, 
    isAuthenticated: !!user,
    redirecting: !user 
  })
  
  if(!user) {
    console.log("❌ [Protected] Usuário não autenticado, redirecionando para /")
    return <Navigate to="/" replace />
  }
  
  console.log("✅ [Protected] Usuário autenticado, permitindo acesso")
  return children
}

function AdminOnly({ children }){
  const { role, user } = useAuth()
  console.log("👑 [AdminOnly] Verificando acesso admin:", { 
    user: user?.email, 
    role, 
    isAdmin: role === 'admin',
    redirecting: role !== 'admin' 
  })
  
  if(role!=='admin') {
    console.log("❌ [AdminOnly] Usuário não é admin, redirecionando para /")
    return <Navigate to="/" replace />
  }
  
  console.log("✅ [AdminOnly] Usuário é admin, permitindo acesso")
  return children
}

export default function App(){
  return (
    <div className="min-h-screen">
      <NavBar/>
      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/form" element={<Formulario/>}/>
          <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
          <Route path="/config" element={<AdminOnly><Configuracoes/></AdminOnly>}/>
          <Route path="/api" element={<AdminOnly><ApiPanel/></AdminOnly>}/>
          <Route path="*" element={<Navigate to="/" replace />}/>
        </Routes>
      </div>
    </div>
  )
}
