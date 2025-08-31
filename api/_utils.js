import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin(){
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if(!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE')
  return createClient(url, key)
}

export async function assertAuth(req){
  try {
    const header = req.headers['authorization'] || req.headers['Authorization']
    if (!header || !header.startsWith('Bearer ')) {
      const err = new Error('Token de autorização não fornecido')
      err.status = 401
      throw err
    }
    
    const token = header.split(' ')[1]
    if (!token) {
      const err = new Error('Token inválido')
      err.status = 401
      throw err
    }
    
    // Validar token JWT do Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const err = new Error('Configuração do Supabase não encontrada')
      err.status = 500
      throw err
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verificar se o token é válido
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      const err = new Error('Token inválido ou expirado')
      err.status = 401
      throw err
    }
    
    console.log('✅ [assertAuth] Usuário autenticado:', { id: user.id, email: user.email })
    
    // Tentar verificar role na tabela profiles, mas não falhar se não existir
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!profileError && profile && profile.role === 'admin') {
        req.user = user
        req.userRole = profile.role
        console.log('✅ [assertAuth] Usuário é admin:', { role: profile.role })
        return { user, role: profile.role }
      }
    } catch (profileError) {
      console.log('⚠️ [assertAuth] Tabela profiles não encontrada ou erro ao acessar:', profileError.message)
    }
    
    // Se não conseguiu verificar na tabela profiles, verificar se é um usuário válido
    // Para desenvolvimento, aceitar qualquer usuário autenticado
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ [assertAuth] Modo desenvolvimento: aceitando usuário autenticado')
      req.user = user
      req.userRole = 'admin' // Assumir admin em desenvolvimento
      return { user, role: 'admin' }
    }
    
    // Em produção, exigir role admin
    const err = new Error('Acesso negado: apenas administradores podem executar esta operação')
    err.status = 403
    throw err
    
  } catch (error) {
    console.error('❌ [assertAuth] Erro de autenticação:', error)
    
    if (error.status) {
      throw error
    }
    
    const err = new Error('Erro de autenticação: ' + error.message)
    err.status = 500
    throw err
  }
}

export function ok(res, body){ res.status(200).json(body) }
export function fail(res, err, status = null){
  const errorStatus = status || err.status || 500
  const errorMessage = err.message || (typeof err === 'string' ? err : 'Erro interno do servidor')
  
  res.status(errorStatus).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString()
  })
}
