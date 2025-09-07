import React, { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Protected } from './components/Protected.jsx'
import { AdminOnly } from './components/AdminOnly.jsx'
import { LayoutWithSidebar } from './components/LayoutWithSidebar.jsx'
import { SidebarProvider } from './contexts/SidebarContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
import Home from './pages/Home.jsx'
import Formulario from './pages/Formulario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import ApiPanel from './pages/ApiPanel.jsx'
import IntegracaoGupy from './pages/IntegracaoGupy.jsx'
import AuthDebug from './components/AuthDebug.jsx'
import RequestPasswordReset from './pages/RequestPasswordReset.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import PastelDemo from './pages/PastelDemo.jsx'

// Componente App principal otimizado
export default function App(){
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
      element: <Protected><Configuracoes /></Protected> 
    },
    { 
      path: "/api", 
      element: <AdminOnly><ApiPanel /></AdminOnly> 
    },
    { 
      path: "/integracao-gupy", 
      element: <AdminOnly><IntegracaoGupy /></AdminOnly> 
    },
    { 
      path: "/debug", 
      element: <AuthDebug /> 
    },
    { 
      path: "/pastel-demo", 
      element: <PastelDemo /> 
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
  ], [])
  
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
          <Routes>
          {routes.map(({ path, element }) => {
            // Não mostrar sidebar em páginas públicas (Home, Formulário, Auth)
            const publicPages = ["/", "/form", "/request-reset", "/reset-password", "/auth/confirm", "/invite-callback", "/welcome", "/join", "/setup-password", "/complete-invite", "/debug"]
            if (publicPages.includes(path)) {
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
                  <LayoutWithSidebar>
                    {element}
                  </LayoutWithSidebar>
                } 
              />
            )
          })}
          </Routes>
          <PWAInstallPrompt />
          <OfflineIndicator />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
