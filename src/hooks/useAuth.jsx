import React from 'react'
import { supabase } from '../lib/supabase'

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

  React.useEffect(()=>{
    console.log("🔍 [useAuth] Verificando usuário atual...")
    supabase.auth.getUser().then(({data, error})=>{
      console.log("🔍 [useAuth] getUser result:", { data, error })
      if(error) {
        console.error("❌ [useAuth] Erro ao buscar usuário:", error)
      } else {
        console.log("✅ [useAuth] Usuário encontrado:", data.user)
        setUser(data.user)
      }
    })
    
    const { data: sub } = supabase.auth.onAuthStateChange((event, session)=>{
      console.log("🔄 [useAuth] Auth state change:", { event, session })
      setUser(session?.user ?? null)
    })
    return ()=>sub?.subscription.unsubscribe()
  }, [])

  // Buscar role real na tabela profiles
  React.useEffect(()=>{
    async function fetchRole(){
      if(!user){ 
        console.log("🔍 [useAuth] Sem usuário, role resetado para null")
        setRole(null); 
        return 
      }
      
      console.log("🔍 [useAuth] Buscando role para usuário:", user.id)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        console.log("🔍 [useAuth] Resultado da busca de role:", { data, error })
        
        if(error){
          console.error("❌ [useAuth] Erro ao buscar role:", error.message)
          console.log("🔍 [useAuth] Usando fallback 'rh'")
          setRole('rh') // fallback padrão
        } else {
          console.log("✅ [useAuth] Role encontrado:", data?.role)
          setRole(data?.role || 'rh')
        }
      } catch(err){
        console.error("❌ [useAuth] Falha ao buscar role:", err)
        console.log("🔍 [useAuth] Usando fallback 'rh'")
        setRole('rh')
      }
    }
    fetchRole()
  }, [user])

  async function signIn(email, password){
    console.log("🔐 [useAuth] Tentativa de login:", { email, password: '***' })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log("🔐 [useAuth] Resultado do login:", { data, error })
      
      if(error) {
        console.error("❌ [useAuth] Erro no login:", error.message)
        throw error
      }
      
      console.log("✅ [useAuth] Login bem-sucedido:", data)
      return data
    } catch(err) {
      console.error("❌ [useAuth] Exceção no login:", err)
      throw err
    }
  }

  async function signOut(){
    console.log("🚪 [useAuth] Fazendo logout...")
    await supabase.auth.signOut()
    setRole(null)
    console.log("✅ [useAuth] Logout concluído")
  }

  console.log("🔍 [useAuth] Estado atual:", { user: user?.email, role, userId: user?.id })

  return { user, role, signIn, signOut }
}
