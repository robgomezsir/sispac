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

  // Inicialização única
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Buscar usuário atual
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (!isMounted.current) return
        
        if (error) {
          console.error("❌ [useAuth] Erro ao buscar usuário:", error)
        } else if (currentUser) {
          // Verificar se o usuário tem senha definida (não é um convite pendente)
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('password_set')
              .eq('id', currentUser.id)
              .single()
            
            // Se não tem perfil ou password_set é false, tratar como convite pendente
            if (!profileData || profileData.password_set === false) {
              console.log('🔍 [useAuth] Usuário sem senha definida, tratando como convite pendente')
              setIsInvitePending(true)
              setIsLoading(false)
              setIsInitialized(true)
              return
            }
          } catch (profileError) {
            console.log('🔍 [useAuth] Erro ao verificar perfil, tratando como convite pendente')
            setIsInvitePending(true)
            setIsLoading(false)
            setIsInitialized(true)
            return
          }
          
          setUser(currentUser)
          // Buscar role apenas se houver usuário
          await fetchUserRole(currentUser)
        }
      } catch (err) {
        console.error("❌ [useAuth] Erro na inicialização:", err)
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    // Configurar listener de mudança de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return
      
      // Não processar eventos de auth se for um convite pendente
      if (isInvitePending) {
        console.log('🔍 [useAuth] Ignorando evento de auth durante convite pendente:', event)
        return
      }
      
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
            return
          }
        } catch (profileError) {
          console.log('🔍 [useAuth] Erro ao verificar perfil, marcando como convite pendente')
          setIsInvitePending(true)
          return
        }
        
        setUser(session.user)
        await fetchUserRole(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setRole(null)
        roleCache.current.clear()
      }
      
      setIsLoading(false)
    })

    authSubscription.current = subscription

    return () => {
      isMounted.current = false
      if (authSubscription.current) {
        authSubscription.current.unsubscribe()
      }
    }
  }, [isInvitePending])

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

  // Redirecionamento otimizado - não redirecionar se for convite pendente
  React.useEffect(() => {
    if (isInitialized && user && role && !isLoading && !isInvitePending) {
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/login') {
        console.log("🚀 [useAuth] Redirecionando para dashboard...")
        // Usar setTimeout para garantir que o estado seja atualizado
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 100)
      }
    }
  }, [user, role, isLoading, isInitialized, isInvitePending, navigate])

  const signIn = React.useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("❌ [useAuth] Erro no login:", error.message)
        throw error
      }
      
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
      await supabase.auth.signOut()
      setUser(null)
      setRole(null)
      setIsInvitePending(false)
      roleCache.current.clear()
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
