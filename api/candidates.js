import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('id,name,email,score,status,created_at')
      .order('created_at', { ascending: false })
    
    if(error) {
      console.error('❌ Erro ao buscar candidatos:', error)
      return fail(res, { message: 'Erro ao buscar candidatos: ' + error.message }, 500)
    }
    
    console.log('✅ Candidatos buscados com sucesso:', { count: data?.length || 0 })
    
    ok(res, data || [])
    
  }catch(e){ 
    console.error('❌ Erro na API candidates:', e)
    fail(res, e) 
  }
}
