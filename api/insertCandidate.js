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
    
    const { name, email, answers, score, status } = req.body || {}
    
    // Validação dos campos obrigatórios
    if(!name || !name.trim()) {
      return fail(res, { message: 'Nome é obrigatório' }, 400)
    }
    
    if(!email || !email.trim()) {
      return fail(res, { message: 'Email é obrigatório' }, 400)
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
    
    // Verificar se candidato já existe (completo ou pendente)
    
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, email, status, access_token')
      .eq('email', email.trim().toLowerCase())
      .eq('name', name.trim())
      .maybeSingle()
    
    if(checkError) {
      return fail(res, { message: 'Erro ao verificar candidato existente' }, 500)
    }
    
    if(existingCandidate) {
      // Se candidato existe e está pendente, atualizar ao invés de inserir
      if(existingCandidate.status === 'PENDENTE_TESTE') {
        
        // Atualizar candidato pendente diretamente no banco
        const { data: updatedCandidate, error: updateError } = await supabase
          .from('candidates')
          .update({
            answers,
            score,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCandidate.id)
          .select()
          .single()
        
        if(updateError) {
          return fail(res, { 
            message: 'Erro ao atualizar candidato pendente: ' + updateError.message,
            details: updateError.details
          }, 500)
        }
        
        return ok(res, { 
          message: 'Candidato pendente atualizado com sucesso!',
          candidate: {
            id: updatedCandidate.id,
            name: updatedCandidate.name,
            email: updatedCandidate.email,
            status: updatedCandidate.status,
            score: updatedCandidate.score
          }
        })
      } else {
        // Candidato já completou o teste
        return fail(res, { message: 'Candidato com este email já completou o teste' }, 409)
      }
    }
    
    // Inserir novo candidato
    
    const candidatePayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      answers,
      score,
      status,
      created_at: new Date().toISOString()
    }
    
    const { data: insertedCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert([candidatePayload])
      .select()
      .single()
    
    if(insertError) {
      return fail(res, { 
        message: 'Erro ao inserir candidato: ' + insertError.message,
        details: insertError.details,
        code: insertError.code
      }, 500)
    }
    
    return ok(res, { 
      message: 'Candidato inserido com sucesso!',
      candidate: {
        id: insertedCandidate.id,
        name: insertedCandidate.name,
        email: insertedCandidate.email,
        status: insertedCandidate.status,
        score: insertedCandidate.score
      }
    })
    
  }catch(e){ 
    fail(res, e) 
  }
}
