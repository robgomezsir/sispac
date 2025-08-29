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
      email, password, email_confirm: true, user_metadata: { name, role: role || 'rh' }
    })
    if(error) throw error
    ok(res, { message: `Usuário criado com senha ${password}` })
  }catch(e){ fail(res, e) }
}
