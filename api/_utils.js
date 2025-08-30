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
      throw new Error('Configuração do Supabase não encontrada')
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verificar se o token é válido
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      const err = new Error('Token inválido ou expirado')
      err.status = 401
      throw err
    }
    
    // Verificar se o usuário tem role admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile || profile.role !== 'admin') {
      const err = new Error('Acesso negado: apenas administradores podem executar esta operação')
      err.status = 403
      throw err
    }
    
    // Adicionar informações do usuário ao request para uso posterior
    req.user = user
    req.userRole = profile.role
    
    return { user, role: profile.role }
  } catch (error) {
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
