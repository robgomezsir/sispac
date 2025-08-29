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
        // Primeiro verificar se a tabela profiles existe
        const { data: tableCheck, error: tableError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if(tableError) {
          console.error("❌ [useAuth] Tabela profiles não existe ou erro de acesso:", tableError.message)
          console.log("🔍 [useAuth] Usando fallback 'rh' - configure o banco primeiro")
          setRole('rh') // fallback padrão
          return
        }
        
        // Buscar role do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        console.log("🔍 [useAuth] Resultado da busca de role:", { data, error })
        
        if(error){
          if(error.code === 'PGRST116') {
            console.log("🔍 [useAuth] Usuário não tem perfil, criando perfil padrão...")
            // Tentar criar perfil padrão
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'rh'
              })
            
            if(insertError) {
              console.error("❌ [useAuth] Erro ao criar perfil:", insertError.message)
            } else {
              console.log("✅ [useAuth] Perfil criado com sucesso")
            }
            setRole('rh')
          } else {
            console.error("❌ [useAuth] Erro ao buscar role:", error.message)
            setRole('rh') // fallback padrão
          }
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

  // Redirecionar automaticamente após autenticação
  React.useEffect(() => {
    if (user && role) {
      console.log("🚀 [useAuth] Usuário autenticado com role, redirecionando para dashboard...")
      console.log("🚀 [useAuth] Dados do usuário:", { email: user.email, role, id: user.id })
      
      // Pequeno delay para garantir que tudo foi carregado
      setTimeout(() => {
        navigate('/dashboard')
      }, 100)
    }
  }, [user, role, navigate])

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

  console.log("🔍 [useAuth] Estado atual:", { user: user?.email, role, userId: user?.id })

  return { user, role, signIn, signOut }
}
