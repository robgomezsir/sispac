import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Método não permitido',
        message: 'Apenas requisições POST são aceitas'
      })
    }
    
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const { email } = req.body || {}
    
    if(!email || !email.trim()) {
      return res.status(400).json({ 
        error: 'Email é obrigatório',
        message: 'O campo email é obrigatório para remover um candidato'
      })
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
        return res.status(404).json({ 
          error: 'Candidato não encontrado',
          message: 'Candidato não encontrado com este email'
        })
      }
      console.error('❌ [deleteCandidate] Erro ao buscar candidato:', searchError)
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao buscar candidato: ' + searchError.message
      })
    }
    
    if(!candidate) {
      return res.status(404).json({ 
        error: 'Candidato não encontrado',
        message: 'Candidato não encontrado com este email'
      })
    }
    
    console.log('✅ [deleteCandidate] Candidato encontrado:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    // Remover candidato da tabela candidates
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidate.id)
    
    if(deleteError) {
      console.error('❌ [deleteCandidate] Erro ao remover candidato:', deleteError)
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao remover candidato: ' + deleteError.message
      })
    }
    
    console.log('✅ [deleteCandidate] Candidato removido com sucesso:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    // Retornar resposta de sucesso
    return res.status(200).json({ 
      success: true,
      message: 'Candidato removido com sucesso',
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    })
    
  }catch(e){ 
    console.error('❌ [deleteCandidate] Erro na API:', e)
    
    // Garantir que sempre retornamos uma resposta válida
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado ao processar a requisição',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    })
  }
}
