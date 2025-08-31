import { getSupabaseAdmin, assertAuth, ok, fail } from '../../_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const id = req.query.id
    
    if(!id) {
      return fail(res, { message: 'ID do candidato é obrigatório' }, 400)
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()
    
    if(error) {
      if(error.code === 'PGRST116') {
        return fail(res, { message: 'Candidato não encontrado' }, 404)
      }
      console.error('❌ Erro ao buscar candidato:', error)
      return fail(res, { message: 'Erro ao buscar candidato: ' + error.message }, 500)
    }
    
    console.log('✅ Candidato buscado com sucesso:', { id })
    
    ok(res, data)
    
  }catch(e){ 
    console.error('❌ Erro na API candidate/[id]:', e)
    fail(res, e) 
  }
}
