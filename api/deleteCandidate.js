import { getSupabaseAdmin } from './_utils.js'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res){
  try{
    // Validar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Método não permitido',
        message: 'Apenas requisições POST são aceitas'
      })
    }
    
    // Verificar se há token de autorização
    const header = req.headers['authorization'] || req.headers['Authorization']
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autorização não fornecido',
        message: 'É necessário fornecer um token de autorização válido'
      })
    }
    
    const token = header.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de autorização inválido'
      })
    }
    
    // Validar token JWT do Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ 
        error: 'Configuração do Supabase não encontrada',
        message: 'Erro de configuração do servidor'
      })
    }
    
    // Criar cliente Supabase para validar token
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verificar se o token é válido
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado',
        message: 'Sua sessão expirou. Faça login novamente.'
      })
    }
    
    console.log('✅ [deleteCandidate] Usuário autenticado:', { id: user.id, email: user.email })
    
    // Obter parâmetros da requisição
    const { email, id, name } = req.body || {}
    
    if (!email && !id && !name) {
      return res.status(400).json({ 
        error: 'Parâmetro obrigatório',
        message: 'É necessário fornecer email, ID ou nome do candidato'
      })
    }
    
    // Criar cliente admin para operações no banco
    const supabaseAdmin = getSupabaseAdmin()
    
    let candidate = null
    let searchError = null
    
    // Buscar candidato por ID (prioridade)
    if (id) {
      console.log('🔍 [deleteCandidate] Buscando candidato por ID:', id)
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .select('id, name, email')
        .eq('id', id)
        .single()
      
      if (!error && data) {
        candidate = data
      } else {
        searchError = error
      }
    }
    
    // Se não encontrou por ID, buscar por email
    if (!candidate && email) {
      console.log('🔍 [deleteCandidate] Buscando candidato por email:', email)
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .select('id, name, email')
        .eq('email', email.trim().toLowerCase())
        .single()
      
      if (!error && data) {
        candidate = data
      } else {
        searchError = error
      }
    }
    
    // Se não encontrou por email, buscar por nome
    if (!candidate && name) {
      console.log('🔍 [deleteCandidate] Buscando candidato por nome:', name)
      const { data, error } = await supabaseAdmin
        .from('candidates')
        .select('id, name, email')
        .ilike('name', `%${name.trim()}%`)
        .single()
      
      if (!error && data) {
        candidate = data
      } else {
        searchError = error
      }
    }
    
    // Verificar se encontrou o candidato
    if (!candidate) {
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
    
    // Tentar remover da tabela results se existir
    try {
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
