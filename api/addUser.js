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
    console.log('🔍 [addUserSimple] Iniciando criação de usuário')
    console.log('🔍 [addUserSimple] Body recebido:', req.body)
    
    const { name, email, role } = req.body || {}
    
    // Validação dos campos obrigatórios
    if (!name || !name.trim()) {
      console.error('❌ [addUserSimple] Nome não fornecido')
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    
    if (!email || !email.trim()) {
      console.error('❌ [addUserSimple] Email não fornecido')
      return res.status(400).json({ error: 'Email é obrigatório' })
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.error('❌ [addUserSimple] Email inválido:', email)
      return res.status(400).json({ error: 'Email inválido' })
    }
    
    // Validar e normalizar role
    const validRoles = ['admin', 'rh', 'user']
    const normalizedRole = validRoles.includes(role) ? role : 'rh'
    
    console.log('🔍 [addUserSimple] Role recebido:', role, 'Role normalizado:', normalizedRole)
    
    // Configurar Supabase com service_role
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [addUserSimple] Configuração do Supabase não encontrada')
      return res.status(500).json({ error: 'Configuração do servidor não encontrada' })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verificar se o usuário já existe na tabela profiles
    console.log('🔍 [addUserSimple] Verificando se usuário já existe...')
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    
    if (checkError) {
      console.error('❌ [addUserSimple] Erro ao verificar usuário existente:', checkError)
      return res.status(500).json({ error: 'Erro ao verificar usuário existente' })
    }
    
    if (existingProfile) {
      console.error('❌ [addUserSimple] Usuário já existe:', existingProfile.email)
      return res.status(409).json({ error: 'Usuário com este email já existe' })
    }
    
    // Verificar se já existe um usuário no Supabase Auth com este email
    console.log('🔍 [addUserSimple] Verificando se usuário já existe no Auth...')
    const { data: existingAuthUser, error: authCheckError } = await supabase.auth.admin.listUsers()
    
    if (authCheckError) {
      console.error('❌ [addUserSimple] Erro ao verificar usuários auth:', authCheckError)
      return res.status(500).json({ error: 'Erro ao verificar usuários existentes' })
    }
    
    const userExistsInAuth = existingAuthUser.users.find(user => 
      user.email?.toLowerCase() === email.trim().toLowerCase()
    )
    
    if (userExistsInAuth) {
      console.error('❌ [addUserSimple] Usuário já existe no Auth:', userExistsInAuth.email)
      return res.status(409).json({ error: 'Usuário com este email já existe no sistema' })
    }
    
    // Gerar senha temporária
    const password = Math.floor(100000 + Math.random() * 900000).toString()
    
    console.log('🔍 [addUserSimple] Criando usuário no auth...')
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: normalizedRole,
        created_at: new Date().toISOString()
      }
    })
    
    if (authError) {
      console.error('❌ [addUserSimple] Erro ao criar usuário auth:', authError)
      return res.status(500).json({ error: 'Erro ao criar usuário: ' + authError.message })
    }
    
    console.log('✅ [addUserSimple] Usuário auth criado:', authData.user.id)
    
    // Criar perfil na tabela profiles usando UPSERT para evitar duplicatas
    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      role: normalizedRole,
      full_name: name.trim(),
      is_active: true,
      created_at: new Date().toISOString()
    }
    
    console.log('🔍 [addUserSimple] Dados do perfil a serem inseridos:', profileData)
    
    // Usar UPSERT para evitar erro de chave duplicada
    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
    
    if (profileError) {
      console.error('❌ [addUserSimple] Erro ao criar/atualizar perfil:', profileError)
      
      // Tentar deletar o usuário criado se o perfil falhar
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log('✅ [addUserSimple] Usuário auth removido após falha no perfil')
      } catch (deleteError) {
        console.error('❌ [addUserSimple] Erro ao deletar usuário após falha no perfil:', deleteError)
      }
      
      return res.status(500).json({ 
        error: 'Erro ao criar perfil: ' + profileError.message,
        details: profileError.details,
        code: profileError.code
      })
    }
    
    console.log('✅ [addUserSimple] Perfil criado com sucesso:', profileResult)
    
    // Enviar e-mail com credenciais do usuário
    try {
      console.log('🔍 [addUserSimple] Enviando e-mail de boas-vindas...')
      
      const emailSubject = 'Bem-vindo ao SisPAC - Suas Credenciais de Acesso'
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao SisPAC!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sistema de Avaliação de Candidatos</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${name.trim()}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Sua conta foi criada com sucesso no SisPAC. Abaixo estão suas credenciais de acesso:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">🔐 Suas Credenciais:</h3>
              <p style="margin: 8px 0;"><strong>E-mail:</strong> ${authData.user.email}</p>
              <p style="margin: 8px 0;"><strong>Senha temporária:</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
              <p style="margin: 8px 0;"><strong>Função:</strong> ${normalizedRole.toUpperCase()}</p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Importante:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Esta é uma senha temporária</li>
                <li>Recomendamos alterar sua senha no primeiro acesso</li>
                <li>Mantenha suas credenciais seguras</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_SUPABASE_URL?.replace('supabase.co', 'vercel.app') || 'https://sispac.vercel.app'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🚀 Acessar SisPAC
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
              Se você não solicitou esta conta, ignore este e-mail.<br>
              <strong>SisPAC</strong> - Sistema de Avaliação de Candidatos
            </p>
          </div>
        </div>
      `
      
      // Enviar e-mail usando nossa API
      const emailResponse = await fetch(`${process.env.VITE_SUPABASE_URL?.replace('supabase.co', 'vercel.app') || 'https://sispac.vercel.app'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: authData.user.email,
          subject: emailSubject,
          html: emailBody
        })
      })
      
      const emailResult = await emailResponse.json()
      const emailError = !emailResponse.ok ? emailResult : null
      
      if (emailError) {
        console.error('❌ [addUserSimple] Erro ao enviar e-mail:', emailError)
        // Não falhar a criação do usuário se o e-mail falhar
        console.log('⚠️ [addUserSimple] Usuário criado, mas e-mail não foi enviado')
      } else {
        console.log('✅ [addUserSimple] E-mail de boas-vindas enviado com sucesso')
      }
      
    } catch (emailError) {
      console.error('❌ [addUserSimple] Erro ao enviar e-mail:', emailError)
      // Não falhar a criação do usuário se o e-mail falhar
      console.log('⚠️ [addUserSimple] Usuário criado, mas e-mail não foi enviado')
    }
    
    const response = {
      success: true,
      message: `Usuário ${name.trim()} criado com sucesso! Senha temporária: ${password}`,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: normalizedRole,
        full_name: name.trim()
      },
      profileCreated: true,
      emailSent: true
    }
    
    console.log('✅ [addUserSimple] Resposta final:', response)
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('❌ [addUserSimple] Erro geral:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
