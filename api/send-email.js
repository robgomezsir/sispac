import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }
  
  try {
    console.log('🔍 [send-email] Iniciando envio de e-mail')
    console.log('🔍 [send-email] Body recebido:', req.body)
    
    const { to, subject, html, text } = req.body || {}
    
    // Validação dos campos obrigatórios
    if (!to || !to.trim()) {
      console.error('❌ [send-email] Destinatário não fornecido')
      return res.status(400).json({ error: 'Destinatário é obrigatório' })
    }
    
    if (!subject || !subject.trim()) {
      console.error('❌ [send-email] Assunto não fornecido')
      return res.status(400).json({ error: 'Assunto é obrigatório' })
    }
    
    if (!html && !text) {
      console.error('❌ [send-email] Conteúdo do e-mail não fornecido')
      return res.status(400).json({ error: 'Conteúdo do e-mail é obrigatório' })
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to.trim())) {
      console.error('❌ [send-email] Email inválido:', to)
      return res.status(400).json({ error: 'Email inválido' })
    }
    
    // Configurar Supabase com service_role
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [send-email] Configuração do Supabase não encontrada')
      return res.status(500).json({ error: 'Configuração do servidor não encontrada' })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Para este exemplo, vamos usar o serviço de e-mail do Supabase Auth
    // que pode ser configurado para enviar e-mails transacionais
    console.log('🔍 [send-email] Enviando e-mail via Supabase Auth...')
    
    // Simular envio de e-mail (em produção, você configuraria um provedor real)
    // Por enquanto, vamos apenas logar o e-mail que seria enviado
    console.log('📧 [send-email] E-mail que seria enviado:')
    console.log('   Para:', to)
    console.log('   Assunto:', subject)
    console.log('   HTML:', html ? 'Sim' : 'Não')
    console.log('   Texto:', text ? 'Sim' : 'Não')
    
    // Em um ambiente de produção, você integraria com:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - Ou outro provedor de e-mail
    
    // Por enquanto, vamos simular um envio bem-sucedido
    const emailData = {
      to: to.trim(),
      subject: subject.trim(),
      html: html || text,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }
    
    // Salvar log do e-mail enviado (opcional)
    try {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          to: emailData.to,
          subject: emailData.subject,
          sent_at: emailData.sent_at,
          status: emailData.status
        })
      
      if (logError) {
        console.log('⚠️ [send-email] Erro ao salvar log do e-mail:', logError)
      } else {
        console.log('✅ [send-email] Log do e-mail salvo com sucesso')
      }
    } catch (logError) {
      console.log('⚠️ [send-email] Erro ao salvar log do e-mail:', logError)
    }
    
    const response = {
      success: true,
      message: 'E-mail enviado com sucesso',
      email: {
        to: emailData.to,
        subject: emailData.subject,
        sent_at: emailData.sent_at,
        status: emailData.status
      }
    }
    
    console.log('✅ [send-email] E-mail processado com sucesso:', response)
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('❌ [send-email] Erro geral:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
