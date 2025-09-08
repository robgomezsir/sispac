import React from 'react'
import { supabase, clearInvalidTokens, checkSupabaseHealth, testConnectivity } from '../lib/supabase'
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
      // Verificar se o usuário tem metadata indicando senha temporária
      if (user.user_metadata?.temporary_password === true) {
        console.log('🔍 [useAuth] Usuário tem metadata de senha temporária')
        return true
      }
      
      // Verificar se o usuário foi criado recentemente (últimos 2 minutos) E tem metadata de senha temporária
      const userCreatedAt = new Date(user.created_at)
      const now = new Date()
      const timeDiff = now - userCreatedAt
      const twoMinutes = 2 * 60 * 1000 // 2 minutos em millisegundos
      
      if (timeDiff < twoMinutes && user.user_metadata?.temporary_password === true) {
        console.log('🔍 [useAuth] Usuário criado recentemente com senha temporária')
        return true
      }
      
      // Verificar se o usuário nunca fez login real (último login é igual à criação)
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      if (lastSignIn && Math.abs(lastSignIn - userCreatedAt) < 30000) { // 30 segundos de diferença
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
          
          // Definir usuário imediatamente
          setUser(currentUser)
          setAuthError(null)
          
          // Verificar se é o usuário admin principal
          if (currentUser.email === 'robgomez.sir@gmail.com') {
            console.log('🔍 [useAuth] Usuário admin principal detectado')
            const adminRole = 'admin'
            roleCache.current.set(currentUser.id, adminRole)
            setRole(adminRole)
            
            // Redirecionar imediatamente para admin
            console.log("🚀 [useAuth] Redirecionando admin para dashboard...")
            hasRedirected.current = true
            navigate('/dashboard', { replace: true })
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
        console.log('🔍 [useAuth] Usuário logado:', session.user.email)
        
        // Resetar flag de redirecionamento para permitir novo redirecionamento
        hasRedirected.current = false
        
        // Definir usuário imediatamente
        setUser(session.user)
        setAuthError(null)
        
        // Verificar se é o usuário admin principal
        if (session.user.email === 'robgomez.sir@gmail.com') {
          console.log('🔍 [useAuth] Usuário admin principal logado')
          const adminRole = 'admin'
          roleCache.current.set(session.user.id, adminRole)
          setRole(adminRole)
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
        }
        
        // Redirecionar para dashboard após login bem-sucedido
        console.log("🔍 [useAuth] Verificando redirecionamento...")
        console.log("🔍 [useAuth] location.pathname:", location.pathname)
        console.log("🔍 [useAuth] hasRedirected.current:", hasRedirected.current)
        
        if (location.pathname === '/' && !hasRedirected.current) {
          console.log("🚀 [useAuth] Redirecionando usuário para dashboard...")
          hasRedirected.current = true
          navigate('/dashboard', { replace: true })
        } else if (location.pathname !== '/') {
          console.log("🔍 [useAuth] Usuário já está em uma página diferente da raiz:", location.pathname)
        } else if (hasRedirected.current) {
          console.log("🔍 [useAuth] Redirecionamento já foi executado anteriormente")
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
  }, [navigate, location])

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

  // Redirecionamento simplificado - apenas para usuários já logados na inicialização
  React.useEffect(() => {
    // Apenas redirecionar se usuário já estiver logado na inicialização
    if (isInitialized && user && role && !isLoading && !isInvitePending && location.pathname === '/') {
      console.log("🚀 [useAuth] Redirecionando usuário já logado para dashboard...")
      navigate('/dashboard', { replace: true })
    }
  }, [isInitialized, user, role, isLoading, isInvitePending, navigate, location.pathname])

  const signIn = React.useCallback(async (email, password) => {
    try {
      console.log('🔐 [useAuth] Iniciando login para:', email)
      
      // Testar conectividade antes do login
      const isConnected = await testConnectivity()
      if (!isConnected) {
        throw new Error('Erro de conectividade. Verifique sua conexão com a internet.')
      }
      
      // Para desenvolvimento, criar usuário automaticamente se não existir
      if (email === 'admin@sispac.com' || email === 'rh@sispac.com' || email === 'test@sispac.com' || email === 'robgomez.sir@gmail.com' || email === 'test@example.com' || email === 'hr@sispac.com' || email === 'admin@example.com') {
        console.log('🔧 [useAuth] Tentando criar usuário de teste...')
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: email === 'admin@sispac.com' || email === 'robgomez.sir@gmail.com' || email === 'admin@example.com' ? 'Admin' : email === 'test@example.com' ? 'Test User' : 'RH User',
                role: email === 'admin@sispac.com' || email === 'robgomez.sir@gmail.com' || email === 'admin@example.com' ? 'admin' : 'rh'
              }
            }
          })
          
          if (signUpData.user && !signUpError) {
            console.log('✅ [useAuth] Usuário de teste criado:', email)
            
            // Criar perfil na tabela profiles
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                email: email,
                role: email === 'admin@sispac.com' || email === 'robgomez.sir@gmail.com' || email === 'admin@example.com' ? 'admin' : 'rh',
                name: email === 'admin@sispac.com' || email === 'robgomez.sir@gmail.com' || email === 'admin@example.com' ? 'Admin' : email === 'test@example.com' ? 'Test User' : 'RH User'
              })
            
            if (profileError) {
              console.warn('⚠️ [useAuth] Erro ao criar perfil:', profileError.message)
            }
          }
        } catch (signUpErr) {
          console.log('🔍 [useAuth] Usuário já existe ou erro na criação:', signUpErr.message)
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("❌ [useAuth] Erro no login:", error.message)
        
        // Tratar erros específicos
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.')
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
        } else {
          throw new Error(error.message || 'Erro desconhecido no login.')
        }
      }
      
      console.log('✅ [useAuth] Login bem-sucedido para:', email)
      
      // Limpar cache
      roleCache.current.clear()
      
      return data
    } catch (err) {
      console.error("❌ [useAuth] Exceção no login:", err)
      throw err
    }
  }, [navigate])

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
