import { getSupabaseAdmin, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    console.log('🔄 [checkPendingCandidate] Verificando candidato pendente')
    
    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    // Validar método HTTP
    if (req.method !== 'POST') {
      return fail(res, { message: 'Método não permitido' }, 405)
    }
    
    const { name, email } = req.body || {}
    
    // Validação dos campos obrigatórios
    if(!name || !name.trim()) {
      return fail(res, { message: 'Nome é obrigatório' }, 400)
    }
    
    if(!email || !email.trim()) {
      return fail(res, { message: 'Email é obrigatório' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Verificar se existe candidato pendente com mesmo email e nome
    console.log('🔍 [checkPendingCandidate] Verificando candidato pendente:', { 
      name: name.trim(), 
      email: email.trim().toLowerCase() 
    })
    
    const { data: pendingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, name, email, status, access_token')
      .eq('email', email.trim().toLowerCase())
      .eq('name', name.trim())
      .eq('status', 'PENDENTE_TESTE')
      .maybeSingle()
    
    if(checkError) {
      console.error('❌ [checkPendingCandidate] Erro ao verificar candidato pendente:', checkError)
      return fail(res, { message: 'Erro ao verificar candidato pendente' }, 500)
    }
    
    if(pendingCandidate) {
      console.log('✅ [checkPendingCandidate] Candidato pendente encontrado:', {
        id: pendingCandidate.id,
        email: pendingCandidate.email,
        hasToken: !!pendingCandidate.access_token
      })
      
      return ok(res, { 
        found: true,
        candidate: {
          id: pendingCandidate.id,
          name: pendingCandidate.name,
          email: pendingCandidate.email,
          status: pendingCandidate.status,
          access_token: pendingCandidate.access_token
        }
      })
    }
    
    console.log('ℹ️ [checkPendingCandidate] Nenhum candidato pendente encontrado')
    
    return ok(res, { 
      found: false,
      message: 'Nenhum candidato pendente encontrado'
    })
    
  }catch(e){ 
    console.error('❌ [checkPendingCandidate] Erro na API:', e)
    fail(res, e) 
  }
}
