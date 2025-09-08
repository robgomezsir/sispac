// Script para criar usuários de teste no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUsers() {
  console.log('🔧 Criando usuários de teste...')
  
  // Usuários de teste
  const testUsers = [
    {
      email: 'admin@sispac.com',
      password: 'admin123',
      role: 'admin',
      name: 'Administrador'
    },
    {
      email: 'rh@sispac.com', 
      password: 'rh123',
      role: 'rh',
      name: 'RH User'
    },
    {
      email: 'test@sispac.com',
      password: 'test123', 
      role: 'rh',
      name: 'Test User'
    }
  ]

  for (const userData of testUsers) {
    try {
      console.log(`📝 Criando usuário: ${userData.email}`)
      
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      })

      if (authError) {
        console.error(`❌ Erro ao criar usuário ${userData.email}:`, authError.message)
        continue
      }

      console.log(`✅ Usuário ${userData.email} criado com ID: ${authData.user.id}`)

      // Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          role: userData.role,
          name: userData.name
        })

      if (profileError) {
        console.error(`⚠️ Erro ao criar perfil para ${userData.email}:`, profileError.message)
      } else {
        console.log(`✅ Perfil criado para ${userData.email}`)
      }

    } catch (error) {
      console.error(`❌ Erro geral para ${userData.email}:`, error.message)
    }
  }

  console.log('✅ Processo de criação de usuários concluído!')
  console.log('\n📋 Credenciais de teste:')
  console.log('Admin: admin@sispac.com / admin123')
  console.log('RH: rh@sispac.com / rh123') 
  console.log('Test: test@sispac.com / test123')
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers().catch(console.error)
}

export { createTestUsers }
