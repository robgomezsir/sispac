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

  React.useEffect(()=>{
    // Mapear role simples: admin se email = ADMIN GERAL, senão 'rh'
    const email = user?.email
    if(!email){ setRole(null); return }
    if(email?.toLowerCase() === 'robgomez.sir@gmail.com'){ setRole('admin') }
    else { setRole('rh') }
  }, [user])

  async function signIn(email, password){
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) throw error
    return data
  }
  async function signOut(){
    await supabase.auth.signOut()
  }

  return { user, role, signIn, signOut }
}
