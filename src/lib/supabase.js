import { createClient } from '@supabase/supabase-js'
import { validateEnvironment, displayValidationErrors } from './env-validator.js'

// Configuração com validação obrigatória
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Validação das variáveis de ambiente
const validation = validateEnvironment()
displayValidationErrors(validation)

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
      console.warn('⚠️ [Supabase] Token expirado')
      return false
    }
    
    // Verificar se o token não é muito antigo (mais de 1 hora)
    if (payload.iat && (now - payload.iat) > 3600) {
      console.warn('⚠️ [Supabase] Token muito antigo')
      return false
    }
    
    return true
  } catch (error) {
    console.warn('⚠️ [Supabase] Erro ao validar token:', error)
    return false
  }
}

// Singleton para evitar múltiplas instâncias do Supabase
let supabaseInstance = null
let supabaseAdminInstance = null

// Função para criar ou retornar instância existente
const createSupabaseClient = () => {
  if (supabaseInstance) {
    console.log('🔄 [Supabase] Reutilizando instância existente')
    return supabaseInstance
  }

  console.log('🆕 [Supabase] Criando nova instância')
  supabaseInstance = createClient(supabaseUrl || 'https://zibuyabpsvgulvigvdtb.supabase.co', supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // DESABILITADO para evitar login automático
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sispac-auth-token',
      // Configurações adicionais para melhorar a estabilidade
      flowType: 'pkce',
      debug: false, // Desabilitar debug para reduzir warnings
      // Configurações de retry para melhorar conectividade
      retryDelay: 1000,
      maxRetries: 3
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

  return supabaseInstance
}

// Função para criar cliente admin
const createSupabaseAdminClient = () => {
  if (supabaseAdminInstance) {
    console.log('🔄 [Supabase] Reutilizando instância admin existente')
    return supabaseAdminInstance
  }

  console.log('🆕 [Supabase] Criando nova instância admin')
  supabaseAdminInstance = createClient(supabaseUrl || 'https://zibuyabpsvgulvigvdtb.supabase.co', supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'sispac-web-admin'
      }
    }
  })

  return supabaseAdminInstance
}

// Criar cliente com chave anônima para operações básicas
export const supabase = createSupabaseClient()
export const supabaseAdmin = createSupabaseAdminClient()

// Interceptor para validar tokens antes das requisições
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED' && session?.access_token) {
    if (!validateToken(session.access_token)) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.warn('⚠️ [Supabase] Erro ao fazer logout:', error)
      }
    }
  }
})

// Testar conexão apenas em desenvolvimento
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.warn('⚠️ [Supabase] Erro na conexão:', error)
    } else if (data.session) {
      // Validar token da sessão
      if (!validateToken(data.session.access_token)) {
        supabase.auth.signOut().catch(error => {
          console.warn('⚠️ [Supabase] Erro ao fazer logout:', error)
        })
      }
    }
  })
}


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
    console.warn('⚠️ [Supabase] Erro ao limpar tokens:', error)
    return false
  }
}

// Função para testar conectividade básica
export const testConnectivity = async () => {
  try {
    // Teste simples de conectividade com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('⚠️ [Supabase] Erro de conectividade:', error.message)
    return false
  }
}

// Função para verificar saúde da conexão
export const checkSupabaseHealth = async () => {
  try {
    // Primeiro testar conectividade básica
    const isConnected = await testConnectivity()
    if (!isConnected) {
      console.warn('⚠️ [Supabase] Sem conectividade básica')
      return false
    }
    
    // Depois testar query específica
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.warn('⚠️ [Supabase] Erro ao verificar saúde:', error)
      return false
    }
    return true
  } catch (error) {
    console.warn('⚠️ [Supabase] Erro ao verificar saúde:', error)
    return false
  }
}
