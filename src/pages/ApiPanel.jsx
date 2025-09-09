import React from 'react'
import { 
  Code, 
  Database, 
  Shield, 
  Key, 
  Globe, 
  Zap,
  ExternalLink,
  Copy,
  CheckCircle,
  Users,
  User,
  Trash2,
  Plus,
  FileText,
  BarChart3,
  Target,
  Award,
  Brain,
  Heart,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useState } from 'react'
// Usando elementos HTML padrão temporariamente

export default function ApiPanel(){
  const [copiedEndpoint, setCopiedEndpoint] = useState(null)
  const [activeTab, setActiveTab] = useState('endpoints')

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  // Endpoints principais da API
  const endpoints = [
    {
      method: 'GET',
      path: '/api/candidates',
      description: 'Lista todos os candidatos com perfil comportamental completo',
      category: 'Candidatos',
      icon: Users,
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.app.com/api/candidates',
      response: {
        status: 200,
        data: [
          {
            id: 1,
            name: "João Silva",
            email: "joao@email.com",
            score: 85,
            status: "ACIMA DA EXPECTATIVA",
            created_at: "2024-01-15T10:30:00Z",
            behavioral_profile: {
              perfil: "Profissional maduro emocionalmente...",
              comportamento: "Proatividade clara...",
              competencias: "Fortes competências interpessoais...",
              lideranca: "Bom potencial para liderar times...",
              areas_desenvolvimento: ["Delegação eficiente..."],
              visao_estrategica: "Visão estratégica de médio prazo...",
              recomendacoes: "Investir em programas de desenvolvimento..."
            }
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/candidate/:id',
      description: 'Detalhes completos de um candidato específico',
      category: 'Candidatos',
      icon: User,
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.app.com/api/candidate/123',
      response: {
        status: 200,
        data: {
          id: 123,
          name: "Maria Santos",
          email: "maria@email.com",
          answers: {
            "1": ["RESPONSÁVEL", "PROATIVA", "COMUNICATIVA"],
            "2": ["LÍDER", "CONFIANTE", "ORGANIZADA"],
            "3": ["Sempre vou aos compromissos..."],
            "4": ["Trabalhar com Amor", "ética", "comprometimento"]
          },
          score: 92,
          status: "SUPEROU A EXPECTATIVA",
          created_at: "2024-01-15T10:30:00Z"
        }
      }
    },
    {
      method: 'POST',
      path: '/api/deleteCandidate',
      description: 'Remove um candidato do sistema (por ID, email ou nome)',
      category: 'Gestão',
      icon: Trash2,
      example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"email": "candidato@email.com"}\' https://your-domain.app.com/api/deleteCandidate',
      response: {
        status: 200,
        data: {
          success: true,
          message: "Candidato removido com sucesso",
          candidate: {
            id: 123,
            name: "João Silva",
            email: "joao@email.com"
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/addUser',
      description: 'Cria um novo usuário do sistema (RH ou Admin)',
      category: 'Gestão',
      icon: Plus,
      example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"name": "Novo Usuário", "email": "usuario@empresa.com", "role": "rh"}\' https://your-domain.app.com/api/addUser',
      response: {
        status: 200,
        data: {
          message: "Usuário Novo Usuário criado com sucesso! Senha temporária: 123456",
          userId: "uuid-here",
          email: "usuario@empresa.com",
          role: "rh",
          profileCreated: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/gupy-webhook',
      description: 'Webhook para receber candidatos da plataforma Gupy com token de acesso único',
      category: 'Integração',
      icon: Globe,
      example: 'curl -X POST -H "Content-Type: application/json" -d \'{"candidate_id": "12345", "name": "João Silva", "email": "joao@email.com", "job_id": "vaga-001"}\' https://your-domain.app.com/api/gupy-webhook',
      response: {
        status: 200,
        data: {
          success: true,
          message: "Candidato criado com sucesso",
          action: "created",
          candidate: {
            id: 123,
            name: "João Silva",
            email: "joao@email.com",
            gupy_candidate_id: "12345",
            status: "PENDENTE_TESTE",
            access_token: "sispac_abc123def456..."
          },
          access_link: "https://your-domain.app.com/form?token=sispac_abc123def456...",
          next_steps: [
            "Candidato receberá link único para teste comportamental",
            "Link expira em 24 horas por segurança",
            "Resultados serão sincronizados automaticamente",
            "RH pode acompanhar progresso no dashboard"
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/api/validate-token',
      description: 'Valida token de acesso único para o formulário',
      category: 'Integração',
      icon: Shield,
      example: 'curl -X POST -H "Content-Type: application/json" -d \'{"token": "sispac_abc123def456..."}\' https://your-domain.app.com/api/validate-token',
      response: {
        status: 200,
        data: {
          valid: true,
          message: "Token válido",
          candidate: {
            id: 123,
            name: "João Silva",
            email: "joao@email.com",
            gupy_candidate_id: "12345",
            status: "PENDENTE_TESTE"
          },
          token_info: {
            created_at: "2024-01-15T10:30:00Z",
            hours_old: 2.5,
            expires_in_hours: 21.5
          }
        }
      }
    }
  ]

  // Sistema de pontuação e classificação
  const scoringSystem = {
    categories: [
      {
        id: 1,
        title: "Como você acha que as pessoas te veem?",
        maxChoices: 5,
        weight: "Características com pesos de 1-3 pontos",
        examples: ["RESPONSÁVEL (2pts)", "LÍDER (2pts)", "GOSTA DE GENTE (3pts)"]
      },
      {
        id: 2,
        title: "E você, como se vê?",
        maxChoices: 5,
        weight: "Características com pesos de 1-3 pontos",
        examples: ["CONFIANTE (1pt)", "PROATIVA (2pts)", "AMOROSA (3pts)"]
      },
      {
        id: 3,
        title: "Frases de vida mais importantes",
        maxChoices: 5,
        weight: "Frases com pesos de 3-5 pontos",
        examples: ["Sempre vou aos compromissos... (3pts)", "Consigo entender como os outros se sentem (5pts)"]
      },
      {
        id: 4,
        title: "Valores mais importantes",
        maxChoices: 5,
        weight: "Valores com pesos de 7-9 pontos",
        examples: ["Trabalhar com Amor (9pts)", "ética (7pts)", "comprometimento (9pts)"]
      }
    ],
    classification: [
      { range: "≤ 67", status: "ABAIXO DA EXPECTATIVA", color: "destructive" },
      { range: "68-75", status: "DENTRO DA EXPECTATIVA", color: "warning" },
      { range: "76-95", status: "ACIMA DA EXPECTATIVA", color: "success" },
      { range: "≥ 96", status: "SUPEROU A EXPECTATIVA", color: "primary" }
    ]
  }

  // Integração com Gupy
  const gupyIntegration = {
    webhook: {
      url: "https://your-domain.app.com/api/gupy-webhook",
      method: "POST",
      description: "Endpoint para receber dados de candidatos da Gupy",
      payload: {
        candidate_id: "ID do candidato na Gupy",
        name: "Nome completo",
        email: "Email do candidato",
        job_id: "ID da vaga",
        application_date: "Data da candidatura"
      }
    },
    sync: {
      description: "Sincronização automática de candidatos",
      frequency: "Tempo real via webhook",
      mapping: {
        "gupy_candidate_id": "candidate_id",
        "gupy_name": "name",
        "gupy_email": "email"
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 p-6 relative z-10">
        {/* Header da página */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-glow">
            <Code size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Painel de API - SisPAC
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Documentação completa da API para integração com Gupy, sistemas de RH e outras plataformas de recrutamento
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="w-full">
          <div className="grid w-full grid-cols-4 mb-8">
            <button 
              onClick={() => setActiveTab('endpoints')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'endpoints' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Database size={16} />
              Endpoints
            </button>
            <button 
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'scoring' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Target size={16} />
              Sistema de Pontuação
            </button>
            <button 
              onClick={() => setActiveTab('gupy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'gupy' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Globe size={16} />
              Integração Gupy
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'security' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Shield size={16} />
              Segurança
            </button>
          </div>

          {/* Aba: Endpoints */}
          {activeTab === 'endpoints' && (
          <div className="space-y-6">
            {/* Informações de Segurança Rápida */}
            <div className="border-warning/20 bg-warning/5 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={20} className="text-warning" />
                  <h3 className="font-semibold text-warning">Autenticação Obrigatória</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Todos os endpoints requerem autenticação via Bearer Token. Configure sua chave de API nas variáveis do projeto.
                </p>
                <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>

            {/* Endpoints por categoria */}
            <div className="space-y-8">
              {['Candidatos', 'Gestão', 'Integração'].map(category => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                      {category === 'Candidatos' ? <Users size={16} className="text-primary" /> : 
                       category === 'Gestão' ? <Plus size={16} className="text-primary" /> :
                       <Globe size={16} className="text-primary" />}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {endpoints
                      .filter(endpoint => endpoint.category === category)
                      .map((endpoint, index) => (
                        <div key={index} className="border-border/50 hover:border-primary/30 transition-colors rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <span 
                                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                    endpoint.method === 'GET' 
                                      ? 'bg-success/20 text-success border-success/30' 
                                      : 'bg-warning/20 text-warning border-warning/30'
                                  }`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-lg font-mono font-semibold text-foreground">
                                  {endpoint.path}
                                </code>
                                <endpoint.icon size={20} className="text-muted-foreground" />
                              </div>
                              
                              <button
                                onClick={() => copyToClipboard(endpoint.example, endpoint.path)}
                                className="flex items-center gap-2 px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors"
                              >
                                {copiedEndpoint === endpoint.path ? (
                                  <CheckCircle size={16} className="text-success" />
                                ) : (
                                  <Copy size={16} />
                                )}
                                {copiedEndpoint === endpoint.path ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                            
                            <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                            
                            <div className="space-y-4">
                              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-muted-foreground">Exemplo de uso:</span>
                                  <ExternalLink size={16} className="text-muted-foreground" />
                                </div>
                                <code className="text-sm font-mono text-foreground break-all">
                                  {endpoint.example}
                                </code>
                              </div>
                              
                              <div className="bg-muted/20 p-4 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText size={16} className="text-info" />
                                  <span className="text-sm font-medium text-muted-foreground">Resposta de exemplo:</span>
                                </div>
                                <pre className="text-xs font-mono text-foreground overflow-x-auto">
                                  {JSON.stringify(endpoint.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Aba: Sistema de Pontuação */}
          {activeTab === 'scoring' && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="flex items-center gap-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <Target size={24} className="text-primary" />
                  Sistema de Avaliação Comportamental
                </h3>
                <p className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  Como funciona o sistema de pontuação e classificação dos candidatos
                </p>
              </div>
              <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                {/* Categorias de perguntas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain size={20} className="text-primary" />
                    Categorias de Avaliação
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {scoringSystem.categories.map((category, index) => (
                      <div key={index} className="border-border/50 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span variant="outline" className="text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                Questão {category.id}
                              </span>
                              <span className="text-sm font-medium text-muted-foreground">
                                {category.maxChoices} escolhas
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm">{category.title}</h4>
                            <p className="text-xs text-muted-foreground">{category.weight}</p>
                            <div className="space-y-1">
                              {category.examples.map((example, i) => (
                                <div key={i} className="text-xs bg-muted/30 px-2 py-1 rounded">
                                  {example}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div  />

                {/* Classificação */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award size={20} className="text-primary" />
                    Classificação por Score
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {scoringSystem.classification.map((item, index) => (
                      <div key={index} className={`rounded-lg border bg-card text-card-foreground shadow-sm border-${item.color}/20 bg-${item.color}/5`}>
                        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">{item.status}</div>
                              <div className="text-xs text-muted-foreground">Score: {item.range}</div>
                            </div>
                            <span 
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-${item.color}/30 text-${item.color}`}>
                              {item.range}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Aba: Integração Gupy */}
          {activeTab === 'gupy' && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="flex items-center gap-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <Globe size={24} className="text-primary" />
                  Integração com Gupy
                </h3>
                <p className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  Como integrar o SisPAC com a plataforma Gupy para sincronização automática de candidatos
                </p>
              </div>
              <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                {/* Webhook */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-primary" />
                    Webhook de Integração
                  </h3>
                  <div className="border-primary/20 bg-primary/5 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span variant="outline" className="text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {gupyIntegration.webhook.method}
                          </span>
                          <code className="text-sm font-mono">{gupyIntegration.webhook.url}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {gupyIntegration.webhook.description}
                        </p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Payload esperado:
                          </div>
                          <pre className="text-xs font-mono text-foreground">
                            {JSON.stringify(gupyIntegration.webhook.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div  />

                {/* Sincronização */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Sincronização de Dados
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-border/50 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-info" />
                            <span className="font-medium text-sm">Frequência</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {gupyIntegration.sync.frequency}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-border/50 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Database size={16} className="text-info" />
                            <span className="font-medium text-sm">Mapeamento</span>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(gupyIntegration.sync.mapping).map(([key, value]) => (
                              <div key={key} className="text-xs bg-muted/30 px-2 py-1 rounded">
                                {key} → {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div  />

                {/* Sistema de Tokens */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    Sistema de Tokens de Acesso
                  </h3>
                  <div className="border-primary/20 bg-primary/5 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Key size={16} className="text-primary" />
                              <span className="font-medium text-sm">Geração Automática</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Token único gerado automaticamente para cada candidato
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-primary" />
                              <span className="font-medium text-sm">Expiração</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Tokens expiram em 24 horas por segurança
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Exemplo de link gerado:
                          </div>
                          <code className="text-xs font-mono text-foreground break-all">
                            https://your-domain.app.com/form?token=sispac_abc123def456...
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div  />

                {/* Fluxo de integração */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star size={20} className="text-primary" />
                    Fluxo de Integração com Tokens
                  </h3>
                  <div className="space-y-3">
                    {[
                      "1. Candidato se inscreve na vaga na Gupy",
                      "2. Gupy envia webhook para o SisPAC",
                      "3. SisPAC gera token único e cria registro do candidato",
                      "4. Candidato recebe link único com token para teste",
                      "5. Formulário valida token antes de permitir acesso",
                      "6. Resultados são salvos e sincronizados automaticamente",
                      "7. RH acessa relatórios no SisPAC"
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Aba: Segurança */}
          {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="flex items-center gap-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <Shield size={24} className="text-primary" />
                  Segurança e Autenticação
                </h3>
                <p className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  Configurações de segurança e autenticação da API
                </p>
              </div>
              <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Key size={20} className="text-primary" />
                      <span className="font-medium">Chave de API</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Configure a variável <code className="bg-muted/50 px-2 py-1 rounded text-xs">API_KEY</code> nas variáveis do projeto.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-info" />
                      <span className="font-medium">Header de Autorização</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Inclua o header <code className="bg-muted/50 px-2 py-1 rounded text-xs">Authorization: Bearer YOUR_API_KEY</code> em todas as requisições.
                    </p>
                  </div>
                </div>

                <div  />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Info size={20} className="text-primary" />
                    Informações Importantes
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-border/50 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-success" />
                            <span className="font-medium text-sm">Formato de Resposta</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Todos os endpoints retornam dados no formato JSON com estrutura padronizada e códigos de status HTTP apropriados.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-border/50 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-info" />
                            <span className="font-medium text-sm">Rate Limiting</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            A API possui limites de requisições por minuto para garantir estabilidade e performance do sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
