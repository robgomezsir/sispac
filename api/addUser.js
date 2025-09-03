import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
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
    
    // Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: role || 'rh',
        full_name: name.trim(),
        is_active: true,
        created_at: new Date().toISOString()
      })
    
    if(profileError) {
      console.error('⚠️ Erro ao criar perfil:', profileError)
      // Tentar deletar o usuário criado se o perfil falhar
      try {
        await supabase.auth.admin.deleteUser(data.user.id)
      } catch (deleteError) {
        console.error('❌ Erro ao deletar usuário após falha no perfil:', deleteError)
      }
      return fail(res, { message: 'Usuário criado mas erro ao criar perfil. Usuário removido.' }, 500)
    }
    
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
