import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    console.log('⚠️ Iniciando operação de limpeza de dados...')
    
    // Deletar resultados primeiro (dependências)
    const { error: resultsError } = await supabase.from('results').delete().neq('id', 0)
    
    if(resultsError) {
      console.error('❌ Erro ao deletar resultados:', resultsError)
      return fail(res, { message: 'Erro ao limpar resultados: ' + resultsError.message }, 500)
    }
    
    // Deletar candidatos
    const { error: candidatesError } = await supabase.from('candidates').delete().neq('id', 0)
    
    if(candidatesError) {
      console.error('❌ Erro ao deletar candidatos:', candidatesError)
      return fail(res, { message: 'Erro ao limpar candidatos: ' + candidatesError.message }, 500)
    }
    
    // Deletar perfis de usuários (exceto administradores)
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('role', 'admin')
    
    if(profilesError) {
      console.warn('⚠️ Erro ao deletar perfis:', profilesError)
    }
    
    console.log('✅ Dados limpos com sucesso por:', req.user.email)
    
    ok(res, { 
      message: 'Todos os dados foram limpos com sucesso',
      cleaned_by: req.user.email,
      timestamp: new Date().toISOString()
    })
    
  }catch(e){ 
    console.error('❌ Erro na API purge:', e)
    fail(res, e) 
  }
}
