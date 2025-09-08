import { createClient } from '@supabase/supabase-js'

// Configuração com fallback para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vpdwqaktdglneoitmcnj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHdxYWt0ZGdsbmVvaXRtY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTE2MDMsImV4cCI6MjA3Mjg2NzYwM30.qmI4fUxpkZbCU9Ua5M35N3gDU7PAE0eaOMs2vFBjQow'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Variáveis de ambiente não configuradas!')
  
  // Em produção, mostrar erro mais amigável
  if (!import.meta.env.DEV) {
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Erro de Configuração</h1>
        <p>As variáveis de ambiente do Supabase não estão configuradas.</p>
        <p>Entre em contato com o administrador do sistema.</p>
      </div>
    `
  }
}

// Função para validar token de forma mais robusta
const validateToken = (token) => {
  if (!token || typeof token !== 'string') return false
  
  try {
    // Verificar se o token tem formato válido (JWT básico)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Verificar se não está expirado (decodificar payload)
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Verificar se o token não expirou
    if (payload.exp && payload.exp < now) {
      return false
    }
    
    // Verificar se o token não é muito antigo (mais de 1 hora)
    if (payload.iat && (now - payload.iat) > 3600) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('❌ [Supabase] Erro ao validar token:', error)
    return false
  }
}

// Criar cliente com chave anônima para operações básicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // DESABILITADO para evitar login automático
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sispac-auth-token',
    // Configurações adicionais para melhorar a estabilidade
    flowType: 'pkce',
    debug: import.meta.env.DEV
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

// Interceptor para validar tokens antes das requisições
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED' && session?.access_token) {
    if (!validateToken(session.access_token)) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('❌ [Supabase] Erro ao fazer logout:', error)
      }
    }
  }
})

// Testar conexão apenas em desenvolvimento
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ [Supabase] Erro na conexão:', error)
    } else if (data.session) {
      // Validar token da sessão
      if (!validateToken(data.session.access_token)) {
        supabase.auth.signOut().catch(error => {
          console.error('❌ [Supabase] Erro ao fazer logout:', error)
        })
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

// Função para limpar tokens inválidos
export const clearInvalidTokens = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session && !validateToken(session.access_token)) {
      await supabase.auth.signOut()
      return true
    }
    return false
  } catch (error) {
    console.error('❌ [Supabase] Erro ao limpar tokens:', error)
    return false
  }
}

// Função para verificar saúde da conexão
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      return false
    }
    return true
  } catch (error) {
    console.error('❌ [Supabase] Erro ao verificar saúde:', error)
    return false
  }
}
