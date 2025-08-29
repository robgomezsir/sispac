import { getSupabaseAdmin, assertAuth, ok, fail } from '../../_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const id = req.query.id
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('results').select('*').eq('candidate_id', id).single()
    if(error) throw error
    ok(res, data)
  }catch(e){ fail(res, e) }
}
