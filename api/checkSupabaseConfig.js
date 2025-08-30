import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

export default async function handler(req, res){
  try{
    assertAuth(req)
    const supabase = getSupabaseAdmin()
    
    // Verificar configurações atuais
    const { data: settings, error } = await supabase.auth.admin.listUsers()
    
    if(error) throw error
    
    // Retornar informações sobre a configuração
    ok(res, { 
      message: 'Configuração do Supabase verificada',
      userCount: settings.users.length,
      configInfo: {
        siteUrl: process.env.SUPABASE_URL,
        redirectUrls: [
          'https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app/invite-callback',
          'https://*.rob-gomezs-projects.vercel.app/invite-callback'
        ],
        instructions: [
          '1. Acesse Authentication > URL Configuration no Supabase',
          '2. Configure Site URL: https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app',
          '3. Adicione as Redirect URLs listadas acima (use /invite-callback)',
          '4. Salve as configurações',
          '5. ⚠️ IMPORTANTE: Use /invite-callback em vez de /auth/confirm'
        ]
      }
    })
  }catch(e){ 
    fail(res, e) 
  }
}
