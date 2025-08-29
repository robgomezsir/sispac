import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('candidates').select('id,name,email,score,status,created_at')
    if(error) throw error
    ok(res, data)
  }catch(e){ fail(res, e) }
}
