// Configuração de Desenvolvimento
export const devConfig = {
  // Ambiente
  environment: 'development',
  debug: true,
  verbose: true,
  
  // Supabase (desenvolvimento)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
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

// Função para log seguro em produção
export const safeLog = (message, data = null) => {
  if (isDevelopment()) {
    console.log(`🔧 [DEV] ${message}`, data || '')
  } else {
    // Em produção, log apenas mensagens não sensíveis
    if (!message.includes('token') && !message.includes('key') && !message.includes('password')) {
      console.log(`ℹ️ [APP] ${message}`)
    }
  }
}

// Função para log de erro seguro em produção
export const safeError = (message, error = null) => {
  if (isDevelopment()) {
    console.error(`❌ [DEV] ${message}`, error || '')
  } else {
    // Em produção, log apenas mensagens de erro não sensíveis
    if (!message.includes('token') && !message.includes('key') && !message.includes('password')) {
      console.error(`❌ [APP] ${message}`)
    }
  }
}

// Função para debug de performance
export const debugPerformance = (label, fn) => {
  if (isDevelopment()) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`⚡ [PERF] ${label}: ${(end - start).toFixed(2)}ms`)
    return result
  }
  return fn()
}

// Função para debug de estado
export const debugState = (componentName, state) => {
  if (isDevelopment()) {
    console.log(`🔍 [STATE] ${componentName}:`, state)
  }
}

// Função para debug de props
export const debugProps = (componentName, props) => {
  if (isDevelopment()) {
    console.log(`🔍 [PROPS] ${componentName}:`, props)
  }
}

export default devConfig
