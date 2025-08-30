import { createClient } from '@supabase/supabase-js'

// Configuração com fallback para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Debug das variáveis de ambiente
console.log('🔍 [Supabase] URL:', supabaseUrl)
console.log('🔍 [Supabase] Anon Key:', supabaseAnonKey ? '***' : 'NÃO DEFINIDA')
console.log('🔍 [Supabase] Service Key:', supabaseServiceKey ? '***' : 'NÃO DEFINIDA')

// Validação rigorosa das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Variáveis de ambiente não configuradas!')
  console.error('❌ [Supabase] VITE_SUPABASE_URL:', supabaseUrl)
  console.error('❌ [Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'DEFINIDA' : 'NÃO DEFINIDA')
  console.error('❌ [Supabase] Crie um arquivo .env com as chaves do Supabase!')
  
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
} else {
  console.log('✅ [Supabase] Configuração carregada com sucesso!')
}

// Função para validar token
const validateToken = (token) => {
  if (!token) return false
  
  try {
    // Verificar se o token tem formato válido (JWT básico)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Verificar se não está expirado (decodificar payload)
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < now) {
      console.warn('⚠️ [Supabase] Token expirado detectado')
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
      console.warn('⚠️ [Supabase] Token inválido após refresh, fazendo logout...')
      await supabase.auth.signOut()
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
        // Validar token da sessão
        if (!validateToken(data.session.access_token)) {
          console.warn('⚠️ [Supabase] Token da sessão inválido, fazendo logout...')
          supabase.auth.signOut()
        }
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

// Função para limpar tokens inválidos
export const clearInvalidTokens = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session && !validateToken(session.access_token)) {
      console.log('🧹 [Supabase] Limpando token inválido...')
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
      console.error('❌ [Supabase] Problema de conectividade:', error)
      return false
    }
    console.log('✅ [Supabase] Conexão saudável')
    return true
  } catch (error) {
    console.error('❌ [Supabase] Erro ao verificar saúde:', error)
    return false
  }
}
