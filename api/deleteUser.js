import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const { email } = req.body || {}
    
    if(!email || !email.trim()) {
      return fail(res, { message: 'Email é obrigatório' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar usuário na tabela profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.trim().toLowerCase())
      .single()
    
    if(error) {
      console.error('❌ Erro ao buscar perfil:', error)
      return fail(res, { message: 'Usuário não encontrado' }, 404)
    }
    
    if(!profile) {
      return fail(res, { message: 'Usuário não encontrado' }, 404)
    }
    
    // Verificar se não está tentando deletar a si mesmo
    if(profile.id === req.user.id) {
      return fail(res, { message: 'Não é possível deletar sua própria conta' }, 400)
    }
    
    // Verificar se não está tentando deletar o usuário admin principal
    if(profile.email === 'robgomez.sir@gmail.com') {
      return fail(res, { message: 'Não é possível deletar o usuário administrador principal' }, 400)
    }
    
    // Deletar perfil primeiro
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)
      
      if(profileError) {
        console.warn('⚠️ Erro ao deletar perfil:', profileError)
      }
    } catch (profileError) {
      console.warn('⚠️ Erro ao deletar perfil:', profileError)
    }
    
    // Deletar usuário auth
    const { error: delErr } = await supabase.auth.admin.deleteUser(profile.id)
    
    if(delErr) {
      console.error('❌ Erro ao deletar usuário:', delErr)
      return fail(res, { message: 'Erro ao deletar usuário: ' + delErr.message }, 500)
    }
    
    console.log('✅ Usuário deletado com sucesso:', { email: profile.email })
    
    ok(res, { message: `Usuário ${profile.email} removido com sucesso` })
    
  }catch(e){ 
    console.error('❌ Erro na API deleteUser:', e)
    fail(res, e) 
  }
}
