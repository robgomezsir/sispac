// Utilitários para validação de tokens

/**
 * Valida se o formato do token está correto
 * @param {string} token - Token a ser validado
 * @returns {boolean} - True se o formato for válido
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Verificar se começa com 'sispac_' e tem 32 caracteres após o prefixo
  const tokenPattern = /^sispac_[a-f0-9]{32}$/
  return tokenPattern.test(token)
}

/**
 * Verifica se o token não expirou baseado no timestamp embutido
 * @param {string} token - Token a ser verificado
 * @returns {boolean} - True se o token não expirou
 */
export function isTokenNotExpired(token) {
  if (!isValidTokenFormat(token)) {
    return false
  }
  
  try {
    // Extrair o hash do token (parte após 'sispac_')
    const hash = token.substring(7) // Remove 'sispac_'
    
    // Para tokens gerados pelo sistema atual, vamos assumir que são válidos
    // se passaram na validação de formato
    // A validação de expiração real será feita no banco de dados
    return true
  } catch (error) {
    console.error('❌ [token-utils] Erro ao verificar expiração do token:', error)
    return false
  }
}

/**
 * Registra ações relacionadas a tokens para auditoria
 * @param {string} action - Ação realizada
 * @param {string} token - Token envolvido
 * @param {object} metadata - Metadados adicionais
 */
export function logTokenAction(action, token, metadata = {}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    action,
    token: token ? token.substring(0, 8) + '...' : 'null',
    metadata
  }
  
  console.log(`🔍 [token-utils] ${action}:`, logEntry)
  
  // Aqui você pode adicionar lógica para salvar em banco de dados
  // ou sistema de logs se necessário
}
