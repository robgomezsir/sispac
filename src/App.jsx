import React, { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Protected } from './components/Protected.jsx'
import { AdminOnly } from './components/AdminOnly.jsx'
import { Navigation } from './components/Navigation.jsx'
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
      <Navigation />
      <main className="container mx-auto px-6 py-6">
        <Routes>
          {routes.map(({ path, element }) => {
            console.log(`🔍 [App] Renderizando rota: ${path}`, { 
              elementType: element?.type?.name,
              isAdminRoute: path === '/config' || path === '/api',
              hasChildren: !!element?.props?.children,
              childType: element?.props?.children?.type?.name,
              elementProps: element?.props,
              elementKey: element?.key,
              elementToString: element?.toString(),
              elementDisplayName: element?.type?.displayName,
              elementConstructor: element?.type?.constructor?.name,
              elementRender: element?.type?.render,
              elementMemo: element?.type?.$$typeof,
              elementIsMemo: element?.type?.$$typeof === Symbol.for('react.memo'),
              elementTypeOf: typeof element,
              elementKeys: Object.keys(element || {}),
              elementPropsKeys: Object.keys(element?.props || {}),
              elementChildrenType: typeof element?.props?.children,
              elementChildrenKeys: Object.keys(element?.props?.children || {})
            })
            return (
              <Route key={path} path={path} element={element} />
            )
          })}
        </Routes>
      </main>
    </div>
  )
}
