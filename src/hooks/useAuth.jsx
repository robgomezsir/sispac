import React from 'react'
import { supabase, clearInvalidTokens, checkSupabaseHealth } from '../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import { clearAuthCache, checkCacheHealth } from '../lib/cache-cleaner.js'

const Ctx = React.createContext(null)

export function AuthProvider({ children }){
  const auth = useProvideAuth()
  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>
}

export function useAuth(){
  const ctx = React.useContext(Ctx)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}

function useProvideAuth(){
  const [user, setUser] = React.useState(null)
  const [role, setRole] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [isInvitePending, setIsInvitePending] = React.useState(false)
  const [authError, setAuthError] = React.useState(null)
  const [needsPasswordReset, setNeedsPasswordReset] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Cache para evitar consultas repetidas
  const roleCache = React.useRef(new Map())
  const isMounted = React.useRef(true)
  const authSubscription = React.useRef(null)
  const hasRedirected = React.useRef(false)
  const retryCount = React.useRef(0)
  const maxRetries = 3

  // Função para verificar se o usuário precisa redefinir a senha
  const checkPasswordResetNeeded = React.useCallback(async (user) => {
    try {
      // Verificar se o usuário foi criado recentemente (últimos 5 minutos)
      const userCreatedAt = new Date(user.created_at)
      const now = new Date()
      const timeDiff = now - userCreatedAt
      const fiveMinutes = 5 * 60 * 1000 // 5 minutos em millisegundos
      
      // Se o usuário foi criado recentemente, provavelmente tem senha temporária
      if (timeDiff < fiveMinutes) {
        console.log('🔍 [useAuth] Usuário criado recentemente, pode precisar redefinir senha')
        return true
      }
      
      // Verificar se o usuário tem metadata indicando senha temporária
      if (user.user_metadata?.temporary_password === true) {
        console.log('🔍 [useAuth] Usuário tem metadata de senha temporária')
        return true
      }
      
      // Verificar se o usuário nunca fez login (último login é igual à criação)
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      if (lastSignIn && Math.abs(lastSignIn - userCreatedAt) < 60000) { // 1 minuto de diferença
        console.log('🔍 [useAuth] Usuário nunca fez login real, precisa redefinir senha')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ [useAuth] Erro ao verificar necessidade de redefinição de senha:', error)
      return false
    }
  }, [])

  // Verificar saúde dos caches na inicialização
  React.useEffect(() => {
    const cacheHealth = checkCacheHealth()
    
    if (!cacheHealth.healthy) {
      clearAuthCache()
    }
  }, [])

  // Verificar saúde da conexão Supabase (simplificado)
  React.useEffect(() => {
    // Verificação simplificada para evitar travamento
    const checkConnection = async () => {
      try {
        // Teste simples de conectividade com timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (error) {
          console.warn('⚠️ [useAuth] Aviso de conectividade:', error.message)
        }
      } catch (error) {
        console.warn('⚠️ [useAuth] Aviso de conectividade:', error.message)
      }
    }
    
    checkConnection()
  }, [])

  // Inicialização única - SEM dependências que causam loops
  React.useEffect(() => {
    // Timeout de segurança para garantir que isLoading seja definido como false
    const timeoutId = setTimeout(() => {
      if (isMounted.current && isLoading) {
        console.warn('⚠️ [useAuth] Timeout de inicialização, definindo isLoading como false')
        setIsLoading(false)
        setIsInitialized(true)
      }
    }, 5000) // 5 segundos de timeout (reduzido)
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 [useAuth] Iniciando autenticação...')
        
        // Limpar tokens inválidos antes de começar
        await clearInvalidTokens()
        
        // Buscar usuário atual com timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na autenticação')), 5000)
        )
        
        const authPromise = supabase.auth.getUser()
        const { data: { user: currentUser }, error } = await Promise.race([authPromise, timeoutPromise])
        
        if (!isMounted.current) {
          return
        }
        
        if (error) {
          console.error("❌ [useAuth] Erro ao buscar usuário:", error)
          
          // Tratar erros específicos
          if (error.message.includes('token') || error.message.includes('expired') || error.message.includes('invalid')) {
            console.log('🔍 [useAuth] Token inválido/expirado detectado, limpando cache...')
            clearAuthCache()
            setAuthError('Sessão expirada. Faça login novamente.')
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            console.log('🔍 [useAuth] Erro de rede detectado...')
            setAuthError('Erro de conexão. Verifique sua internet.')
          } else {
            setAuthError('Erro de autenticação. Tente novamente.')
          }
          
          // Não tentar novamente automaticamente para evitar loops
          console.log('🔍 [useAuth] Finalizando inicialização com erro')
        } else if (currentUser) {
          console.log('🔍 [useAuth] Usuário encontrado:', currentUser.email)
          
          // Verificar se é o usuário admin principal primeiro
          if (currentUser.email === 'robgomez.sir@gmail.com') {
            console.log('🔍 [useAuth] Usuário admin principal detectado')
            const adminRole = 'admin'
            roleCache.current.set(currentUser.id, adminRole)
            setRole(adminRole)
            setUser(currentUser)
            setAuthError(null)
            return
          }

          // Verificar se o usuário precisa redefinir a senha
          const needsReset = await checkPasswordResetNeeded(currentUser)
          if (needsReset && location.pathname !== '/reset-password') {
            console.log('🔍 [useAuth] Usuário precisa redefinir senha, redirecionando...')
            setNeedsPasswordReset(true)
            navigate('/reset-password', { replace: true })
            return
          }
          
          // Verificar se o usuário tem perfil na tabela profiles
          try {
            console.log('🔍 [useAuth] Verificando perfil do usuário...')
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, role')
              .eq('id', currentUser.id)
              .single()
            
            console.log('🔍 [useAuth] Dados do perfil:', profileData)
            
            if (profileError) {
              if (profileError.code === 'PGRST116') {
                // Perfil não existe, criar padrão
                console.log('🔍 [useAuth] Perfil não existe, criando padrão...')
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: currentUser.id,
                    email: currentUser.email,
                    role: 'rh'
                  })
                
                if (insertError) {
                  console.error("❌ [useAuth] Erro ao criar perfil:", insertError.message)
                  // Continuar mesmo com erro na criação do perfil
                }
                
                // Definir role padrão
                const defaultRole = 'rh'
                roleCache.current.set(currentUser.id, defaultRole)
                setRole(defaultRole)
              } else {
                console.error("❌ [useAuth] Erro ao buscar perfil:", profileError.message)
                // Em caso de erro, usar role padrão
                const fallbackRole = 'rh'
                roleCache.current.set(currentUser.id, fallbackRole)
                setRole(fallbackRole)
              }
            } else {
              // Perfil existe, usar role do banco
              const userRole = profileData?.role || 'rh'
              roleCache.current.set(currentUser.id, userRole)
              setRole(userRole)
            }
            
            // Definir usuário após verificar perfil
            setUser(currentUser)
            setAuthError(null) // Limpar erro se tudo funcionou
            
          } catch (profileError) {
            console.log('🔍 [useAuth] Erro ao verificar perfil, usando configuração padrão:', profileError)
            // Em caso de erro, usar configuração padrão
            const defaultRole = 'rh'
            roleCache.current.set(currentUser.id, defaultRole)
            setRole(defaultRole)
            setUser(currentUser)
          }
        } else {
          console.log('🔍 [useAuth] Nenhum usuário encontrado')
          setAuthError(null) // Limpar erro quando não há usuário (estado normal)
        }
      } catch (err) {
        console.error("❌ [useAuth] Erro na inicialização:", err)
        setAuthError('Erro inesperado na inicialização')
      } finally {
        if (isMounted.current) {
          clearTimeout(timeoutId) // Limpar timeout se a inicialização completar
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()
    
    // Cleanup do timeout
    return () => {
      clearTimeout(timeoutId)
    }

    // Configurar listener de mudança de auth
    console.log('🔍 [useAuth] Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return
      
      console.log('🔍 [useAuth] Evento de auth:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar se é o usuário admin principal primeiro
        if (session.user.email === 'robgomez.sir@gmail.com') {
          console.log('🔍 [useAuth] Usuário admin principal logado')
          const adminRole = 'admin'
          roleCache.current.set(session.user.id, adminRole)
          setRole(adminRole)
          setUser(session.user)
          setAuthError(null)
          return
        }

        // Verificar se o usuário precisa redefinir a senha
        const needsReset = await checkPasswordResetNeeded(session.user)
        if (needsReset && location.pathname !== '/reset-password') {
          console.log('🔍 [useAuth] Usuário precisa redefinir senha após login, redirecionando...')
          setNeedsPasswordReset(true)
          navigate('/reset-password', { replace: true })
          return
        }
        
        // Verificar perfil do usuário logado
        try {
          console.log('🔍 [useAuth] Verificando perfil do usuário logado...')
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single()
          
          if (profileError && profileError.code === 'PGRST116') {
            // Perfil não existe, criar padrão
            console.log('🔍 [useAuth] Perfil não existe, criando padrão...')
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                role: 'rh'
              })
            
            if (insertError) {
              console.error("❌ [useAuth] Erro ao criar perfil:", insertError.message)
            }
          }
          
          // Atualizar estado
          setUser(session.user)
          setAuthError(null)
          
          // Definir role
          if (profileData?.role) {
            roleCache.current.set(session.user.id, profileData.role)
            setRole(profileData.role)
          } else {
            const defaultRole = 'rh'
            roleCache.current.set(session.user.id, defaultRole)
            setRole(defaultRole)
          }
          
        } catch (error) {
          console.error("❌ [useAuth] Erro ao verificar perfil após login:", error)
          // Usar role padrão em caso de erro
          const defaultRole = 'rh'
          roleCache.current.set(session.user.id, defaultRole)
          setRole(defaultRole)
          setUser(session.user)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔍 [useAuth] Usuário deslogado, limpando estado...')
        setUser(null)
        setRole(null)
        setAuthError(null)
        setNeedsPasswordReset(false)
        roleCache.current.clear()
        
        // Limpar cache de autenticação
        clearAuthCache()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔍 [useAuth] Token atualizado com sucesso')
        setAuthError(null)
      } else if (event === 'USER_UPDATED') {
        console.log('🔍 [useAuth] Usuário atualizado:', session?.user?.email)
        if (session?.user) {
          setUser(session.user)
        }
      }
    })
    
    authSubscription.current = subscription

    // Cleanup
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe()
      }
    }
  }, [])

  // Função para finalizar convite e permitir login normal
  const finalizeInvite = React.useCallback(async (userData, accessToken, refreshToken) => {
    try {
      console.log('🔍 [useAuth] Finalizando convite para:', userData.email)
      
      // Define a sessão com os tokens do convite
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        throw sessionError
      }

      // Marca o convite como finalizado
      setIsInvitePending(false)
      
      // Define o usuário e busca o role
      setUser(userData)
      await fetchUserRole(userData)
      
      console.log('✅ [useAuth] Convite finalizado com sucesso')
      
      return { success: true }
    } catch (error) {
      console.error('❌ [useAuth] Erro ao finalizar convite:', error)
      return { success: false, error }
    }
  }, [])

  // Função otimizada para buscar role
  const fetchUserRole = React.useCallback(async (userData) => {
    if (!userData?.id) return

    // Verificar cache primeiro
    if (roleCache.current.has(userData.id)) {
      const cachedRole = roleCache.current.get(userData.id)
      if (isMounted.current) {
        setRole(cachedRole)
      }
      return
    }

    // Verificar se é o usuário admin principal
    if (userData.email === 'robgomez.sir@gmail.com') {
      const adminRole = 'admin'
      roleCache.current.set(userData.id, adminRole)
      if (isMounted.current) {
        setRole(adminRole)
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.id)
        .single()
      
      if (!isMounted.current) return
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não existe, criar padrão
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userData.id,
              email: userData.email,
              role: 'rh'
            })
          
          if (!isMounted.current) return
          
          if (insertError) {
            console.error("❌ [useAuth] Erro ao criar perfil:", insertError.message)
          }
          const defaultRole = 'rh'
          roleCache.current.set(userData.id, defaultRole)
          setRole(defaultRole)
        } else {
          console.error("❌ [useAuth] Erro ao buscar role:", error.message)
          const fallbackRole = 'rh'
          roleCache.current.set(userData.id, fallbackRole)
          setRole(fallbackRole)
        }
      } else {
        const userRole = data?.role || 'rh'
        roleCache.current.set(userData.id, userRole)
        setRole(userRole)
      }
    } catch (err) {
      if (!isMounted.current) return
      console.error("❌ [useAuth] Falha ao buscar role:", err)
      const errorRole = 'rh'
      roleCache.current.set(userData.id, errorRole)
      setRole(errorRole)
    }
  }, [])

  // Redirecionamento otimizado - SEM dependências circulares
  React.useEffect(() => {
    console.log('🔍 [useAuth] Verificando redirecionamento:', { 
      isInitialized, 
      user: !!user, 
      role: !!role, 
      isLoading, 
      isInvitePending,
      hasRedirected: hasRedirected.current,
      currentPath: location.pathname
    })
    
    // Só redirecionar se estiver inicializado, logado, não for convite pendente e ainda não redirecionou
    if (isInitialized && user && role && !isLoading && !isInvitePending && !hasRedirected.current) {
      const currentPath = location.pathname
      
      // Rotas públicas que não devem ser redirecionadas automaticamente
      const publicRoutes = [
        '/login',
        '/form',
        '/debug',
        '/request-reset',
        '/reset-password',
        '/auth/confirm',
        '/invite-callback',
        '/welcome',
        '/join',
        '/setup-password',
        '/complete-invite'
      ]
      
      // Redirecionar se for a página inicial ou se não for uma rota pública
      if (currentPath === '/' || !publicRoutes.includes(currentPath)) {
        console.log("🚀 [useAuth] Redirecionando para dashboard...")
        hasRedirected.current = true
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isInitialized, user, role, isLoading, isInvitePending, navigate, location.pathname])

  const signIn = React.useCallback(async (email, password) => {
    try {
      console.log('🔐 [useAuth] Iniciando login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("❌ [useAuth] Erro no login:", error.message)
        throw error
      }
      
      console.log('✅ [useAuth] Login bem-sucedido para:', email)
      
      // Limpar cache ao fazer novo login
      roleCache.current.clear()
      hasRedirected.current = false
      
      return data
    } catch (err) {
      console.error("❌ [useAuth] Exceção no login:", err)
      throw err
    }
  }, [])

  // Função para fazer logout
  const signOut = async () => {
    try {
      console.log('🔍 [useAuth] Fazendo logout...')
      await supabase.auth.signOut()
      
      // Limpar estado local
      setUser(null)
      setRole(null)
      setAuthError(null)
      roleCache.current.clear()
      
      // Limpar cache
      clearAuthCache()
      
      // Redirecionar para home
      navigate('/')
      
      console.log('✅ [useAuth] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [useAuth] Erro ao fazer logout:', error)
      setAuthError('Erro ao fazer logout')
    }
  }

  // Função para limpar erro
  const clearError = () => {
    setAuthError(null)
  }

  // Função para tentar reconectar
  const retryConnection = async () => {
    retryCount.current = 0
    setAuthError(null)
    setIsLoading(true)
    setIsInitialized(false)
    
    // Aguardar um pouco antes de tentar novamente
    setTimeout(() => {
      if (isMounted.current) {
        window.location.reload()
      }
    }, 1000)
  }

  // Memoizar o objeto de retorno para evitar re-renders
  const authValue = React.useMemo(() => ({
    user,
    role,
    isLoading,
    isInvitePending,
    needsPasswordReset,
    finalizeInvite,
    signIn,
    signOut,
    clearCache: clearAuthCache, // Manter a chamada para compatibilidade
    authError,
    clearError,
    retryConnection
  }), [user, role, isLoading, isInvitePending, needsPasswordReset, finalizeInvite, signIn, signOut, authError, clearError, retryConnection])

  return authValue
}
