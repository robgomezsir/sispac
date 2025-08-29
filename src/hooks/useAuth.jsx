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
      
      if (event === 'SIGNED_IN' && session?.user) {
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

  // Redirecionamento otimizado
  React.useEffect(() => {
    if (isInitialized && user && role && !isLoading) {
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/login') {
        console.log("🚀 [useAuth] Redirecionando para dashboard...")
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, role, isLoading, isInitialized, navigate])

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
      setRole(null)
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
    signIn,
    signOut
  }), [user, role, isLoading, signIn, signOut])

  return authValue
}
