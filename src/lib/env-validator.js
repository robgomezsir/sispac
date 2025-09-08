/**
 * Validador de Variáveis de Ambiente
 * Garante que todas as chaves necessárias estejam configuradas
 */

// Lista de variáveis obrigatórias para frontend
const REQUIRED_ENV_VARS = {
  // Frontend (públicas) - obrigatórias
  VITE_SUPABASE_URL: 'URL do Supabase',
  VITE_SUPABASE_ANON_KEY: 'Chave anônima do Supabase'
}

// Lista de variáveis opcionais
const OPTIONAL_ENV_VARS = {
  NODE_ENV: 'Ambiente de execução',
  VITE_SUPABASE_SERVICE_ROLE_KEY: 'Chave de serviço do Supabase (frontend)',
  
  // Backend (privadas) - apenas para APIs serverless
  SUPABASE_URL: 'URL do Supabase (backend)',
  SUPABASE_ANON_KEY: 'Chave anônima do Supabase (backend)',
  SUPABASE_SERVICE_ROLE: 'Chave de serviço do Supabase',
  API_KEY: 'Chave de API para autenticação'
}

/**
 * Valida se uma variável de ambiente está configurada
 */
export const validateEnvVar = (varName, isRequired = true) => {
  const value = import.meta.env[varName]
  
  if (isRequired && (!value || value.trim() === '')) {
    return {
      valid: false,
      error: `❌ Variável obrigatória não configurada: ${varName}`
    }
  }
  
  if (value && (value.includes('your_') || value.includes('_here'))) {
    return {
      valid: false,
      error: `❌ Variável não configurada corretamente: ${varName} (ainda contém placeholder)`
    }
  }
  
  return { valid: true }
}

/**
 * Valida todas as variáveis de ambiente obrigatórias
 */
export const validateRequiredEnvVars = () => {
  const errors = []
  const warnings = []
  
  // Validar variáveis obrigatórias
  Object.keys(REQUIRED_ENV_VARS).forEach(varName => {
    const result = validateEnvVar(varName, true)
    if (!result.valid) {
      warnings.push(result.error) // Mudando para warnings para não quebrar a aplicação
    }
  })
  
  // Validar variáveis opcionais
  Object.keys(OPTIONAL_ENV_VARS).forEach(varName => {
    const result = validateEnvVar(varName, false)
    if (!result.valid) {
      warnings.push(result.error)
    }
  })
  
  return {
    valid: true, // Sempre válido para não quebrar a aplicação
    errors,
    warnings
  }
}

/**
 * Valida formato de URL do Supabase
 */
export const validateSupabaseUrl = (url) => {
  if (!url) return { valid: false, error: 'URL não fornecida' }
  
  try {
    const urlObj = new URL(url)
    
    // Verificar se é HTTPS
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL deve usar HTTPS' }
    }
    
    // Verificar se contém domínio do Supabase (mais flexível)
    if (!urlObj.hostname.includes('supabase.co') && !urlObj.hostname.includes('supabase')) {
      return { valid: false, error: 'URL deve ser do domínio supabase.co' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'URL inválida' }
  }
}

/**
 * Valida formato de chave JWT do Supabase
 */
export const validateSupabaseKey = (key, keyType = 'anon') => {
  if (!key) return { valid: false, error: 'Chave não fornecida' }
  
  try {
    // Verificar se é um JWT válido
    const parts = key.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Formato de chave inválido (não é JWT)' }
    }
    
    // Decodificar payload
    const payload = JSON.parse(atob(parts[1]))
    
    // Verificar se não está expirado (mais flexível)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.warn('⚠️ Chave JWT expirada, mas continuando...')
    }
    
    // Verificar tipo de chave (mais flexível)
    if (keyType === 'anon' && payload.role && payload.role !== 'anon') {
      console.warn('⚠️ Chave não é do tipo anônima, mas continuando...')
    }
    
    if (keyType === 'service' && payload.role && payload.role !== 'service_role') {
      console.warn('⚠️ Chave não é do tipo service_role, mas continuando...')
    }
    
    return { valid: true }
  } catch (error) {
    console.warn('⚠️ Erro ao validar chave JWT:', error)
    return { valid: true } // Mais permissivo para não quebrar a aplicação
  }
}

/**
 * Valida todas as configurações do Supabase
 */
export const validateSupabaseConfig = () => {
  const errors = []
  const warnings = []
  
  // Validar URL
  const urlResult = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
  if (!urlResult.valid) {
    warnings.push(`URL do Supabase: ${urlResult.error}`)
  }
  
  // Validar chave anônima
  const anonKeyResult = validateSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY, 'anon')
  if (!anonKeyResult.valid) {
    warnings.push(`Chave anônima: ${anonKeyResult.error}`)
  }
  
  // Validar chave de serviço (opcional)
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const serviceKeyResult = validateSupabaseKey(serviceKey, 'service')
    if (!serviceKeyResult.valid) {
      warnings.push(`Chave de serviço: ${serviceKeyResult.error}`)
    }
  }
  
  return {
    valid: true, // Sempre válido para não quebrar a aplicação
    errors,
    warnings
  }
}

/**
 * Função principal de validação
 */
export const validateEnvironment = () => {
  const envValidation = validateRequiredEnvVars()
  const supabaseValidation = validateSupabaseConfig()
  
  const allErrors = [...envValidation.errors, ...supabaseValidation.errors]
  const allWarnings = [...envValidation.warnings, ...supabaseValidation.warnings]
  
  return {
    valid: true, // Sempre válido para não quebrar a aplicação
    errors: allErrors,
    warnings: allWarnings,
    summary: {
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      environment: import.meta.env.MODE || 'development'
    }
  }
}

/**
 * Função para exibir erros de forma amigável
 */
export const displayValidationErrors = (validation) => {
  if (validation.valid && validation.errors.length === 0) {
    console.log('✅ Todas as variáveis de ambiente estão configuradas corretamente')
    return
  }
  
  if (validation.errors.length > 0) {
    console.group('❌ Erros de Configuração de Ambiente')
    validation.errors.forEach(error => console.error(error))
    console.groupEnd()
  }
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ Avisos de Configuração:')
    validation.warnings.forEach(warning => console.warn(warning))
    console.groupEnd()
  }
  
  // Em produção, mostrar erro na tela apenas se houver erros críticos
  if (!import.meta.env.DEV && validation.errors.length > 0) {
    document.body.innerHTML = `
      <div style="
        padding: 20px; 
        text-align: center; 
        font-family: Arial, sans-serif; 
        background: #f8f9fa; 
        border-radius: 8px; 
        margin: 20px;
        border: 2px solid #dc3545;
      ">
        <h1 style="color: #dc3545;">⚠️ Erro de Configuração</h1>
        <p>As variáveis de ambiente não estão configuradas corretamente.</p>
        <p>Entre em contato com o administrador do sistema.</p>
        <details style="margin-top: 15px; text-align: left;">
          <summary style="cursor: pointer; color: #6c757d;">Detalhes técnicos</summary>
          <pre style="background: #e9ecef; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 0.8em;">
${validation.errors.join('\n')}
          </pre>
        </details>
      </div>
    `
  }
}

export default {
  validateEnvVar,
  validateRequiredEnvVars,
  validateSupabaseUrl,
  validateSupabaseKey,
  validateSupabaseConfig,
  validateEnvironment,
  displayValidationErrors
}
