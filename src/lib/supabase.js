import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
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
}

// Criar cliente com chave anônima para operações básicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Criar cliente com chave de serviço para operações que precisam contornar RLS
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase // Fallback para o cliente anônimo se não houver chave de serviço
