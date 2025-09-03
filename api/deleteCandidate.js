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
    
    // Buscar candidato
    const { data: candidate, error: searchError } = await supabase
      .from('candidates')
      .select('id, name, email')
      .eq('email', email.trim().toLowerCase())
      .single()
    
    if(searchError) {
      console.error('❌ Erro ao buscar candidato:', searchError)
      return fail(res, { message: 'Candidato não encontrado' }, 404)
    }
    
    if(!candidate) {
      return fail(res, { message: 'Candidato não encontrado' }, 404)
    }
    
    // Remover candidato
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidate.id)
    
    if(deleteError) {
      console.error('❌ Erro ao remover candidato:', deleteError)
      return fail(res, { 
        message: 'Erro ao remover candidato: ' + deleteError.message,
        details: deleteError.details,
        code: deleteError.code
      }, 500)
    }
    
    console.log('✅ Candidato removido com sucesso:', { email: candidate.email })
    
    ok(res, { 
      message: `Candidato "${candidate.name}" removido com sucesso!`,
      candidate: candidate
    })
    
  }catch(e){ 
    console.error('❌ Erro na API deleteCandidate:', e)
    fail(res, e) 
  }
}