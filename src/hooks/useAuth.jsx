import React from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  
  // Cache para evitar consultas repetidas
  const roleCache = React.useRef(new Map())
  const isMounted = React.useRef(true)
  const authSubscription = React.useRef(null)

  // Inicialização única - SEM dependências que causam loops
  React.useEffect(() => {
    console.log('🔍 [useAuth] useEffect de inicialização executando...')
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 [useAuth] Iniciando autenticação...')
        
        // Buscar usuário atual
        console.log('🔍 [useAuth] Chamando supabase.auth.getUser()...')
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        console.log('🔍 [useAuth] Resposta do getUser:', { user: !!currentUser, error: !!error })
        
        if (!isMounted.current) {
          console.log('🔍 [useAuth] Componente desmontado, abortando...')
          return
        }
        
        if (error) {
          console.error("❌ [useAuth] Erro ao buscar usuário:", error)
        } else if (currentUser) {
          console.log('🔍 [useAuth] Usuário encontrado:', currentUser.email)
          
          // Verificar se o usuário tem senha definida (não é um convite pendente)
          try {
            console.log('🔍 [useAuth] Verificando perfil do usuário...')
            const { data: profileData } = await supabase
              .from('profiles')
              .select('password_set')
              .eq('id', currentUser.id)
              .single()
            
            console.log('🔍 [useAuth] Dados do perfil:', profileData)
            
            // Se não tem perfil ou password_set é false, tratar como convite pendente
            if (!profileData || profileData.password_set === false) {
              console.log('🔍 [useAuth] Usuário sem senha definida, tratando como convite pendente')
              setIsInvitePending(true)
              setIsLoading(false)
              setIsInitialized(true)
              return
            }
          } catch (profileError) {
            console.log('🔍 [useAuth] Erro ao verificar perfil, tratando como convite pendente:', profileError)
            setIsInvitePending(true)
            setIsLoading(false)
            setIsInitialized(true)
            return
          }
          
          console.log('🔍 [useAuth] Definindo usuário e buscando role...')
          setUser(currentUser)
          // Buscar role apenas se houver usuário
          await fetchUserRole(currentUser)
        } else {
          console.log('🔍 [useAuth] Nenhum usuário encontrado')
        }
      } catch (err) {
        console.error("❌ [useAuth] Erro na inicialização:", err)
      } finally {
        if (isMounted.current) {
          console.log('🔍 [useAuth] Finalizando inicialização, definindo estados...')
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    // Configurar listener de mudança de auth
    console.log('🔍 [useAuth] Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return
      
      console.log('🔍 [useAuth] Evento de auth:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar novamente se não é um convite pendente
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('password_set')
            .eq('id', session.user.id)
            .single()
          
          if (!profileData || profileData.password_set === false) {
            console.log('🔍 [useAuth] Usuário convidado detectado, marcando como pendente')
            setIsInvitePending(true)
            setUser(null)
            setRole(null)
            return
          }
        } catch (profileError) {
          console.log('🔍 [useAuth] Erro ao verificar perfil, marcando como convite pendente')
          setIsInvitePending(true)
          setUser(null)
          setRole(null)
          return
        }
        
        setUser(session.user)
        setIsInvitePending(false)
        await fetchUserRole(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setRole(null)
        setIsInvitePending(false)
        roleCache.current.clear()
      }
      
      setIsLoading(false)
    })

    authSubscription.current = subscription

    return () => {
      console.log('🔍 [useAuth] Cleanup do useEffect...')
      isMounted.current = false
      if (authSubscription.current) {
        authSubscription.current.unsubscribe()
      }
    }
  }, []) // SEM dependências para evitar loops

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
      currentPath: window.location.pathname
    })
    
    // Só redirecionar se estiver inicializado, logado e não for convite pendente
    if (isInitialized && user && role && !isLoading && !isInvitePending) {
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/login') {
        console.log("🚀 [useAuth] Redirecionando para dashboard...")
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isInitialized, user, role, isLoading, isInvitePending, navigate])

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
      
      return data
    } catch (err) {
      console.error("❌ [useAuth] Exceção no login:", err)
      throw err
    }
  }, [])

  const signOut = React.useCallback(async () => {
    try {
      console.log('🔐 [useAuth] Iniciando logout...')
      
      await supabase.auth.signOut()
      setUser(null)
      setRole(null)
      setIsInvitePending(false)
      roleCache.current.clear()
      
      console.log('✅ [useAuth] Logout realizado com sucesso')
    } catch (err) {
      console.error("❌ [useAuth] Erro no logout:", err)
    }
  }, [])

  // Memoizar o objeto de retorno para evitar re-renders
  const authValue = React.useMemo(() => ({
    user,
    role,
    isLoading,
    isInvitePending,
    finalizeInvite,
    signIn,
    signOut
  }), [user, role, isLoading, isInvitePending, finalizeInvite, signIn, signOut])

  return authValue
}
