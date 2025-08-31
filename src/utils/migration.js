import { supabase } from '../lib/supabase'

/**
 * Função de migração que executa diretamente no frontend
 * Contorna as limitações das APIs do Vercel
 */
export async function migrateCandidatesToResults() {
  console.log('🔄 [Migration] Iniciando migração direta via frontend...')
  
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }
    
    console.log('✅ [Migration] Usuário autenticado:', user.email)
    
    // 2. Buscar todos os candidatos existentes
    console.log('🔄 [Migration] Buscando candidatos...')
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (candidatesError) {
      console.error('❌ [Migration] Erro ao buscar candidatos:', candidatesError)
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`)
    }
    
    if (!candidates || candidates.length === 0) {
      console.log('ℹ️ [Migration] Nenhum candidato encontrado')
      return {
        success: true,
        message: 'Nenhum candidato encontrado para migração',
        migrated: 0,
        total: 0
      }
    }
    
    console.log(`📊 [Migration] Encontrados ${candidates.length} candidatos`)
    
    // 3. Processar cada candidato
    let migratedCount = 0
    let errorCount = 0
    const errors = []
    const results = []
    
    for (const candidate of candidates) {
      try {
        console.log(`🔄 [Migration] Processando candidato ${candidate.id}: ${candidate.name}`)
        
        // Verificar se já existem resultados para este candidato
        const { data: existingResults, error: checkError } = await supabase
          .from('results')
          .select('id')
          .eq('candidate_id', candidate.id)
          .limit(1)
        
        if (checkError) {
          console.warn(`⚠️ [Migration] Erro ao verificar resultados para candidato ${candidate.id}:`, checkError.message)
          continue
        }
        
        if (existingResults && existingResults.length > 0) {
          console.log(`⏭️ [Migration] Candidato ${candidate.id} já possui resultados, pulando...`)
          continue
        }
        
        // Se não tem respostas, pular
        if (!candidate.answers || Object.keys(candidate.answers).length === 0) {
          console.log(`⏭️ [Migration] Candidato ${candidate.id} não possui respostas, pulando...`)
          continue
        }
        
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
        
        console.log(`📝 [Migration] Candidato ${candidate.id} tem ${resultsToInsert.length} questões`)
        
        // Inserir resultados
        const { error: insertError } = await supabase
          .from('results')
          .insert(resultsToInsert)
        
        if (insertError) {
          console.error(`❌ [Migration] Erro ao inserir resultados para candidato ${candidate.id}:`, insertError)
          throw new Error(`Erro ao inserir resultados: ${insertError.message}`)
        }
        
        console.log(`✅ [Migration] Candidato ${candidate.id} migrado com sucesso`)
        migratedCount++
        
        // Adicionar aos resultados para retorno
        results.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          questionsMigrated: resultsToInsert.length
        })
        
      } catch (candidateError) {
        console.error(`❌ [Migration] Erro ao migrar candidato ${candidate.id}:`, candidateError.message)
        errorCount++
        errors.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          error: candidateError.message
        })
      }
    }
    
    console.log(`🎉 [Migration] Migração concluída: ${migratedCount} candidatos migrados, ${errorCount} erros`)
    
    return {
      success: true,
      message: 'Migração concluída com sucesso',
      migrated: migratedCount,
      errors: errorCount,
      total: candidates.length,
      results: results,
      errorDetails: errors,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ [Migration] Erro na migração:', error)
    
    return {
      success: false,
      message: 'Erro durante a migração',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Função para verificar status da migração
 */
export async function checkMigrationStatus() {
  try {
    // Verificar se a tabela results existe e tem dados
    const { data: resultsCount, error: resultsError } = await supabase
      .from('results')
      .select('id', { count: 'exact' })
    
    if (resultsError) {
      return {
        hasResultsTable: false,
        resultsCount: 0,
        error: resultsError.message
      }
    }
    
    // Verificar candidatos
    const { data: candidatesCount, error: candidatesError } = await supabase
      .from('candidates')
      .select('id', { count: 'exact' })
    
    if (candidatesError) {
      return {
        hasResultsTable: true,
        resultsCount: resultsCount?.length || 0,
        candidatesCount: 0,
        error: candidatesError.message
      }
    }
    
    return {
      hasResultsTable: true,
      resultsCount: resultsCount?.length || 0,
      candidatesCount: candidatesCount?.length || 0,
      migrationRatio: candidatesCount?.length > 0 ? 
        Math.round((resultsCount?.length || 0) / candidatesCount.length * 100) : 0
    }
    
  } catch (error) {
    return {
      hasResultsTable: false,
      resultsCount: 0,
      error: error.message
    }
  }
}

/**
 * Função para limpar dados de teste da tabela results
 */
export async function clearTestResults() {
  try {
    console.log('🧹 [Migration] Limpando resultados de teste...')
    
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .eq('question_category', 'teste')
    
    if (deleteError) {
      throw new Error(`Erro ao limpar resultados de teste: ${deleteError.message}`)
    }
    
    console.log('✅ [Migration] Resultados de teste limpos com sucesso')
    
    return {
      success: true,
      message: 'Resultados de teste limpos com sucesso'
    }
    
  } catch (error) {
    console.error('❌ [Migration] Erro ao limpar resultados de teste:', error)
    
    return {
      success: false,
      message: 'Erro ao limpar resultados de teste',
      error: error.message
    }
  }
}
