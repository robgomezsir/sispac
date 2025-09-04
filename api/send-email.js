import { createClient } from '@supabase/supabase-js'
import * as brevo from '@getbrevo/brevo'

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
    console.log('🔍 [send-email] Iniciando envio de e-mail via Brevo')
    console.log('🔍 [send-email] Body recebido:', req.body)
    
    const { to, name, subject, html, text } = req.body || {}
    
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
    
    // Verificar se a chave da API do Brevo está configurada
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ [send-email] BREVO_API_KEY não configurada')
      return res.status(500).json({ error: 'Configuração de email não encontrada' })
    }
    
    // Configurar cliente Brevo
    const brevoApi = new brevo.TransactionalEmailsApi()
    brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)
    
    // Configurar email para envio
    const sendSmtpEmail = new brevo.SendSmtpEmail({
      sender: { 
        name: 'SisPAC', 
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@sispac.com' 
      },
      to: [{ 
        email: to.trim(), 
        name: name || to.trim().split('@')[0] 
      }],
      subject: subject.trim(),
      htmlContent: html || text,
      textContent: text || html?.replace(/<[^>]*>/g, '') // Converter HTML para texto se necessário
    })
    
    console.log('📧 [send-email] Enviando e-mail via Brevo...')
    console.log('   Para:', to)
    console.log('   Nome:', name || 'N/A')
    console.log('   Assunto:', subject)
    
    // Enviar email via Brevo
    const brevoResponse = await brevoApi.sendTransacEmail(sendSmtpEmail)
    
    console.log('✅ [send-email] E-mail enviado com sucesso via Brevo:', brevoResponse)
    
    // Configurar Supabase para logs (opcional)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Salvar log do e-mail enviado
      try {
        const { error: logError } = await supabase
          .from('email_logs')
          .insert({
            to: to.trim(),
            subject: subject.trim(),
            sent_at: new Date().toISOString(),
            status: 'sent',
            provider: 'brevo',
            message_id: brevoResponse.messageId || null
          })
        
        if (logError) {
          console.log('⚠️ [send-email] Erro ao salvar log do e-mail:', logError)
        } else {
          console.log('✅ [send-email] Log do e-mail salvo com sucesso')
        }
      } catch (logError) {
        console.log('⚠️ [send-email] Erro ao salvar log do e-mail:', logError)
      }
    }
    
    const response = {
      success: true,
      message: 'E-mail enviado com sucesso via Brevo',
      email: {
        to: to.trim(),
        name: name || 'N/A',
        subject: subject.trim(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        provider: 'brevo',
        message_id: brevoResponse.messageId
      }
    }
    
    console.log('✅ [send-email] E-mail processado com sucesso:', response)
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('❌ [send-email] Erro ao enviar e-mail via Brevo:', error)
    
    // Log do erro no Supabase se disponível
    try {
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        await supabase
          .from('email_logs')
          .insert({
            to: req.body?.to || 'unknown',
            subject: req.body?.subject || 'unknown',
            sent_at: new Date().toISOString(),
            status: 'failed',
            provider: 'brevo',
            error_message: error.message
          })
      }
    } catch (logError) {
      console.log('⚠️ [send-email] Erro ao salvar log de erro:', logError)
    }
    
    return res.status(500).json({ 
      error: 'Erro ao enviar e-mail: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
