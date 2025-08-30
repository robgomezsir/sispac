import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    // Buscar dados para backup
    const { data: candidates, error: candidatesError } = await supabase.from('candidates').select('*')
    
    if(candidatesError) {
      console.error('❌ Erro ao buscar candidatos:', candidatesError)
      return fail(res, { message: 'Erro ao gerar backup dos candidatos' }, 500)
    }
    
    const { data: results, error: resultsError } = await supabase.from('results').select('*')
    
    if(resultsError) {
      console.error('❌ Erro ao buscar resultados:', resultsError)
      return fail(res, { message: 'Erro ao gerar backup dos resultados' }, 500)
    }
    
    // Buscar perfis de usuários (sem senhas)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, name, created_at')
      .neq('role', 'admin') // Não incluir administradores no backup
    
    if(profilesError) {
      console.warn('⚠️ Erro ao buscar perfis:', profilesError)
    }
    
    const backupData = {
      timestamp: new Date().toISOString(),
      generated_by: req.user.email,
      candidates: candidates || [],
      results: results || [],
      profiles: profiles || [],
      total_records: (candidates?.length || 0) + (results?.length || 0) + (profiles?.length || 0)
    }
    
    console.log('✅ Backup gerado com sucesso:', { 
      timestamp: backupData.timestamp,
      total_records: backupData.total_records
    })
    
    ok(res, { 
      message: 'Backup gerado com sucesso', 
      ...backupData
    })
    
  }catch(e){ 
    console.error('❌ Erro na API backup:', e)
    fail(res, e) 
  }
}
