import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res){
  console.log('🚀 [deleteCandidate] API iniciada')
  console.log('📋 [deleteCandidate] Método:', req.method)
  console.log('📋 [deleteCandidate] Headers:', JSON.stringify(req.headers, null, 2))
  console.log('📋 [deleteCandidate] Body:', JSON.stringify(req.body, null, 2))
  
  try{
    // Validar método HTTP
    if (req.method !== 'POST') {
      console.log('❌ [deleteCandidate] Método não permitido:', req.method)
      return res.status(405).json({ 
        error: 'Método não permitido',
        message: 'Apenas requisições POST são aceitas'
      })
    }
    
    // Verificar se há token de autorização
    const header = req.headers['authorization'] || req.headers['Authorization']
    if (!header || !header.startsWith('Bearer ')) {
      console.log('❌ [deleteCandidate] Token de autorização não fornecido')
      return res.status(401).json({ 
        error: 'Token de autorização não fornecido',
        message: 'É necessário fornecer um token de autorização válido'
      })
    }
    
    const token = header.split(' ')[1]
    if (!token) {
      console.log('❌ [deleteCandidate] Token inválido')
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de autorização inválido'
      })
    }
    
    console.log('✅ [deleteCandidate] Token extraído com sucesso')
    
    // Verificar configuração do Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ [deleteCandidate] Configuração do Supabase não encontrada')
      return res.status(500).json({ 
        error: 'Configuração do servidor',
        message: 'Configuração do Supabase não encontrada'
      })
    }
    
    // Criar cliente Supabase admin
    console.log('🔧 [deleteCandidate] Criando cliente Supabase admin')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ [deleteCandidate] Cliente Supabase admin criado')
    
    // Obter parâmetros da requisição
    const { email, id, name } = req.body || {}
    console.log('📋 [deleteCandidate] Parâmetros recebidos:', { email, id, name })
    
    if (!email && !id && !name) {
      console.log('❌ [deleteCandidate] Nenhum parâmetro fornecido')
      return res.status(400).json({ 
        error: 'Parâmetro obrigatório',
        message: 'É necessário fornecer email, ID ou nome do candidato'
      })
    }
    
    let candidate = null
    let searchError = null
    
    // Buscar candidato por ID (prioridade)
    if (id) {
      console.log('🔍 [deleteCandidate] Buscando candidato por ID:', id)
      try {
        const { data, error } = await supabaseAdmin
          .from('candidates')
          .select('id, name, email')
          .eq('id', id)
          .single()
        
        if (!error && data) {
          candidate = data
          console.log('✅ [deleteCandidate] Candidato encontrado por ID:', candidate)
        } else {
          searchError = error
          console.log('❌ [deleteCandidate] Erro ao buscar por ID:', error)
        }
      } catch (error) {
        searchError = error
        console.log('❌ [deleteCandidate] Exceção ao buscar por ID:', error)
      }
    }
    
    // Se não encontrou por ID, buscar por email
    if (!candidate && email) {
      console.log('🔍 [deleteCandidate] Buscando candidato por email:', email)
      try {
        const { data, error } = await supabaseAdmin
          .from('candidates')
          .select('id, name, email')
          .eq('email', email.trim().toLowerCase())
          .single()
        
        if (!error && data) {
          candidate = data
          console.log('✅ [deleteCandidate] Candidato encontrado por email:', candidate)
        } else {
          searchError = error
          console.log('❌ [deleteCandidate] Erro ao buscar por email:', error)
        }
      } catch (error) {
        searchError = error
        console.log('❌ [deleteCandidate] Exceção ao buscar por email:', error)
      }
    }
    
    // Se não encontrou por email, buscar por nome
    if (!candidate && name) {
      console.log('🔍 [deleteCandidate] Buscando candidato por nome:', name)
      try {
        const { data, error } = await supabaseAdmin
          .from('candidates')
          .select('id, name, email')
          .ilike('name', `%${name.trim()}%`)
          .single()
        
        if (!error && data) {
          candidate = data
          console.log('✅ [deleteCandidate] Candidato encontrado por nome:', candidate)
        } else {
          searchError = error
          console.log('❌ [deleteCandidate] Erro ao buscar por nome:', error)
        }
      } catch (error) {
        searchError = error
        console.log('❌ [deleteCandidate] Exceção ao buscar por nome:', error)
      }
    }
    
    // Verificar se encontrou o candidato
    if (!candidate) {
      console.log('❌ [deleteCandidate] Nenhum candidato encontrado')
      if (searchError && searchError.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Candidato não encontrado',
          message: 'Nenhum candidato encontrado com os dados fornecidos'
        })
      }
      
      console.error('❌ [deleteCandidate] Erro ao buscar candidato:', searchError)
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao buscar candidato no banco de dados'
      })
    }
    
    console.log('✅ [deleteCandidate] Candidato encontrado:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    // Remover candidato da tabela candidates
    console.log('🗑️ [deleteCandidate] Removendo candidato da tabela candidates')
    try {
      const { error: deleteError } = await supabaseAdmin
        .from('candidates')
        .delete()
        .eq('id', candidate.id)
      
      if (deleteError) {
        console.error('❌ [deleteCandidate] Erro ao remover candidato:', deleteError)
        return res.status(500).json({ 
          error: 'Erro interno',
          message: 'Erro ao remover candidato do banco de dados'
        })
      }
      
      console.log('✅ [deleteCandidate] Candidato removido da tabela candidates')
    } catch (error) {
      console.error('❌ [deleteCandidate] Exceção ao remover candidato:', error)
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao remover candidato do banco de dados'
      })
    }
    
    // Tentar remover da tabela results se existir
    try {
      console.log('🗑️ [deleteCandidate] Tentando remover da tabela results')
      const { error: resultsDeleteError } = await supabaseAdmin
        .from('results')
        .delete()
        .eq('candidate_id', candidate.id)
      
      if (resultsDeleteError) {
        console.log('⚠️ [deleteCandidate] Tabela results não encontrada ou erro ao remover:', resultsDeleteError.message)
      } else {
        console.log('✅ [deleteCandidate] Resultados removidos da tabela results')
      }
    } catch (resultsError) {
      console.log('⚠️ [deleteCandidate] Tabela results não existe ou erro ao acessar:', resultsError.message)
    }
    
    console.log('✅ [deleteCandidate] Candidato removido com sucesso:', { id: candidate.id, name: candidate.name, email: candidate.email })
    
    // Preparar resposta de sucesso
    const responseData = { 
      success: true,
      message: 'Candidato removido com sucesso',
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    }
    
    console.log('📤 [deleteCandidate] Enviando resposta:', responseData)
    
    // Retornar resposta de sucesso
    return res.status(200).json(responseData)
    
  }catch(e){ 
    console.error('❌ [deleteCandidate] Erro na API:', e)
    console.error('❌ [deleteCandidate] Stack trace:', e.stack)
    
    // Garantir que sempre retornamos uma resposta válida
    const errorResponse = { 
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado ao processar a requisição',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }
    
    console.log('📤 [deleteCandidate] Enviando resposta de erro:', errorResponse)
    return res.status(500).json(errorResponse)
  }
}
