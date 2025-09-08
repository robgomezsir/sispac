// Endpoint para validação de tokens de candidatos
// Este arquivo simula uma API para validação de tokens

export async function validateCandidateToken(token) {
  console.log('🔍 [validate-token] Validando token:', token)
  
  // Simular validação de token
  if (!token) {
    return {
      valid: false,
      error: 'Token não fornecido'
    }
  }
  
  // Tokens de teste válidos
  const validTokens = [
    'test-token-123',
    'valid-unique-token',
    'candidate-token-456',
    'demo-token-789'
  ]
  
  if (validTokens.includes(token)) {
    console.log('✅ [validate-token] Token válido:', token)
    return {
      valid: true,
      candidate: {
        id: `candidate-${Date.now()}`,
        name: 'Candidato Teste',
        email: 'candidate@test.com',
        token: token
      }
    }
  }
  
  console.log('❌ [validate-token] Token inválido:', token)
  return {
    valid: false,
    error: 'Token inválido ou expirado'
  }
}

// Função para usar no frontend
export function useTokenValidation() {
  return {
    validateToken: validateCandidateToken
  }
}
