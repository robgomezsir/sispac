import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = 3001

// Configuração do Supabase
const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo'
const supabase = createClient(supabaseUrl, supabaseKey)

// Middleware
app.use(cors())
app.use(express.json())

// ===== APIs DE AUTENTICAÇÃO =====

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      })
    }

    // Tentar fazer login no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      })
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// POST /auth/validate-token
app.post('/auth/validate-token', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      })
    }

    // Tokens válidos para teste
    const validTokens = [
      'test-token-123',
      'valid-unique-token',
      'candidate-token-456',
      'demo-token-789'
    ]

    if (validTokens.includes(token)) {
      res.json({
        success: true,
        valid: true,
        candidate: {
          id: `candidate-${Date.now()}`,
          name: 'Candidato Teste',
          email: 'candidate@test.com',
          token: token
        }
      })
    } else {
      res.json({
        success: true,
        valid: false,
        error: 'Token inválido ou expirado'
      })
    }
  } catch (error) {
    console.error('Erro na validação do token:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// ===== APIs DE FORMULÁRIO =====

// GET /form
app.get('/form', async (req, res) => {
  try {
    const { token } = req.query
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      })
    }

    // Validar token
    const validTokens = ['test-token-123', 'valid-unique-token', 'candidate-token-456', 'demo-token-789']
    
    if (!validTokens.includes(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }

    // Retornar dados do formulário
    res.json({
      success: true,
      form: {
        title: 'Avaliação Comportamental SisPAC',
        questions: [
          {
            id: 1,
            question: 'Como você se comporta em situações de pressão?',
            options: ['Mantém a calma', 'Fica ansioso', 'Procura ajuda', 'Evita a situação']
          },
          {
            id: 2,
            question: 'Qual sua abordagem para resolver problemas?',
            options: ['Análise detalhada', 'Solução rápida', 'Colaboração', 'Delegação']
          }
        ]
      }
    })
  } catch (error) {
    console.error('Erro ao acessar formulário:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// ===== APIs DE DASHBOARD =====

// GET /dashboard
app.get('/dashboard', async (req, res) => {
  try {
    // Verificar se há token de autorização
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      })
    }

    // Simular dados do dashboard
    res.json({
      success: true,
      dashboard: {
        totalCandidates: 25,
        pendingEvaluations: 8,
        completedEvaluations: 17,
        filters: {
          status: ['PENDENTE', 'CONCLUIDO', 'REJEITADO'],
          dateRange: {
            start: '2025-01-01',
            end: '2025-12-31'
          }
        },
        candidates: [
          {
            id: 1,
            name: 'João Silva',
            email: 'joao@email.com',
            status: 'PENDENTE',
            score: null,
            createdAt: '2025-01-08T10:00:00Z'
          },
          {
            id: 2,
            name: 'Maria Santos',
            email: 'maria@email.com',
            status: 'CONCLUIDO',
            score: 85,
            createdAt: '2025-01-07T14:30:00Z'
          }
        ]
      }
    })
  } catch (error) {
    console.error('Erro ao acessar dashboard:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// ===== APIs DE CANDIDATOS =====

// GET /api/candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      candidates: data || []
    })
  } catch (error) {
    console.error('Erro ao listar candidatos:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// POST /api/candidates
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, email } = req.body
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome e email são obrigatórios'
      })
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ 
        name, 
        email, 
        status: 'PENDENTE',
        score: 0,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      candidate: data[0]
    })
  } catch (error) {
    console.error('Erro ao criar candidato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// GET /api/candidate/:id
app.get('/api/candidate/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado'
      })
    }

    res.json({
      success: true,
      candidate: data
    })
  } catch (error) {
    console.error('Erro ao buscar candidato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// DELETE /api/candidate/:id
app.delete('/api/candidate/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Candidato deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar candidato:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// ===== APIs DE INTEGRAÇÃO =====

// POST /api/gupy-webhook
app.post('/api/gupy-webhook', async (req, res) => {
  try {
    // Aceitar tanto formato { candidate: {...} } quanto { name, email } diretamente
    let candidateData = req.body.candidate || req.body
    
    if (!candidateData || (!candidateData.name && !candidateData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Dados do candidato são obrigatórios (name e email)'
      })
    }

    // Processar dados do Gupy
    const { name, email } = candidateData
    
    // Inserir candidato no banco
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ 
        name, 
        email, 
        status: 'PENDENTE',
        score: 0,
        source: 'GUPY',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      candidate: data[0],
      message: 'Candidato sincronizado com sucesso'
    })
  } catch (error) {
    console.error('Erro no webhook do Gupy:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor API rodando na porta ${PORT}`)
  console.log(`🔧 API: http://localhost:${PORT}`)
})
