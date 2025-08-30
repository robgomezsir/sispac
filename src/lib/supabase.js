import { createClient } from '@supabase/supabase-js'

// Configuração com fallback para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Debug das variáveis de ambiente
console.log('🔍 [Supabase] URL:', supabaseUrl)
console.log('🔍 [Supabase] Anon Key:', supabaseAnonKey ? '***' : 'NÃO DEFINIDA')
console.log('🔍 [Supabase] Service Key:', supabaseServiceKey ? '***' : 'NÃO DEFINIDA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Variáveis de ambiente não configuradas!')
  console.error('❌ [Supabase] VITE_SUPABASE_URL:', supabaseUrl)
  console.error('❌ [Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'DEFINIDA' : 'NÃO DEFINIDA')
  console.error('❌ [Supabase] Crie um arquivo .env com as chaves do Supabase!')
} else {
  console.log('✅ [Supabase] Configuração carregada com sucesso!')
}

// Criar cliente com chave anônima para operações básicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // DESABILITADO para evitar login automático
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sispac-auth-token'
  },
  // Configurações adicionais para produção
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'sispac-web'
    }
  }
})

// Testar conexão apenas em desenvolvimento
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ [Supabase] Erro na conexão:', error)
    } else {
      console.log('✅ [Supabase] Conexão estabelecida com sucesso!')
      if (data.session) {
        console.log('✅ [Supabase] Sessão ativa encontrada:', data.session.user.email)
      } else {
        console.log('ℹ️ [Supabase] Nenhuma sessão ativa')
      }
    }
  })
}

// Criar cliente com chave de serviço para operações que precisam contornar RLS
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback para o cliente anônimo se não houver chave de serviço
