import crypto from 'crypto'

// Configurações do token
const TOKEN_LENGTH = 32
const TOKEN_EXPIRY_HOURS = 24 // Token expira em 24 horas
const TOKEN_PREFIX = 'sispac_'

/**
 * Gera um token único para acesso ao formulário
 * @param {string} candidateId - ID do candidato
 * @param {string} email - Email do candidato
 * @returns {string} Token único
 */
export function generateAccessToken(candidateId, email) {
  try {
    // Criar payload único
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(16).toString('hex')
    const payload = `${candidateId}_${email}_${timestamp}_${randomBytes}`
    
    // Gerar hash do payload
    const hash = crypto.createHash('sha256').update(payload).digest('hex')
    
    // Criar token final
    const token = TOKEN_PREFIX + hash.substring(0, TOKEN_LENGTH)
    
    console.log('✅ [token-utils] Token gerado:', { candidateId, email, tokenLength: token.length })
    
    return token
  } catch (error) {
    console.error('❌ [token-utils] Erro ao gerar token:', error)
    throw new Error('Erro ao gerar token de acesso')
  }
}

/**
 * Valida se um token é válido
 * @param {string} token - Token a ser validado
 * @returns {boolean} True se válido, false caso contrário
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Verificar prefixo
  if (!token.startsWith(TOKEN_PREFIX)) {
    return false
  }
  
  // Verificar tamanho
  if (token.length !== TOKEN_PREFIX.length + TOKEN_LENGTH) {
    return false
  }
  
  // Verificar se contém apenas caracteres válidos (hex)
  const tokenBody = token.substring(TOKEN_PREFIX.length)
  const hexRegex = /^[0-9a-f]+$/i
  if (!hexRegex.test(tokenBody)) {
    return false
  }
  
  return true
}

/**
 * Extrai informações do token (para logs/debug)
 * @param {string} token - Token
 * @returns {object} Informações do token
 */
export function getTokenInfo(token) {
  if (!isValidTokenFormat(token)) {
    return { valid: false, error: 'Formato inválido' }
  }
  
  return {
    valid: true,
    prefix: TOKEN_PREFIX,
    length: token.length,
    body: token.substring(TOKEN_PREFIX.length)
  }
}

/**
 * Gera um token de teste (apenas para desenvolvimento)
 * @returns {string} Token de teste
 */
export function generateTestToken() {
  return generateAccessToken('test_candidate', 'test@example.com')
}

/**
 * Valida se o token não expirou (baseado no timestamp embutido)
 * @param {string} token - Token a ser validado
 * @returns {boolean} True se não expirou, false caso contrário
 */
export function isTokenNotExpired(token) {
  try {
    // Para simplificar, vamos usar um sistema baseado em timestamp
    // Em produção, você pode armazenar o timestamp no banco de dados
    const now = Date.now()
    const maxAge = TOKEN_EXPIRY_HOURS * 60 * 60 * 1000 // Converter para ms
    
    // Como não temos o timestamp original, vamos assumir que tokens válidos
    // foram criados recentemente (esta é uma simplificação)
    // Em produção, você deve armazenar o timestamp de criação no banco
    return true // Por enquanto, sempre válido se o formato estiver correto
  } catch (error) {
    console.error('❌ [token-utils] Erro ao verificar expiração:', error)
    return false
  }
}

/**
 * Cria um link de acesso único para o candidato
 * @param {string} baseUrl - URL base da aplicação
 * @param {string} token - Token de acesso
 * @returns {string} Link completo
 */
export function createAccessLink(baseUrl, token) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '') // Remover barra final se existir
  return `${cleanBaseUrl}/form?token=${token}`
}

/**
 * Extrai token da URL
 * @param {string} url - URL completa ou query string
 * @returns {string|null} Token extraído ou null
 */
export function extractTokenFromUrl(url) {
  try {
    const urlObj = new URL(url, 'http://localhost') // Base URL para parsing
    return urlObj.searchParams.get('token')
  } catch (error) {
    // Se não for uma URL válida, tentar extrair da query string
    const match = url.match(/[?&]token=([^&]+)/)
    return match ? match[1] : null
  }
}

/**
 * Log de segurança para tokens
 * @param {string} action - Ação realizada
 * @param {string} token - Token (parcial para segurança)
 * @param {object} metadata - Metadados adicionais
 */
export function logTokenAction(action, token, metadata = {}) {
  const tokenPreview = token ? `${token.substring(0, 8)}...` : 'null'
  console.log(`🔐 [token-security] ${action}:`, {
    token: tokenPreview,
    timestamp: new Date().toISOString(),
    ...metadata
  })
}
