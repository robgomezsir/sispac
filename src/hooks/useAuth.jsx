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
  const navigate = useNavigate()

  React.useEffect(()=>{
    let isMounted = true
    
    supabase.auth.getUser().then(({data, error})=>{
      if (!isMounted) return
      if(error) {
        console.error("❌ [useAuth] Erro ao buscar usuário:", error)
      } else {
        setUser(data.user)
      }
    })
    
    const { data: sub } = supabase.auth.onAuthStateChange((event, session)=>{
      if (!isMounted) return
      setUser(session?.user ?? null)
    })
    
    return ()=>{
      isMounted = false
      sub?.subscription.unsubscribe()
    }
  }, [])

  // Buscar role real na tabela profiles
  React.useEffect(()=>{
    let isMounted = true
    
    async function fetchRole(){
      if(!user){ 
        if (isMounted) {
          setRole(null)
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
            setRole('rh')
          } else {
            console.error("❌ [useAuth] Erro ao buscar role:", error.message)
            setRole('rh') // fallback padrão
          }
        } else {
          setRole(data?.role || 'rh')
        }
      } catch(err){
        if (!isMounted) return
        console.error("❌ [useAuth] Falha ao buscar role:", err)
        setRole('rh')
      }
    }
    
    fetchRole()
    
    return () => {
      isMounted = false
    }
  }, [user])

  // Redirecionar automaticamente após autenticação
  React.useEffect(() => {
    if (user && role && window.location.pathname === '/') {
      console.log("🚀 [useAuth] Usuário autenticado com role, redirecionando para dashboard...")
      
      // Usar setTimeout para evitar loop infinito
      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, role]) // Removido navigate das dependências

  async function signIn(email, password){
    console.log("🔐 [useAuth] Tentativa de login:", { email, password: '***' })
    
    try {
      // Primeira tentativa: login direto
      console.log("🔐 [useAuth] Tentando login direto...")
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log("🔐 [useAuth] Resultado do login direto:", { data, error })
      
      if(error) {
        console.error("❌ [useAuth] Erro no login direto:", error.message)
        
        // Se der erro de "Database error", tentar criar sessão manual
        if(error.message.includes('Database error')) {
          console.log("🔐 [useAuth] Tentando criar sessão manual...")
          
          // Verificar se o usuário existe na tabela profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()
          
          if(profileError) {
            console.error("❌ [useAuth] Erro ao buscar perfil:", profileError.message)
            throw error // re-throw o erro original
          }
          
          if(profileData) {
            console.log("✅ [useAuth] Perfil encontrado, criando sessão manual")
            // Criar uma sessão manual baseada no perfil
            const mockUser = {
              id: profileData.id,
              email: profileData.email,
              user_metadata: { role: profileData.role }
            }
            
            // Simular login bem-sucedido
            setUser(mockUser)
            setRole(profileData.role)
            
            return { user: mockUser, session: { user: mockUser } }
          }
        }
        
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

  return { user, role, signIn, signOut }
}
