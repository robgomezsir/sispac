import { getSupabaseAdmin, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    
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
    
    const { token, answers, score, status } = req.body || {}
    
    // Validação dos campos obrigatórios
    if(!token || !token.trim()) {
      return fail(res, { message: 'Token é obrigatório' }, 400)
    }
    
    if(!answers || typeof answers !== 'object') {
      return fail(res, { message: 'Respostas são obrigatórias' }, 400)
    }
    
    if(typeof score !== 'number') {
      return fail(res, { message: 'Score é obrigatório' }, 400)
    }
    
    if(!status || !status.trim()) {
      return fail(res, { message: 'Status é obrigatório' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar candidato pelo token
    
    const { data: existingCandidate, error: searchError } = await supabase
      .from('candidates')
      .select('id, name, email, status, access_token')
      .eq('access_token', token.trim())
      .single()
    
    if(searchError) {
      if(searchError.code === 'PGRST116') {
        return fail(res, { message: 'Token inválido ou não encontrado' }, 404)
      }
      return fail(res, { message: 'Erro ao buscar candidato' }, 500)
    }
    
    // Verificar se o candidato está pendente
    if(existingCandidate.status !== 'PENDENTE_TESTE') {
      return fail(res, { 
        message: 'Este teste já foi completado',
        candidate_status: existingCandidate.status 
      }, 409)
    }
    
    // Atualizar candidato com as respostas
    
    const updatePayload = {
      answers,
      score,
      status,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }
    
    const { data: updatedCandidate, error: updateError } = await supabase
      .from('candidates')
      .update(updatePayload)
      .eq('id', existingCandidate.id)
      .select()
      .single()
    
    if(updateError) {
      return fail(res, { 
        message: 'Erro ao atualizar candidato: ' + updateError.message,
        details: updateError.details,
        code: updateError.code
      }, 500)
    }
    
    return ok(res, { 
      message: 'Candidato atualizado com sucesso!',
      candidate: {
        id: updatedCandidate.id,
        name: updatedCandidate.name,
        email: updatedCandidate.email,
        status: updatedCandidate.status,
        score: updatedCandidate.score
      }
    })
    
  }catch(e){ 
    fail(res, e) 
  }
}
