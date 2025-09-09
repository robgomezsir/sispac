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

    // Verificar se o token é válido (simulação)
    const token = authHeader.replace('Bearer ', '')
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
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
    // Verificar se há token de autorização
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      // Verificar se o token é válido no Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError)
        return res.status(401).json({
          success: false,
          error: 'Token inválido ou expirado'
        })
      }

      console.log('✅ Usuário autenticado:', user.email)
    } else {
      console.log('⚠️ Requisição sem autenticação - modo demonstração')
    }

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar candidatos:', error)
      throw error
    }

    console.log('✅ Candidatos encontrados:', data?.length || 0)
    
    // Retornar array diretamente para compatibilidade com o Dashboard
    res.json(data || [])
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

// ===== APIs DE GESTÃO =====

// POST /api/addUser
app.post('/api/addUser', async (req, res) => {
  try {
    // Verificar se há token de autorização
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar se o token é válido no Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      })
    }

    console.log('✅ Usuário autenticado para criação:', user.email)

    const { name, email, role } = req.body
    
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e role são obrigatórios'
      })
    }

    // Criar usuário no Supabase Auth usando signUp
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: '123456', // Senha temporária
      options: {
        data: {
          name,
          role,
          temporary_password: true
        }
      }
    })

    if (signUpError) {
      console.error('Erro ao criar usuário no auth:', signUpError)
      throw signUpError
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário')
    }

    console.log('✅ Usuário criado no auth:', authData.user.email)

    // Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role
      })

    if (profileError) {
      console.warn('Erro ao criar perfil:', profileError)
    } else {
      console.log('✅ Perfil criado com sucesso')
    }

    res.status(201).json({
      success: true,
      message: `Usuário ${name} criado com sucesso! Senha temporária: 123456`,
      userId: authData.user.id,
      email,
      role,
      profileCreated: !profileError,
      temporaryPassword: '123456'
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// POST /api/deleteCandidate
app.post('/api/deleteCandidate', async (req, res) => {
  try {
    // Verificar se há token de autorização
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorização necessário'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar se o token é válido no Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      })
    }

    console.log('✅ Usuário autenticado para remoção:', user.email)

    const { id, email, name } = req.body
    
    if (!id && !email && !name) {
      return res.status(400).json({
        success: false,
        error: 'ID, email ou nome do candidato é obrigatório'
      })
    }

    let query = supabase.from('candidates').delete()
    
    if (id) {
      query = query.eq('id', id)
    } else if (email) {
      query = query.eq('email', email)
    } else if (name) {
      query = query.eq('name', name)
    }

    const { error } = await query

    if (error) {
      console.error('Erro ao remover candidato:', error)
      throw error
    }

    console.log('✅ Candidato removido com sucesso')
    res.json({
      success: true,
      message: 'Candidato removido com sucesso',
      candidate: { id, email, name }
    })
  } catch (error) {
    console.error('Erro ao remover candidato:', error)
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
    console.log('🔍 Webhook Gupy recebido:', req.body)
    
    // Aceitar tanto formato { candidate: {...} } quanto { name, email } diretamente
    let candidateData = req.body.candidate || req.body
    
    if (!candidateData || (!candidateData.name && !candidateData.email)) {
      console.error('❌ Dados do candidato inválidos:', candidateData)
      return res.status(400).json({
        success: false,
        error: 'Dados do candidato são obrigatórios (name e email)'
      })
    }

    // Processar dados do Gupy
    const { name, email } = candidateData
    console.log('✅ Processando candidato:', { name, email })
    
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
      console.error('❌ Erro ao inserir candidato:', error)
      throw error
    }

    console.log('✅ Candidato inserido com sucesso:', data[0])

    // Gerar token único para o candidato
    const uniqueToken = `sispac_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    const accessLink = `${req.protocol}://${req.get('host')}/form?token=${uniqueToken}`
    
    console.log('✅ Token gerado:', uniqueToken)
    console.log('✅ Link de acesso:', accessLink)
    
    res.status(201).json({
      success: true,
      candidate: data[0],
      access_token: uniqueToken,
      token: uniqueToken,
      access_link: accessLink,
      message: 'Candidato sincronizado com sucesso'
    })
  } catch (error) {
    console.error('❌ Erro no webhook do Gupy:', error)
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
