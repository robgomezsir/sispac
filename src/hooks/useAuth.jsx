import React from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const Ctx = React.createContext(null)

export function AuthProvider({ children }){
  const auth = useProvideAuth()
  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>
}

export function useAuth(){
  const ctx = React.useContext(Ctx) || useProvideAuth()
  return ctx
}

function useProvideAuth(){
  const [user, setUser] = React.useState(null)
  const [role, setRole] = React.useState(null) // 'admin' | 'rh' | null
  const [isLoading, setIsLoading] = React.useState(true)
  const navigate = useNavigate()
  
  // Cache para evitar consultas repetidas
  const roleCache = React.useRef(new Map())

  React.useEffect(()=>{
    let isMounted = true
    
    supabase.auth.getUser().then(({data, error})=>{
      if (!isMounted) return
      if(error) {
        console.error("❌ [useAuth] Erro ao buscar usuário:", error)
      } else {
        setUser(data.user)
      }
      setIsLoading(false)
    })
    
    const { data: sub } = supabase.auth.onAuthStateChange((event, session)=>{
      if (!isMounted) return
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    
    return ()=>{
      isMounted = false
      sub?.subscription.unsubscribe()
    }
  }, [])

  // Buscar role real na tabela profiles com cache
  React.useEffect(()=>{
    let isMounted = true
    
    async function fetchRole(){
      if(!user){ 
        if (isMounted) {
          setRole(null)
        }
        return 
      }
      
      // Verificar cache primeiro
      if (roleCache.current.has(user.id)) {
        if (isMounted) {
          setRole(roleCache.current.get(user.id))
        }
        return
      }
      
      try {
        // Buscar role do usuário diretamente
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!isMounted) return
        
        if(error){
          if(error.code === 'PGRST116') {
            // Tentar criar perfil padrão
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'rh'
              })
            
            if (!isMounted) return
            
            if(insertError) {
              console.error("❌ [useAuth] Erro ao criar perfil:", insertError.message)
            }
            const defaultRole = 'rh'
            roleCache.current.set(user.id, defaultRole)
            setRole(defaultRole)
          } else {
            console.error("❌ [useAuth] Erro ao buscar role:", error.message)
            const fallbackRole = 'rh'
            roleCache.current.set(user.id, fallbackRole)
            setRole(fallbackRole)
          }
        } else {
          const userRole = data?.role || 'rh'
          roleCache.current.set(user.id, userRole)
          setRole(userRole)
        }
      } catch(err){
        if (!isMounted) return
        console.error("❌ [useAuth] Falha ao buscar role:", err)
        const errorRole = 'rh'
        roleCache.current.set(user.id, errorRole)
        setRole(errorRole)
      }
    }
    
    fetchRole()
    
    return () => {
      isMounted = false
    }
  }, [user])

  // Redirecionar automaticamente após autenticação
  React.useEffect(() => {
    if (user && role && !isLoading) {
      // Verificar se está na página inicial ou se precisa redirecionar
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/login') {
        console.log("🚀 [useAuth] Usuário autenticado com role, redirecionando para dashboard...")
        
        // Redirecionamento imediato para evitar delays
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, role, isLoading, navigate])

  async function signIn(email, password){
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if(error) {
        console.error("❌ [useAuth] Erro no login:", error.message)
        throw error
      }
      
      // Limpar cache ao fazer novo login
      roleCache.current.clear()
      
      return data
    } catch(err) {
      console.error("❌ [useAuth] Exceção no login:", err)
      throw err
    }
  }

  async function signOut(){
    await supabase.auth.signOut()
    setRole(null)
    // Limpar cache ao fazer logout
    roleCache.current.clear()
  }

  return { user, role, isLoading, signIn, signOut }
}
