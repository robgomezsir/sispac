import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Verificar se é POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }
    
    // Validar autenticação e permissões
    try {
      await assertAuth(req)
    } catch (authError) {
      console.error('❌ [addUser] Erro de autenticação:', authError.message)
      return res.status(401).json({ error: 'Token de autorização inválido' })
    }
    
    const { name, email, role } = req.body || {}
    
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
    
    // Validação de role
    const validRoles = ['rh', 'admin']
    if(role && !validRoles.includes(role)) {
      return fail(res, { message: 'Role inválido. Use "rh" ou "admin"' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Verificar se o usuário já existe na tabela profiles
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    
    if(checkError) {
      console.error('❌ Erro ao verificar perfil existente:', checkError)
      return fail(res, { message: 'Erro ao verificar perfil existente' }, 500)
    }
    
    if(existingProfile) {
      return fail(res, { message: 'Usuário com este email já existe' }, 409)
    }
    
    // Criar usuário auth (senha aleatória de 6 dígitos)
    const password = Math.floor(100000 + Math.random() * 900000).toString()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(), 
      password, 
      email_confirm: true, 
      user_metadata: { 
        name: name.trim(), 
        role: role || 'rh',
        created_by: req.user.email,
        created_at: new Date().toISOString()
      }
    })
    
    if(error) {
      console.error('❌ Erro ao criar usuário:', error)
      return fail(res, { message: 'Erro ao criar usuário: ' + error.message }, 500)
    }
    
    // Validar e normalizar role
    const validRoles = ['admin', 'rh', 'user']
    const normalizedRole = validRoles.includes(role) ? role : 'rh'
    
    console.log('🔍 [addUser] Role recebido:', role, 'Role normalizado:', normalizedRole)
    
    // Criar perfil na tabela profiles com ID independente
    const profileData = {
      id: data.user.id, // Usar o ID do usuário criado no auth
      email: data.user.email,
      role: normalizedRole,
      full_name: name.trim(),
      is_active: true,
      created_at: new Date().toISOString()
    }
    
    console.log('🔍 [addUser] ID do usuário auth:', data.user.id)
    console.log('🔍 [addUser] Email do usuário auth:', data.user.email)
    
    console.log('📝 [addUser] Dados do perfil a serem inseridos:', profileData)
    
    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
    
    if(profileError) {
      console.error('⚠️ Erro ao criar perfil:', profileError)
      console.error('⚠️ Detalhes do erro:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // Tentar deletar o usuário criado se o perfil falhar
      try {
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('✅ Usuário auth removido após falha no perfil')
      } catch (deleteError) {
        console.error('❌ Erro ao deletar usuário após falha no perfil:', deleteError)
      }
      return fail(res, { 
        message: 'Erro ao criar perfil: ' + profileError.message,
        details: profileError.details,
        code: profileError.code
      }, 500)
    }
    
    console.log('✅ Perfil criado com sucesso:', profileResult)
    
    console.log('✅ Usuário criado com sucesso:', { email: data.user.email, role: role || 'rh' })
    
    ok(res, { 
      message: `Usuário ${name.trim()} criado com sucesso! Senha temporária: ${password}`,
      userId: data.user.id,
      email: data.user.email,
      role: role || 'rh',
      profileCreated: true
    })
    
  }catch(e){ 
    console.error('❌ Erro na API addUser:', e)
    fail(res, e) 
  }
}
