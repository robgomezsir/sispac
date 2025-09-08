import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'
import sgMail from '@sendgrid/mail'

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Função para gerar template de email de convite
function generateInviteEmailTemplate(name, accessLink) {
  return {
    subject: 'Convite para Avaliação Comportamental - SisPAC',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Avaliação Comportamental</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #5a6fd8; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 Avaliação Comportamental</h1>
          <p>Sistema de Perfil e Análise Comportamental</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${name}!</h2>
          
          <p>Você foi convidado para participar da nossa <strong>Avaliação Comportamental</strong>.</p>
          
          <div class="highlight">
            <h3>📋 Sobre o Teste:</h3>
            <ul>
              <li><strong>Duração:</strong> Aproximadamente 10-15 minutos</li>
              <li><strong>Objetivo:</strong> Identificar seu perfil comportamental e competências</li>
              <li><strong>Confidencial:</strong> Suas respostas são confidenciais e seguras</li>
            </ul>
          </div>
          
          <p>Clique no botão abaixo para acessar o teste:</p>
          
          <div style="text-align: center;">
            <a href="${accessLink}" class="button">🚀 Iniciar Avaliação</a>
          </div>
          
          <p><strong>Link direto:</strong><br>
          <a href="${accessLink}" style="color: #667eea; word-break: break-all;">${accessLink}</a></p>
          
          <div class="highlight">
            <h3>⚠️ Importante:</h3>
            <ul>
              <li>Este link é pessoal e intransferível</li>
              <li>Você pode fazer o teste apenas uma vez</li>
              <li>Certifique-se de ter um ambiente tranquilo para responder</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Este é um e-mail automático do Sistema SisPAC.</p>
          <p>Se você não solicitou este teste, pode ignorar este e-mail.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Olá, ${name}!
      
      Você foi convidado para participar da nossa Avaliação Comportamental.
      
      SOBRE O TESTE:
      - Duração: Aproximadamente 10-15 minutos
      - Objetivo: Identificar seu perfil comportamental e competências
      - Confidencial: Suas respostas são confidenciais e seguras
      
      Para acessar o teste, clique no link abaixo:
      ${accessLink}
      
      IMPORTANTE:
      - Este link é pessoal e intransferível
      - Você pode fazer o teste apenas uma vez
      - Certifique-se de ter um ambiente tranquilo para responder
      
      Este é um e-mail automático do Sistema SisPAC.
      Se você não solicitou este teste, pode ignorar este e-mail.
    `
  }
}

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
      
      // Criar link de acesso - sempre usar URL principal
      const baseUrl = 'https://sispac.app'
      const accessLink = `${baseUrl}/form?token=${accessToken}`
      
      console.log('✅ Candidato atualizado com novo token:', { email: updatedCandidate.email, token: accessToken })
      
      // Enviar email de convite automaticamente
      try {
        console.log('📧 [addCandidate] Enviando email de convite para candidato atualizado:', email)
        
        const emailTemplate = generateInviteEmailTemplate(name.trim(), accessLink)
        
        // Enviar email diretamente via SendGrid
        const msg = {
          to: email.trim().toLowerCase(),
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sispac.com',
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        }
        
        const response = await sgMail.send(msg)
        console.log('✅ [addCandidate] Email enviado com sucesso via SendGrid:', response[0].statusCode)
        
      } catch (emailError) {
        console.error('⚠️ [addCandidate] Erro ao enviar email:', emailError)
        // Não falhar a operação se o email não for enviado
      }
      
      return ok(res, { 
        message: `Candidato "${name.trim()}" atualizado com novo link de acesso! Email de convite enviado.`,
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
    
    // Criar link de acesso - sempre usar URL principal
    const baseUrl = 'https://sispac.app'
    const accessLink = `${baseUrl}/form?token=${accessToken}`
    
    console.log('✅ Candidato criado com sucesso:', { email: newCandidate[0].email, token: accessToken })
    
    // Enviar email de convite automaticamente
    try {
      console.log('📧 [addCandidate] Enviando email de convite para:', email)
      
      const emailTemplate = generateInviteEmailTemplate(name.trim(), accessLink)
      
      // Enviar email diretamente via SendGrid
      const msg = {
        to: email.trim().toLowerCase(),
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sispac.com',
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html
      }
      
      const response = await sgMail.send(msg)
      console.log('✅ [addCandidate] Email enviado com sucesso via SendGrid:', response[0].statusCode)
      
    } catch (emailError) {
      console.error('⚠️ [addCandidate] Erro ao enviar email:', emailError)
      // Não falhar a operação se o email não for enviado
    }
    
    ok(res, { 
      message: `Candidato "${name.trim()}" criado com sucesso! Email de convite enviado.`,
      candidate: newCandidate[0],
      accessToken: accessToken,
      accessLink: accessLink
    })
    
  }catch(e){ 
    console.error('❌ Erro na API addCandidate:', e)
    fail(res, e) 
  }
}
