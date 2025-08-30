// Configuração de Desenvolvimento
export const devConfig = {
  // Ambiente
  environment: 'development',
  debug: true,
  verbose: true,
  
  // Supabase (desenvolvimento)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://zibuyabpsvgulvigvdtb.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    debug: true
  },
  
  // Logs e Debug
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: false,
    showTimestamps: true
  },
  
  // Desenvolvimento
  dev: {
    hotReload: true,
    sourceMaps: true,
    errorOverlay: true,
    openBrowser: true
  },
  
  // API
  api: {
    baseUrl: 'http://localhost:5173',
    timeout: 10000,
    retries: 3
  }
}

// Função para verificar se está em desenvolvimento
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
}

// Função para log de desenvolvimento
export const devLog = (message, data = null) => {
  if (isDevelopment()) {
    console.log(`🔧 [DEV] ${message}`, data || '')
  }
}

// Função para log de erro de desenvolvimento
export const devError = (message, error = null) => {
  if (isDevelopment()) {
    console.error(`❌ [DEV] ${message}`, error || '')
  }
}

export default devConfig
