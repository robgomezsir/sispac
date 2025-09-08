// Script para criar um token de teste para candidatos
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestToken() {
  console.log('🔧 Criando token de teste para candidato...')
  
  // Gerar token de acesso simples
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const payload = `${timestamp}_test@candidate.com_${randomString}`
  
  // Gerar hash simples
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const accessToken = 'sispac_' + Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32)
  
  // Dados do candidato de teste
  const candidateData = {
    name: 'Candidato Teste',
    email: 'test@candidate.com',
    score: 0,
    status: 'PENDENTE_TESTE',
    answers: {},
    access_token: accessToken,
    token_created_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
  
  try {
    // Inserir candidato de teste
    const { data: newCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir candidato:', insertError.message)
      return
    }
    
    console.log('✅ Candidato de teste criado com sucesso!')
    console.log('📧 Email:', newCandidate[0].email)
    console.log('🔑 Token:', accessToken)
    console.log('🔗 Link de acesso: http://localhost:5173/form?token=' + accessToken)
    console.log('🔗 Link alternativo: http://localhost:5173/candidate-access?token=' + accessToken)
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestToken().catch(console.error)
}

export { createTestToken }
