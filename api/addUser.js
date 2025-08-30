import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const { name, email, role } = req.body || {}
    if(!email) throw new Error('email obrigatório')
    const supabase = getSupabaseAdmin()
    
    // Criar usuário auth (senha aleatória de 4 dígitos)
    const password = ('' + Math.floor(1000 + Math.random()*9000))
    const { data, error } = await supabase.auth.admin.createUser({
      email, 
      password, 
      email_confirm: true, 
      user_metadata: { name, role: role || 'rh' }
    })
    
    if(error) throw error
    
    // Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: role || 'rh',
        password_set: false // Usuário convidado ainda não definiu senha
      })
    
    if(profileError) {
      console.error('⚠️ Erro ao criar perfil:', profileError)
      // Não falhar se o perfil não puder ser criado, apenas logar
    }
    
    ok(res, { 
      message: `Usuário criado com senha ${password}`,
      userId: data.user.id,
      profileCreated: !profileError
    })
  }catch(e){ 
    fail(res, e) 
  }
}
