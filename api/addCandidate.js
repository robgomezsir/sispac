import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const { name, email } = req.body || {}
    
    // Validação dos campos obrigatórios
    if(!name || !name.trim()) {
      return fail(res, { message: 'Nome é obrigatório' }, 400)
    }
    
    if(!email || !email.trim()) {
      return fail(res, { message: 'Email é obrigatório' }, 400)
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(email.trim())) {
      return fail(res, { message: 'Email inválido' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Verificar se o candidato já existe e se não está pendente
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, email, status')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    
    if(checkError) {
      console.error('❌ Erro ao verificar candidato existente:', checkError)
      return fail(res, { message: 'Erro ao verificar candidato existente' }, 500)
    }
    
    // Se candidato existe e não está pendente, retornar erro
    if(existingCandidate && existingCandidate.status !== 'PENDENTE_TESTE') {
      return fail(res, { message: 'Candidato com este email já existe e completou o teste' }, 409)
    }
    
    // Se candidato existe e está pendente, reutilizar o registro existente
    if(existingCandidate && existingCandidate.status === 'PENDENTE_TESTE') {
      console.log('🔄 [addCandidate] Candidato pendente encontrado, reutilizando registro:', existingCandidate.id)
      
      // Gerar novo token para o candidato existente
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const payload = `${timestamp}_${email}_${randomString}`
      
      // Gerar hash simples
      let hash = 0
      for (let i = 0; i < payload.length; i++) {
        const char = payload.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      
      const accessToken = 'sispac_' + Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32)
      
      // Atualizar candidato existente com novo token
      const { data: updatedCandidate, error: updateError } = await supabase
        .from('candidates')
        .update({
          name: name.trim(),
          access_token: accessToken,
          token_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCandidate.id)
        .select()
        .single()
      
      if(updateError) {
        console.error('❌ Erro ao atualizar candidato existente:', updateError)
        return fail(res, { message: 'Erro ao atualizar candidato existente' }, 500)
      }
      
      // Criar link de acesso
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sispac.vercel.app'
      const accessLink = `${baseUrl}/form?token=${accessToken}`
      
      console.log('✅ Candidato atualizado com novo token:', { email: updatedCandidate.email, token: accessToken })
      
      return ok(res, { 
        message: `Candidato "${name.trim()}" atualizado com novo link de acesso!`,
        candidate: updatedCandidate,
        accessToken: accessToken,
        accessLink: accessLink
      })
    }
    
    // Gerar token de acesso simples
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const payload = `${timestamp}_${email}_${randomString}`
    
    // Gerar hash simples
    let hash = 0
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const accessToken = 'sispac_' + Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32)
    
    // Status para candidatos de teste - sempre PENDENTE_TESTE
    const normalizedStatus = 'PENDENTE_TESTE'
    
    console.log('🔍 [addCandidate] Status normalizado para candidato de teste:', normalizedStatus)
    
    // Criar dados do candidato
    const candidateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      score: 0,
      status: normalizedStatus,
      answers: {},
      access_token: accessToken,
      token_created_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    console.log('📝 [addCandidate] Dados do candidato a serem inseridos:', candidateData)
    
    // Inserir candidato
    const { data: newCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
    
    if(insertError) {
      console.error('❌ Erro ao inserir candidato:', insertError)
      return fail(res, { 
        message: 'Erro ao inserir candidato: ' + insertError.message,
        details: insertError.details,
        code: insertError.code
      }, 500)
    }
    
    // Criar link de acesso
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sispac.vercel.app'
    const accessLink = `${baseUrl}/form?token=${accessToken}`
    
    console.log('✅ Candidato criado com sucesso:', { email: newCandidate[0].email, token: accessToken })
    
    ok(res, { 
      message: `Candidato "${name.trim()}" criado com sucesso!`,
      candidate: newCandidate[0],
      accessToken: accessToken,
      accessLink: accessLink
    })
    
  }catch(e){ 
    console.error('❌ Erro na API addCandidate:', e)
    fail(res, e) 
  }
}
