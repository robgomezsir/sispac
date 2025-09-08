// Script para criar usuário robgomez.sir@gmail.com no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRobGomezUser() {
  console.log('🔧 Criando usuário robgomez.sir@gmail.com...')
  
  try {
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'robgomez.sir@gmail.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Rob Gomez',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError.message)
      return
    }

    console.log('✅ Usuário criado com ID:', authData.user.id)

    // Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'robgomez.sir@gmail.com',
        role: 'admin',
        name: 'Rob Gomez'
      })

    if (profileError) {
      console.error('⚠️ Erro ao criar perfil:', profileError.message)
    } else {
      console.log('✅ Perfil criado com sucesso')
    }

    console.log('🎉 Usuário robgomez.sir@gmail.com criado com sucesso!')
    console.log('📧 Email: robgomez.sir@gmail.com')
    console.log('🔑 Senha: admin123')
    console.log('👤 Role: admin')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createRobGomezUser().catch(console.error)
}

export { createRobGomezUser }
