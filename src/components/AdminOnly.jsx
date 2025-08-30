import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

// Componente AdminOnly otimizado
export const AdminOnly = React.memo(function AdminOnly({ children }){
  const { role, isLoading } = useAuth()
  
  // Debug: logar o estado atual
  console.log('🔍 [AdminOnly] Estado atual:', { role, isLoading, isAdmin: role === 'admin' })
  
  // Mostrar loading enquanto verifica role
  if (isLoading) {
    console.log('🔍 [AdminOnly] Mostrando loading...')
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <div className="text-muted-foreground">Verificando permissões...</div>
        </div>
      </div>
    )
  }
  
  if (role !== 'admin') {
    console.log('🔍 [AdminOnly] Role não é admin, redirecionando...')
    return <Navigate to="/" replace />
  }
  
  console.log('🔍 [AdminOnly] Role é admin, renderizando conteúdo...')
  return children
})
