// Script para criar usuário de teste no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE3NDc2NSwiZXhwIjoyMDcxNzUwNzY1fQ.PzB6anXBL41uxSGg9GppVhoZGMVRvBqtWYfSVzGOBXQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('🔍 Verificando usuários existentes...')
  
  try {
    // Listar usuários existentes
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError)
      return
    }
    
    console.log(`📊 Total de usuários encontrados: ${users.users.length}`)
    
    // Verificar se admin@sispac.com já existe
    const adminUser = users.users.find(user => user.email === 'admin@sispac.com')
    
    if (adminUser) {
      console.log('✅ Usuário admin@sispac.com já existe')
      console.log('ID:', adminUser.id)
      console.log('Email:', adminUser.email)
      console.log('Criado em:', adminUser.created_at)
      console.log('Último login:', adminUser.last_sign_in_at)
    } else {
      console.log('❌ Usuário admin@sispac.com não encontrado')
      console.log('🔧 Criando usuário de teste...')
      
      // Criar usuário de teste
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@sispac.com',
        password: 'senha123',
        email_confirm: true,
        user_metadata: {
          name: 'Administrador',
          role: 'admin'
        }
      })
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError)
        return
      }
      
      console.log('✅ Usuário criado com sucesso!')
      console.log('ID:', newUser.user.id)
      console.log('Email:', newUser.user.email)
    }
    
    // Verificar se há candidatos de teste
    console.log('\n🔍 Verificando candidatos de teste...')
    
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(5)
    
    if (candidatesError) {
      console.error('❌ Erro ao buscar candidatos:', candidatesError)
    } else {
      console.log(`📊 Total de candidatos encontrados: ${candidates.length}`)
      
      if (candidates.length === 0) {
        console.log('⚠️ Nenhum candidato encontrado. Criando candidatos de teste...')
        
        // Criar candidatos de teste
        const testCandidates = [
          {
            name: 'João Silva',
            email: 'joao.silva@teste.com',
            score: 85,
            status: 'SUPEROU A EXPECTATIVA',
            behavioral_profile: {
              perfil: 'Líder natural com forte capacidade de comunicação',
              comportamento: 'Demonstra iniciativa e proatividade em situações desafiadoras',
              competencias: 'Excelente em trabalho em equipe e resolução de problemas',
              lideranca: 'Capaz de motivar e guiar equipes para alcançar objetivos',
              areas_desenvolvimento: ['Gestão de tempo', 'Tomada de decisão sob pressão'],
              recomendacoes: 'Ideal para posições de liderança e gestão'
            },
            answers: {
              question_1: ['A', 'B'],
              question_2: ['C'],
              question_3: ['A', 'D']
            }
          },
          {
            name: 'Maria Santos',
            email: 'maria.santos@teste.com',
            score: 72,
            status: 'ACIMA DA EXPECTATIVA',
            behavioral_profile: {
              perfil: 'Profissional dedicada com foco em resultados',
              comportamento: 'Metódica e organizada, sempre cumpre prazos',
              competencias: 'Forte em análise de dados e planejamento',
              lideranca: 'Lidera pelo exemplo e conhecimento técnico',
              areas_desenvolvimento: ['Comunicação interpessoal', 'Flexibilidade'],
              recomendacoes: 'Excelente para posições técnicas e analíticas'
            },
            answers: {
              question_1: ['B', 'C'],
              question_2: ['A'],
              question_3: ['B', 'C']
            }
          },
          {
            name: 'Pedro Oliveira',
            email: 'pedro.oliveira@teste.com',
            score: 65,
            status: 'DENTRO DA EXPECTATIVA',
            behavioral_profile: {
              perfil: 'Profissional equilibrado com potencial de crescimento',
              comportamento: 'Consistente e confiável em suas responsabilidades',
              competencias: 'Boa base técnica e capacidade de aprendizado',
              lideranca: 'Ainda em desenvolvimento, mas mostra interesse',
              areas_desenvolvimento: ['Liderança', 'Iniciativa', 'Comunicação'],
              recomendacoes: 'Adequado para posições júnior com potencial de crescimento'
            },
            answers: {
              question_1: ['C'],
              question_2: ['B'],
              question_3: ['A']
            }
          }
        ]
        
        const { data: insertedCandidates, error: insertError } = await supabase
          .from('candidates')
          .insert(testCandidates)
        
        if (insertError) {
          console.error('❌ Erro ao inserir candidatos:', insertError)
        } else {
          console.log('✅ Candidatos de teste criados com sucesso!')
        }
      } else {
        console.log('✅ Candidatos já existem no banco')
        candidates.forEach((candidate, index) => {
          console.log(`${index + 1}. ${candidate.name} - ${candidate.email} - Score: ${candidate.score}`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestUser()
