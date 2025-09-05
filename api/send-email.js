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
    
    const { to, subject, html, text } = req.body || {}
    
    // Validação dos campos obrigatórios
    if (!to || !to.trim()) {
      return res.status(400).json({ error: 'Destinatário é obrigatório' })
    }
    
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Assunto é obrigatório' })
    }
    
    if (!html && !text) {
      return res.status(400).json({ error: 'Conteúdo do e-mail é obrigatório' })
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to.trim())) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    
    // Configurar Supabase com service_role
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Configuração do servidor não encontrada' })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verificar se a chave do SendGrid está configurada
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'Configuração de email não encontrada' })
    }
    
    // Verificar se o email remetente está configurado
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@sispac.com'
    
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
      
      emailData = {
        to: to.trim(),
        subject: subject.trim(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        sendgrid_message_id: response[0].headers['x-message-id'] || 'unknown'
      }
    } catch (sendGridError) {
      // Se o SendGrid falhar, tentar fallback para simulação (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
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
      
      // Log salvo silenciosamente
    } catch (logError) {
      // Log de erro ignorado
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
    
    return res.status(200).json(response)
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro interno do servidor: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
