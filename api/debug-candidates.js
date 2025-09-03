import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    console.log('🔍 [debug-candidates] Iniciando requisição de debug')
    
    // Validar autenticação e permissões
    try {
      await assertAuth(req)
      console.log('✅ [debug-candidates] Autenticação bem-sucedida')
    } catch (authError) {
      console.error('❌ [debug-candidates] Erro de autenticação:', authError)
      return fail(res, authError, authError.status || 401)
    }
    
    const supabase = getSupabaseAdmin()
    console.log('✅ [debug-candidates] Cliente Supabase criado')
    
    // Buscar TODOS os candidatos (incluindo pendentes) para debug
    const { data, error } = await supabase
      .from('candidates')
      .select('id,name,email,score,status,created_at,access_token')
      .order('created_at', { ascending: false })
    
    if(error) {
      console.error('❌ Erro ao buscar candidatos para debug:', error)
      return fail(res, { message: 'Erro ao buscar candidatos: ' + error.message }, 500)
    }
    
    console.log('✅ [debug-candidates] Todos os candidatos obtidos:', data?.length || 0, 'registros')
    
    // Separar por status para debug
    const byStatus = data?.reduce((acc, candidate) => {
      const status = candidate.status || 'SEM_STATUS'
      if (!acc[status]) acc[status] = []
      acc[status].push(candidate)
      return acc
    }, {}) || {}
    
    console.log('📊 [debug-candidates] Candidatos por status:', Object.keys(byStatus).map(status => `${status}: ${byStatus[status].length}`).join(', '))
    
    ok(res, {
      total: data?.length || 0,
      all_candidates: data || [],
      by_status: byStatus,
      summary: {
        total: data?.length || 0,
        pending: byStatus['PENDENTE_TESTE']?.length || 0,
        completed: Object.keys(byStatus).filter(s => s !== 'PENDENTE_TESTE' && s !== 'SEM_STATUS').reduce((sum, status) => sum + (byStatus[status]?.length || 0), 0)
      }
    })
    
  }catch(e){ 
    console.error('❌ Erro na API debug-candidates:', e)
    fail(res, e) 
  }
}
