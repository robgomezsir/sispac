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
    
    console.log('🔍 [deleteCandidate] Buscando candidato com email:', email)
    
    // Primeiro, buscar o candidato para verificar se existe
    const { data: candidate, error: searchError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .eq('email', email.trim().toLowerCase())
      .single()
    
    if(searchError) {
      if(searchError.code === 'PGRST116') {
        return fail(res, { message: 'Candidato não encontrado com este email' }, 404)
      }
      console.error('❌ [deleteCandidate] Erro ao buscar candidato:', searchError)
      return fail(res, { message: 'Erro ao buscar candidato: ' + searchError.message }, 500)
    }
    
    if(!candidate) {
      return fail(res, { message: 'Candidato não encontrado com este email' }, 404)
    }
    
    console.log('✅ [deleteCandidate] Candidato encontrado:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    // Remover candidato da tabela candidates
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidate.id)
    
    if(deleteError) {
      console.error('❌ [deleteCandidate] Erro ao remover candidato:', deleteError)
      return fail(res, { message: 'Erro ao remover candidato: ' + deleteError.message }, 500)
    }
    
    console.log('✅ [deleteCandidate] Candidato removido com sucesso:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    ok(res, { 
      message: 'Candidato removido com sucesso',
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    })
    
  }catch(e){ 
    console.error('❌ [deleteCandidate] Erro na API:', e)
    fail(res, e) 
  }
}
