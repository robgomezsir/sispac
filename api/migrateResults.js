import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return fail(res, { message: 'Método não permitido' }, 405)
  }

  try {
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    console.log('🔄 [MigrateResults] Iniciando migração de dados...')
    
    // Buscar todos os candidatos existentes
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (candidatesError) {
      throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`)
    }
    
    if (!candidates || candidates.length === 0) {
      return ok(res, { 
        message: 'Nenhum candidato encontrado para migração',
        migrated: 0,
        total: 0
      })
    }
    
    console.log(`📊 [MigrateResults] Encontrados ${candidates.length} candidatos para migração`)
    
    let migratedCount = 0
    let errorCount = 0
    const errors = []
    
    // Processar cada candidato
    for (const candidate of candidates) {
      try {
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
        
        // Inserir resultados
        const { error: insertError } = await supabase
          .from('results')
          .insert(resultsToInsert)
        
        if (insertError) {
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
    
    return ok(res, {
      message: 'Migração concluída com sucesso',
      migrated: migratedCount,
      errors: errorCount,
      total: candidates.length,
      errorDetails: errors
    })
    
  } catch (error) {
    console.error('❌ [MigrateResults] Erro na migração:', error)
    return fail(res, { 
      message: 'Erro durante a migração',
      error: error.message 
    }, 500)
  }
}
