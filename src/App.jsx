import React, { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Protected } from './components/Protected.jsx'
import { AdminOnly } from './components/AdminOnly.jsx'
import { ModernSidebar } from './components/ModernSidebar.jsx'
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import AuthDebug from './components/AuthDebug.jsx'
import RequestPasswordReset from './pages/RequestPasswordReset.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AuthCallback from './pages/AuthCallback.jsx'

// Componente App principal otimizado
export default function App(){
  console.log('🚀 [App] Componente App renderizando...')
  
  // Rotas memoizadas para evitar re-criação
  const routes = useMemo(() => {
    const routeList = [
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
        path: "/request-reset", 
        element: <RequestPasswordReset /> 
      },
      { 
        path: "/reset-password", 
        element: <ResetPassword /> 
      },
      { 
        path: "/auth/confirm", 
        element: <AuthCallback /> 
      },
      { 
        path: "/invite-callback", 
        element: <AuthCallback /> 
      },
      { 
        path: "/welcome", 
        element: <AuthCallback /> 
      },
      { 
        path: "/join", 
        element: <AuthCallback /> 
      },
      { 
        path: "/setup-password", 
        element: <AuthCallback /> 
      },
      { 
        path: "/complete-invite", 
        element: <AuthCallback /> 
      },
      { 
        path: "*", 
        element: <Navigate to="/" replace /> 
      }
    ]
    
    console.log('🔍 [App] Rotas definidas:', routeList.map(r => ({ 
      path: r.path, 
      hasAdminOnly: r.element?.type?.name === 'AdminOnly',
      elementType: r.element?.type?.name,
      isAdminRoute: r.path === '/config' || r.path === '/api'
    })))
    return routeList
  }, [])
  
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {routes.map(({ path, element }) => {
          // Não mostrar sidebar na página Home
          if (path === "/") {
            return (
              <Route key={path} path={path} element={element} />
            )
          }
          
          // Para outras páginas, mostrar com sidebar
          return (
            <Route 
              key={path} 
              path={path} 
              element={
                <div className="flex">
                  <ModernSidebar />
                  <main className="flex-1 ml-80 transition-all duration-300">
                    <div className="container mx-auto px-6 py-6">
                      {element}
                    </div>
                  </main>
                </div>
              } 
            />
          )
        })}
      </Routes>
      <PWAInstallPrompt />
      <OfflineIndicator />
    </div>
  )
}
