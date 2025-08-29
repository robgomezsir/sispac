import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const { email } = req.body || {}
    if(!email) throw new Error('email obrigatório')
    const supabase = getSupabaseAdmin()
    const { data: list, error } = await supabase.auth.admin.listUsers()
    if(error) throw error
    const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if(!user) throw new Error('Usuário não encontrado')
    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
    if(delErr) throw delErr
    ok(res, { message: 'Usuário removido' })
  }catch(e){ fail(res, e) }
}
