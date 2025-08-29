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
  
  return (
    <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold">SisPAC</Link>
        <nav className="flex gap-3 text-sm">
          <Link to="/form" className="hover:text-blue-600 transition-colors">📝 Formulário</Link>
          {user && <Link to="/dashboard" className="hover:text-blue-600 transition-colors">📊 Dashboard</Link>}
          {role==='admin' && <Link to="/config" className="hover:text-blue-600 transition-colors">⚙️ Configurações</Link>}
          {role==='admin' && <Link to="/api" className="hover:text-blue-600 transition-colors">🔌 Painel de API</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <button className="btn-secondary flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={()=>{signOut(); navigate('/')}}>
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
  
  if(!user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AdminOnly({ children }){
  const { role } = useAuth()
  
  if(role!=='admin') {
    return <Navigate to="/" replace />
  }
  
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
