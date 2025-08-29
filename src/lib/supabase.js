import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug das variáveis de ambiente
console.log('🔍 [Supabase] URL:', supabaseUrl)
console.log('🔍 [Supabase] Anon Key:', supabaseAnonKey ? '***' : 'NÃO DEFINIDA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [Supabase] Variáveis de ambiente não configuradas!')
  console.error('❌ [Supabase] VITE_SUPABASE_URL:', supabaseUrl)
  console.error('❌ [Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'DEFINIDA' : 'NÃO DEFINIDA')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
