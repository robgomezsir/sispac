import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  console.log('🔄 [SimpleMigrate] API chamada com método:', req.method)
  console.log('🔄 [SimpleMigrate] Headers:', req.headers)
  console.log('🔄 [SimpleMigrate] URL:', req.url)
  
  // Permitir tanto POST quanto GET para debugging
  if (req.method !== 'POST' && req.method !== 'GET') {
    console.log('❌ [SimpleMigrate] Método não permitido:', req.method)
    return res.status(405).json({ 
      error: 'Método não permitido',
      allowedMethods: ['POST', 'GET'],
      receivedMethod: req.method
    })
  }

  try {
    console.log('🔄 [SimpleMigrate] Iniciando teste de conexão...')
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
    
    console.log('🔍 [SimpleMigrate] SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado')
    console.log('🔍 [SimpleMigrate] SUPABASE_SERVICE_ROLE:', supabaseServiceKey ? '✅ Configurado' : '❌ Não configurado')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }
    
    // Criar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ [SimpleMigrate] Cliente Supabase criado com service role')
    
    // Testar conexão simples
    console.log('🔄 [SimpleMigrate] Testando conexão com Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('candidates')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ [SimpleMigrate] Erro ao conectar com Supabase:', testError)
      throw new Error(`Erro de conexão: ${testError.message}`)
    }
    
    console.log('✅ [SimpleMigrate] Conexão com Supabase estabelecida com sucesso')
    
    // Se for GET, retornar status
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'API de migração funcionando!',
        method: req.method,
        connection: '✅ Conectado ao Supabase',
        timestamp: new Date().toISOString(),
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE
        }
      })
    }
    
    // Se for POST, executar migração simples
    console.log('🔄 [SimpleMigrate] Executando migração...')
    
    // Buscar candidatos
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, answers')
      .limit(5) // Limitar para teste
    
    if (candidatesError) {
      console.error('❌ [SimpleMigrate] Erro ao buscar candidatos:', candidatesError)
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`)
    }
    
    console.log(`📊 [SimpleMigrate] Encontrados ${candidates?.length || 0} candidatos`)
    
    if (!candidates || candidates.length === 0) {
      return res.status(200).json({
        message: 'Nenhum candidato encontrado para migração',
        migrated: 0,
        total: 0,
        timestamp: new Date().toISOString()
      })
    }
    
    // Tentar inserir um resultado de teste
    const testCandidate = candidates[0]
    console.log(`🧪 [SimpleMigrate] Testando inserção com candidato: ${testCandidate.name}`)
    
    if (testCandidate.answers && Object.keys(testCandidate.answers).length > 0) {
      const testResult = {
        candidate_id: testCandidate.id,
        question_id: 1,
        question_title: 'Questão 1 (Teste)',
        selected_answers: ['TESTE'],
        max_choices: 5,
        question_category: 'teste',
        question_weight: 1.00,
        score_question: 0,
        is_correct: false
      }
      
      const { error: insertError } = await supabase
        .from('results')
        .insert(testResult)
      
      if (insertError) {
        console.error('❌ [SimpleMigrate] Erro ao inserir resultado de teste:', insertError)
        throw new Error(`Erro ao inserir resultado: ${insertError.message}`)
      }
      
      console.log('✅ [SimpleMigrate] Resultado de teste inserido com sucesso')
      
      return res.status(200).json({
        message: 'Teste de migração executado com sucesso',
        migrated: 1,
        total: candidates.length,
        testResult: testResult,
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(200).json({
        message: 'Candidato encontrado mas sem respostas para migrar',
        migrated: 0,
        total: candidates.length,
        candidate: testCandidate,
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('❌ [SimpleMigrate] Erro na migração:', error)
    
    const errorResponse = {
      message: 'Erro durante a migração',
      error: error.message,
      timestamp: new Date().toISOString()
    }
    
    console.log('❌ [SimpleMigrate] Enviando resposta de erro:', errorResponse)
    
    return res.status(500).json(errorResponse)
  }
}
