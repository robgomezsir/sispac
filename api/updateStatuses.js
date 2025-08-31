import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

// Função para classificar o status baseado no score
function classify(score) {
  if (score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if (score <= 75) return 'DENTRO DA EXPECTATIVA'
  if (score <= 95) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}

export default async function handler(req, res) {
  try {
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    // Buscar todos os candidatos com score mas sem status atualizado
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('id, score, status')
      .not('score', 'is', null)
    
    if (fetchError) {
      console.error('❌ Erro ao buscar candidatos:', fetchError)
      return fail(res, { message: 'Erro ao buscar candidatos: ' + fetchError.message }, 500)
    }
    
    console.log(`📊 Encontrados ${candidates?.length || 0} candidatos para atualizar`)
    
    let updatedCount = 0
    let errors = []
    
    // Atualizar status de cada candidato
    for (const candidate of candidates || []) {
      const newStatus = classify(candidate.score)
      
      // Só atualizar se o status for diferente
      if (candidate.status !== newStatus) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: newStatus })
          .eq('id', candidate.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar candidato ${candidate.id}:`, updateError)
          errors.push({ id: candidate.id, error: updateError.message })
        } else {
          updatedCount++
          console.log(`✅ Candidato ${candidate.id} atualizado: ${candidate.status} → ${newStatus}`)
        }
      }
    }
    
    console.log(`✅ Atualização concluída: ${updatedCount} candidatos atualizados`)
    
    ok(res, { 
      message: `Status atualizados com sucesso`,
      updatedCount,
      totalCandidates: candidates?.length || 0,
      errors: errors.length > 0 ? errors : null
    })
    
  } catch (e) {
    console.error('❌ Erro na API updateStatuses:', e)
    fail(res, e)
  }
}
