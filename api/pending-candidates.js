import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    console.log('🔍 [pending-candidates] Iniciando requisição')
    console.log('🔍 [pending-candidates] Headers:', req.headers)
    
    // Validar autenticação e permissões
    try {
      await assertAuth(req)
      console.log('✅ [pending-candidates] Autenticação bem-sucedida')
    } catch (authError) {
      console.error('❌ [pending-candidates] Erro de autenticação:', authError)
      return fail(res, authError, authError.status || 401)
    }
    
    const supabase = getSupabaseAdmin()
    console.log('✅ [pending-candidates] Cliente Supabase criado')
    
    // Buscar apenas candidatos pendentes (que ainda não completaram o teste)
    const { data, error } = await supabase
      .from('candidates')
      .select('id,name,email,access_token,token_created_at,created_at')
      .eq('status', 'PENDENTE_TESTE')
      .order('created_at', { ascending: false })
    
    if(error) {
      console.error('❌ Erro ao buscar candidatos pendentes:', error)
      return fail(res, { message: 'Erro ao buscar candidatos pendentes: ' + error.message }, 500)
    }
    
    console.log('✅ [pending-candidates] Candidatos pendentes obtidos:', data?.length || 0, 'registros')
    
    // Adicionar informações de tempo desde a criação do token
    const candidatesWithTimeInfo = data?.map(candidate => {
      const tokenCreatedAt = new Date(candidate.token_created_at || candidate.created_at)
      const now = new Date()
      const hoursDiff = (now - tokenCreatedAt) / (1000 * 60 * 60)
      
      return {
        ...candidate,
        hours_since_token_created: Math.round(hoursDiff * 100) / 100,
        token_expires_in_hours: Math.max(0, 24 - hoursDiff)
      }
    }) || []
    
    console.log('✅ Candidatos pendentes buscados com sucesso:', { count: candidatesWithTimeInfo.length })
    
    ok(res, candidatesWithTimeInfo)
    
  }catch(e){ 
    console.error('❌ Erro na API pending-candidates:', e)
    fail(res, e) 
  }
}
