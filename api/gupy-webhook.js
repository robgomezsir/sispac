import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    console.log('🔗 [gupy-webhook] Webhook da Gupy recebido')
    console.log('🔗 [gupy-webhook] Headers:', req.headers)
    console.log('🔗 [gupy-webhook] Body:', req.body)
    
    // Validar método HTTP
    if (req.method !== 'POST') {
      console.log('❌ [gupy-webhook] Método não permitido:', req.method)
      return res.status(405).json({ 
        error: 'Método não permitido',
        message: 'Apenas requisições POST são aceitas'
      })
    }
    
    // Validar autenticação (opcional para webhooks da Gupy)
    // Se a Gupy enviar um token de autenticação, validar aqui
    const gupyToken = req.headers['x-gupy-token'] || req.headers['authorization']
    if (gupyToken && !gupyToken.includes('Bearer')) {
      console.log('⚠️ [gupy-webhook] Token da Gupy não fornecido ou inválido')
      // Para webhooks, podemos ser mais permissivos, mas logamos o evento
    }
    
    const { 
      candidate_id, 
      name, 
      email, 
      job_id, 
      application_date,
      phone,
      resume_url,
      gupy_data 
    } = req.body || {}
    
    // Validação dos campos obrigatórios
    if(!candidate_id) {
      console.log('❌ [gupy-webhook] candidate_id é obrigatório')
      return fail(res, { message: 'candidate_id é obrigatório' }, 400)
    }
    
    if(!name || !name.trim()) {
      console.log('❌ [gupy-webhook] Nome é obrigatório')
      return fail(res, { message: 'Nome é obrigatório' }, 400)
    }
    
    if(!email || !email.trim()) {
      console.log('❌ [gupy-webhook] Email é obrigatório')
      return fail(res, { message: 'Email é obrigatório' }, 400)
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(email.trim())) {
      console.log('❌ [gupy-webhook] Email inválido:', email)
      return fail(res, { message: 'Email inválido' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    console.log('✅ [gupy-webhook] Cliente Supabase criado')
    
    // Verificar se o candidato já existe (por email ou candidate_id)
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, name, email, gupy_candidate_id')
      .or(`email.eq.${email.trim().toLowerCase()},gupy_candidate_id.eq.${candidate_id}`)
      .limit(1)
    
    if(checkError) {
      console.error('❌ [gupy-webhook] Erro ao verificar candidato existente:', checkError)
      return fail(res, { message: 'Erro ao verificar candidato existente' }, 500)
    }
    
    if(existingCandidate && existingCandidate.length > 0) {
      console.log('⚠️ [gupy-webhook] Candidato já existe:', existingCandidate[0])
      
      // Atualizar dados do candidato existente
      const updateData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        gupy_candidate_id: candidate_id,
        job_id: job_id || null,
        application_date: application_date || new Date().toISOString(),
        phone: phone || null,
        resume_url: resume_url || null,
        gupy_data: gupy_data || null,
        updated_at: new Date().toISOString()
      }
      
      const { data: updatedCandidate, error: updateError } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', existingCandidate[0].id)
        .select()
        .single()
      
      if(updateError) {
        console.error('❌ [gupy-webhook] Erro ao atualizar candidato:', updateError)
        return fail(res, { message: 'Erro ao atualizar candidato existente' }, 500)
      }
      
      console.log('✅ [gupy-webhook] Candidato atualizado com sucesso:', updatedCandidate)
      
      return ok(res, {
        success: true,
        message: 'Candidato atualizado com sucesso',
        action: 'updated',
        candidate: {
          id: updatedCandidate.id,
          name: updatedCandidate.name,
          email: updatedCandidate.email,
          gupy_candidate_id: updatedCandidate.gupy_candidate_id
        }
      })
    }
    
    // Criar novo candidato
    const candidateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      gupy_candidate_id: candidate_id,
      job_id: job_id || null,
      application_date: application_date || new Date().toISOString(),
      phone: phone || null,
      resume_url: resume_url || null,
      gupy_data: gupy_data || null,
      status: 'PENDENTE_TESTE', // Status inicial para candidatos da Gupy
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: newCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single()
    
    if(insertError) {
      console.error('❌ [gupy-webhook] Erro ao criar candidato:', insertError)
      return fail(res, { message: 'Erro ao criar candidato: ' + insertError.message }, 500)
    }
    
    console.log('✅ [gupy-webhook] Candidato criado com sucesso:', newCandidate)
    
    // Aqui você pode adicionar lógica adicional como:
    // - Enviar email para o candidato com link do teste
    // - Notificar o RH sobre novo candidato
    // - Integrar com outros sistemas
    
    return ok(res, {
      success: true,
      message: 'Candidato criado com sucesso',
      action: 'created',
      candidate: {
        id: newCandidate.id,
        name: newCandidate.name,
        email: newCandidate.email,
        gupy_candidate_id: newCandidate.gupy_candidate_id,
        status: newCandidate.status
      },
      next_steps: [
        'Candidato receberá link para teste comportamental',
        'Resultados serão sincronizados automaticamente',
        'RH pode acompanhar progresso no dashboard'
      ]
    })
    
  }catch(e){ 
    console.error('❌ [gupy-webhook] Erro no webhook:', e)
    fail(res, e) 
  }
}
