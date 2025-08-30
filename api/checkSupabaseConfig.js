import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    // Verificar configurações atuais
    const { data: settings, error } = await supabase.auth.admin.listUsers()
    
    if(error) {
      console.error('❌ Erro ao verificar configuração:', error)
      return fail(res, { message: 'Erro ao verificar configuração: ' + error.message }, 500)
    }
    
    // Verificar saúde da conexão
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    const isHealthy = !healthError
    
    // Retornar informações sobre a configuração
    ok(res, {
      message: 'Configuração do Supabase verificada',
      userCount: settings.users.length,
      connectionHealthy: isHealthy,
      configInfo: {
        siteUrl: process.env.SUPABASE_URL,
        redirectUrls: [
          'https://sispac.vercel.app/setup-password',
          'https://sispac.vercel.app/complete-invite',
          'https://*.vercel.app/setup-password',
          'https://*.vercel.app/complete-invite'
        ],
        instructions: [
          '1. Acesse Authentication > URL Configuration no Supabase',
          '2. Configure Site URL: https://sispac.vercel.app',
          '3. Adicione as Redirect URLs listadas acima (use /setup-password ou /complete-invite)',
          '4. Salve as configurações',
          '5. ⚠️ IMPORTANTE: Use /setup-password ou /complete-invite em vez de /welcome ou /join',
          '6. 🆕 Teste primeiro: https://sispac.vercel.app/setup-password'
        ]
      },
      checked_by: req.user.email,
      timestamp: new Date().toISOString()
    })
    
  }catch(e){ 
    console.error('❌ Erro na API checkSupabaseConfig:', e)
    fail(res, e) 
  }
}
