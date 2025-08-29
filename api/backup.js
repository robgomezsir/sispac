import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const supabase = getSupabaseAdmin()
    const { data: candidates } = await supabase.from('candidates').select('*')
    const { data: results } = await supabase.from('results').select('*')
    ok(res, { message: 'Backup gerado', candidates, results })
  }catch(e){ fail(res, e) }
}
