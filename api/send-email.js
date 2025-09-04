import { createClient } from '@supabase/supabase-js'
import sgMail from '@sendgrid/mail'

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
    
    // Verificar se a chave do SendGrid está configurada
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ [send-email] SENDGRID_API_KEY não configurada')
      return res.status(500).json({ error: 'Configuração de email não encontrada' })
    }
    
    // Verificar se o email remetente está configurado
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@sispac.com'
    
    console.log('🔍 [send-email] Enviando e-mail via SendGrid...')
    console.log('📧 [send-email] De:', fromEmail)
    console.log('📧 [send-email] Para:', to)
    console.log('📧 [send-email] Assunto:', subject)
    
    // Preparar mensagem para SendGrid
    const msg = {
      to: to.trim(),
      from: fromEmail,
      subject: subject.trim(),
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
      html: html || text
    }
    
    let emailData
    try {
      // Enviar email via SendGrid
      const response = await sgMail.send(msg)
      console.log('✅ [send-email] Email enviado com sucesso via SendGrid:', response[0].statusCode)
      
      emailData = {
        to: to.trim(),
        subject: subject.trim(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        sendgrid_message_id: response[0].headers['x-message-id'] || 'unknown'
      }
    } catch (sendGridError) {
      console.error('❌ [send-email] Erro ao enviar via SendGrid:', sendGridError)
      
      // Se o SendGrid falhar, tentar fallback para simulação (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [send-email] Modo desenvolvimento: simulando envio...')
        emailData = {
          to: to.trim(),
          subject: subject.trim(),
          sent_at: new Date().toISOString(),
          status: 'simulated',
          error: sendGridError.message
        }
      } else {
        throw new Error(`Erro ao enviar email: ${sendGridError.message}`)
      }
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
