import { getSupabaseAdmin, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    console.log('🔄 [insertCandidate] Iniciando inserção de candidato')
    
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
    console.log('🔍 [insertCandidate] Verificando se candidato já existe:', email.trim().toLowerCase())
    
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, email, status, access_token')
      .eq('email', email.trim().toLowerCase())
      .eq('name', name.trim())
      .maybeSingle()
    
    if(checkError) {
      console.error('❌ [insertCandidate] Erro ao verificar candidato existente:', checkError)
      return fail(res, { message: 'Erro ao verificar candidato existente' }, 500)
    }
    
    if(existingCandidate) {
      // Se candidato existe e está pendente, atualizar ao invés de inserir
      if(existingCandidate.status === 'PENDENTE_TESTE') {
        console.log('🔄 [insertCandidate] Candidato pendente encontrado, atualizando via token...')
        
        const updateResponse = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/updateCandidateByToken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: existingCandidate.access_token,
            answers,
            score,
            status
          })
        })
        
        const updateData = await updateResponse.json()
        
        if (!updateResponse.ok) {
          console.error('❌ [insertCandidate] Erro ao atualizar candidato pendente:', updateData)
          return fail(res, { 
            message: 'Erro ao atualizar candidato pendente: ' + updateData.message,
            details: updateData.details
          }, 500)
        }
        
        console.log('✅ [insertCandidate] Candidato pendente atualizado com sucesso:', updateData)
        
        return ok(res, { 
          message: 'Candidato pendente atualizado com sucesso!',
          candidate: updateData.candidate || {
            id: existingCandidate.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            status: status,
            score: score
          }
        })
      } else {
        // Candidato já completou o teste
        console.log('⚠️ [insertCandidate] Candidato já completou o teste:', existingCandidate.id)
        return fail(res, { message: 'Candidato com este email já completou o teste' }, 409)
      }
    }
    
    // Inserir novo candidato
    console.log('🔄 [insertCandidate] Inserindo novo candidato...')
    
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
      console.error('❌ [insertCandidate] Erro ao inserir candidato:', insertError)
      return fail(res, { 
        message: 'Erro ao inserir candidato: ' + insertError.message,
        details: insertError.details,
        code: insertError.code
      }, 500)
    }
    
    console.log('✅ [insertCandidate] Candidato inserido com sucesso:', {
      id: insertedCandidate.id,
      email: insertedCandidate.email,
      status: insertedCandidate.status,
      score: insertedCandidate.score
    })
    
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
    console.error('❌ [insertCandidate] Erro na API:', e)
    fail(res, e) 
  }
}
