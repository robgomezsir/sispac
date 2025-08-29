import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const supabase = getSupabaseAdmin()
    await supabase.from('results').delete().neq('id', 0)
    await supabase.from('candidates').delete().neq('id', 0)
    ok(res, { message: 'Tudo limpo' })
  }catch(e){ fail(res, e) }
}
