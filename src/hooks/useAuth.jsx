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
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session)=>{
      setUser(session?.user ?? null)
    })
    return ()=>sub?.subscription.unsubscribe()
  }, [])

  // Buscar role real na tabela profiles
  React.useEffect(()=>{
    async function fetchRole(){
      if(!user){ setRole(null); return }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if(error){
          console.error("Erro ao buscar role:", error.message)
          setRole('rh') // fallback padrão
        } else {
          setRole(data?.role || 'rh')
        }
      } catch(err){
        console.error("Falha ao buscar role:", err)
        setRole('rh')
      }
    }
    fetchRole()
  }, [user])

  async function signIn(email, password){
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) throw error
    return data
  }

  async function signOut(){
    await supabase.auth.signOut()
    setRole(null)
  }

  return { user, role, signIn, signOut }
}
