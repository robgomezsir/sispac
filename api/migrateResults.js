import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res) {
  console.log('🔄 [MigrateResults] API chamada com método:', req.method)
  console.log('🔄 [MigrateResults] Headers:', req.headers)
  console.log('🔄 [MigrateResults] URL:', req.url)
  
  // Permitir tanto POST quanto GET para debugging
  if (req.method !== 'POST' && req.method !== 'GET') {
    console.log('❌ [MigrateResults] Método não permitido:', req.method)
    return res.status(405).json({ 
      error: 'Método não permitido',
      allowedMethods: ['POST', 'GET'],
      receivedMethod: req.method
    })
  }

  try {
    console.log('🔄 [MigrateResults] Iniciando validação de autenticação...')
    
    // Validar autenticação e permissões
    await assertAuth(req)
    
    console.log('✅ [MigrateResults] Autenticação validada com sucesso')
    
    const supabase = getSupabaseAdmin()
    console.log('✅ [MigrateResults] Cliente Supabase admin obtido')
    
    console.log('🔄 [MigrateResults] Iniciando busca de candidatos...')
    
    // Buscar todos os candidatos existentes
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (candidatesError) {
      console.error('❌ [MigrateResults] Erro ao buscar candidatos:', candidatesError)
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`)
    }
    
    console.log(`📊 [MigrateResults] Candidatos encontrados: ${candidates?.length || 0}`)
    
    if (!candidates || candidates.length === 0) {
      console.log('ℹ️ [MigrateResults] Nenhum candidato encontrado para migração')
      return res.status(200).json({ 
        message: 'Nenhum candidato encontrado para migração',
        migrated: 0,
        total: 0,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log(`📊 [MigrateResults] Encontrados ${candidates.length} candidatos para migração`)
    
    let migratedCount = 0
    let errorCount = 0
    const errors = []
    
    // Processar cada candidato
    for (const candidate of candidates) {
      try {
        console.log(`🔄 [MigrateResults] Processando candidato ${candidate.id}: ${candidate.name}`)
        
        // Verificar se já existem resultados para este candidato
        const { data: existingResults, error: checkError } = await supabase
          .from('results')
          .select('id')
          .eq('candidate_id', candidate.id)
          .limit(1)
        
        if (checkError) {
          console.warn(`⚠️ [MigrateResults] Erro ao verificar resultados para candidato ${candidate.id}:`, checkError.message)
          continue
        }
        
        if (existingResults && existingResults.length > 0) {
          console.log(`⏭️ [MigrateResults] Candidato ${candidate.id} já possui resultados, pulando...`)
          continue
        }
        
        // Se não tem respostas, pular
        if (!candidate.answers || Object.keys(candidate.answers).length === 0) {
          console.log(`⏭️ [MigrateResults] Candidato ${candidate.id} não possui respostas, pulando...`)
          continue
        }
        
        console.log(`📝 [MigrateResults] Candidato ${candidate.id} tem ${Object.keys(candidate.answers).length} questões`)
        
        // Criar resultados baseados nas respostas existentes
        const resultsToInsert = Object.entries(candidate.answers).map(([questionId, selectedAnswers]) => {
          return {
            candidate_id: candidate.id,
            question_id: parseInt(questionId),
            question_title: `Questão ${questionId}`,
            selected_answers: Array.isArray(selectedAnswers) ? selectedAnswers : [selectedAnswers],
            max_choices: 5, // Valor padrão
            question_category: 'comportamental',
            question_weight: 1.00,
            score_question: 0, // Não temos o score individual histórico
            is_correct: false // Não temos essa informação histórica
          }
        })
        
        console.log(`💾 [MigrateResults] Inserindo ${resultsToInsert.length} resultados para candidato ${candidate.id}`)
        
        // Inserir resultados
        const { error: insertError } = await supabase
          .from('results')
          .insert(resultsToInsert)
        
        if (insertError) {
          console.error(`❌ [MigrateResults] Erro ao inserir resultados para candidato ${candidate.id}:`, insertError)
          throw new Error(`Erro ao inserir resultados: ${insertError.message}`)
        }
        
        console.log(`✅ [MigrateResults] Candidato ${candidate.id} migrado com sucesso`)
        migratedCount++
        
      } catch (candidateError) {
        console.error(`❌ [MigrateResults] Erro ao migrar candidato ${candidate.id}:`, candidateError.message)
        errorCount++
        errors.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          error: candidateError.message
        })
      }
    }
    
    console.log(`🎉 [MigrateResults] Migração concluída: ${migratedCount} candidatos migrados, ${errorCount} erros`)
    
    const response = {
      message: 'Migração concluída com sucesso',
      migrated: migratedCount,
      errors: errorCount,
      total: candidates.length,
      errorDetails: errors,
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ [MigrateResults] Enviando resposta:', response)
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('❌ [MigrateResults] Erro na migração:', error)
    
    const errorResponse = {
      message: 'Erro durante a migração',
      error: error.message,
      timestamp: new Date().toISOString()
    }
    
    console.log('❌ [MigrateResults] Enviando resposta de erro:', errorResponse)
    
    return res.status(500).json(errorResponse)
  }
}
