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
    
    // Verificar se o candidato já existe
    const { data: existingCandidate, error: checkError } = await supabase
      .from('candidates')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    
    if(checkError) {
      console.error('❌ Erro ao verificar candidato existente:', checkError)
      return fail(res, { message: 'Erro ao verificar candidato existente' }, 500)
    }
    
    if(existingCandidate) {
      return fail(res, { message: 'Candidato com este email já existe' }, 409)
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
    
    // Validar status
    const validStatuses = [
      'PENDENTE_TESTE',
      'SUPEROU A EXPECTATIVA',
      'ACIMA DA EXPECTATIVA', 
      'DENTRO DA EXPECTATIVA',
      'ABAIXO DA EXPECTATIVA',
      'REMOVIDO'
    ]
    const normalizedStatus = validStatuses.includes('PENDENTE_TESTE') ? 'PENDENTE_TESTE' : 'PENDENTE_TESTE'
    
    console.log('🔍 [addCandidate] Status normalizado:', normalizedStatus)
    
    // Criar dados do candidato pendente (não aparece no Dashboard ainda)
    const pendingCandidateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      access_token: accessToken,
      token_created_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    console.log('📝 [addCandidate] Dados do candidato pendente a serem inseridos:', pendingCandidateData)
    
    // Inserir candidato pendente (não aparece no Dashboard)
    const { data: newCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert([pendingCandidateData])
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
