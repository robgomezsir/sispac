import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { 
  Settings, 
  Webhook, 
  TestTube, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Globe,
  Key,
  Clock,
  Users,
  FileText,
  BarChart3,
  Zap,
  Shield,
  Info
} from 'lucide-react'

export default function IntegracaoGupy() {
  const [config, setConfig] = useState({
    webhookUrl: '',
    apiKey: '',
    baseUrl: '',
    tokenExpiry: 24,
    autoGenerateTokens: true,
    enableLogging: true,
    testMode: false
  })

  const [testResults, setTestResults] = useState({
    webhook: null,
    tokenGeneration: null,
    tokenValidation: null,
    formAccess: null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeTokens: 0,
    completedTests: 0,
    lastSync: null
  })

  // Carregar configuração salva
  useEffect(() => {
    loadConfiguration()
    loadStats()
  }, [])

  const loadConfiguration = async () => {
    try {
      const savedConfig = localStorage.getItem('gupy-integration-config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      } else {
        // Configuração padrão
        setConfig(prev => ({
          ...prev,
          webhookUrl: `${window.location.origin}/api/gupy-webhook`,
          baseUrl: window.location.origin
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/candidates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const candidates = data.candidates || []
        
        setStats({
          totalCandidates: candidates.length,
          activeTokens: candidates.filter(c => c.access_token && !c.score).length,
          completedTests: candidates.filter(c => c.score).length,
          lastSync: candidates.length > 0 ? candidates[0].created_at : null
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const saveConfiguration = () => {
    localStorage.setItem('gupy-integration-config', JSON.stringify(config))
    addLog('Configuração salva com sucesso', 'success')
  }

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    }
    setLogs(prev => [newLog, ...prev.slice(0, 49)]) // Manter apenas 50 logs
  }

  const testWebhook = async () => {
    setIsLoading(true)
    addLog('Testando webhook da Gupy...', 'info')
    
    try {
      const testData = {
        candidate_id: 'test_123',
        name: 'Candidato Teste',
        email: 'teste@exemplo.com',
        position: 'Desenvolvedor',
        source: 'gupy'
      }

      const response = await fetch('/api/gupy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, webhook: { success: true, data: result } }))
        addLog('Webhook testado com sucesso!', 'success')
      } else {
        setTestResults(prev => ({ ...prev, webhook: { success: false, error: result } }))
        addLog(`Erro no webhook: ${result.message}`, 'error')
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, webhook: { success: false, error: error.message } }))
      addLog(`Erro ao testar webhook: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testTokenGeneration = async () => {
    setIsLoading(true)
    addLog('Testando geração de token...', 'info')
    
    try {
      const testData = {
        candidate_id: 'token_test_456',
        name: 'Token Teste',
        email: 'token@exemplo.com',
        position: 'Analista',
        source: 'gupy'
      }

      const response = await fetch('/api/gupy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('api_key')}`
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      
      if (response.ok && result.access_token) {
        setTestResults(prev => ({ ...prev, tokenGeneration: { success: true, token: result.access_token, link: result.access_link } }))
        addLog('Token gerado com sucesso!', 'success')
      } else {
        setTestResults(prev => ({ ...prev, tokenGeneration: { success: false, error: result } }))
        addLog(`Erro na geração de token: ${result.message}`, 'error')
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, tokenGeneration: { success: false, error: error.message } }))
      addLog(`Erro ao gerar token: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testTokenValidation = async () => {
    if (!testResults.tokenGeneration?.token) {
      addLog('Gere um token primeiro para testar a validação', 'warning')
      return
    }

    setIsLoading(true)
    addLog('Testando validação de token...', 'info')
    
    try {
      const response = await fetch('/api/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: testResults.tokenGeneration.token })
      })

      const result = await response.json()
      
      if (response.ok && result.valid) {
        setTestResults(prev => ({ ...prev, tokenValidation: { success: true, data: result } }))
        addLog('Token validado com sucesso!', 'success')
      } else {
        setTestResults(prev => ({ ...prev, tokenValidation: { success: false, error: result } }))
        addLog(`Erro na validação: ${result.message}`, 'error')
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, tokenValidation: { success: false, error: error.message } }))
      addLog(`Erro ao validar token: ${error.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testFormAccess = () => {
    if (!testResults.tokenGeneration?.link) {
      addLog('Gere um token primeiro para testar o acesso ao formulário', 'warning')
      return
    }

    addLog('Abrindo formulário com token...', 'info')
    window.open(testResults.tokenGeneration.link, '_blank')
    setTestResults(prev => ({ ...prev, formAccess: { success: true, link: testResults.tokenGeneration.link } }))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    addLog('Copiado para a área de transferência!', 'success')
  }

  const generateGupyConfig = () => {
    const gupyConfig = {
      webhook_url: config.webhookUrl,
      events: ['candidate.created', 'candidate.updated'],
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      timeout: 30,
      retry_policy: {
        max_attempts: 3,
        backoff_multiplier: 2
      }
    }

    return JSON.stringify(gupyConfig, null, 2)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Sucesso</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Atenção</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Info className="w-3 h-3 mr-1" />Info</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integração Gupy</h1>
          <p className="text-gray-600 mt-2">Configure e gerencie a integração entre o SisPAC e a Gupy</p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Candidatos</p>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tokens Ativos</p>
                <p className="text-2xl font-bold">{stats.activeTokens}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Testes Concluídos</p>
                <p className="text-2xl font-bold">{stats.completedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Última Sincronização</p>
                <p className="text-sm font-medium">
                  {stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Nunca'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Aba de Configuração */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações da Integração
              </CardTitle>
              <CardDescription>
                Configure os parâmetros da integração com a Gupy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <Input
                      id="webhookUrl"
                      value={config.webhookUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://sua-app.app.com/api/gupy-webhook"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL que a Gupy usará para enviar dados dos candidatos
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">Chave da API</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Sua chave de API"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Chave para autenticação das requisições
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="baseUrl">URL Base da Aplicação</Label>
                    <Input
                      id="baseUrl"
                      value={config.baseUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://sua-app.app.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL base para gerar links de acesso
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tokenExpiry">Expiração do Token (horas)</Label>
                    <Input
                      id="tokenExpiry"
                      type="number"
                      value={config.tokenExpiry}
                      onChange={(e) => setConfig(prev => ({ ...prev, tokenExpiry: parseInt(e.target.value) }))}
                      min="1"
                      max="168"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tempo de validade dos tokens de acesso (1-168 horas)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoGenerateTokens"
                        checked={config.autoGenerateTokens}
                        onChange={(e) => setConfig(prev => ({ ...prev, autoGenerateTokens: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="autoGenerateTokens">Gerar tokens automaticamente</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableLogging"
                        checked={config.enableLogging}
                        onChange={(e) => setConfig(prev => ({ ...prev, enableLogging: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="enableLogging">Habilitar logs detalhados</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="testMode"
                        checked={config.testMode}
                        onChange={(e) => setConfig(prev => ({ ...prev, testMode: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="testMode">Modo de teste</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex space-x-4">
                <Button onClick={saveConfiguration}>
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </Button>
                <Button variant="outline" onClick={loadConfiguration}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Carregar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuração para a Gupy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Configuração para a Gupy
              </CardTitle>
              <CardDescription>
                Use esta configuração na plataforma Gupy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>URL do Webhook (copie para a Gupy)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={config.webhookUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(config.webhookUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Configuração JSON Completa</Label>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {generateGupyConfig()}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateGupyConfig())}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Testes */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="w-5 h-5 mr-2" />
                Testes de Integração
              </CardTitle>
              <CardDescription>
                Teste cada componente da integração para garantir que está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teste do Webhook */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Webhook className="w-4 h-4 mr-2" />
                      Webhook da Gupy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Testa se o webhook está recebendo dados corretamente
                    </p>
                    
                    {testResults.webhook && (
                      <div className="space-y-2">
                        {getStatusBadge(testResults.webhook.success ? 'success' : 'error')}
                        {testResults.webhook.success && (
                          <div className="text-sm">
                            <p><strong>Candidato criado:</strong> {testResults.webhook.data.candidate?.name}</p>
                            <p><strong>Token gerado:</strong> {testResults.webhook.data.access_token ? 'Sim' : 'Não'}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={testWebhook} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Testar Webhook
                    </Button>
                  </CardContent>
                </Card>

                {/* Teste de Geração de Token */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Geração de Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Testa a geração de tokens únicos de acesso
                    </p>
                    
                    {testResults.tokenGeneration && (
                      <div className="space-y-2">
                        {getStatusBadge(testResults.tokenGeneration.success ? 'success' : 'error')}
                        {testResults.tokenGeneration.success && (
                          <div className="text-sm space-y-1">
                            <p><strong>Token:</strong> {testResults.tokenGeneration.token.substring(0, 20)}...</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(testResults.tokenGeneration.token)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar Token
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={testTokenGeneration} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Gerar Token de Teste
                    </Button>
                  </CardContent>
                </Card>

                {/* Teste de Validação de Token */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Validação de Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Testa se o token gerado é válido
                    </p>
                    
                    {testResults.tokenValidation && (
                      <div className="space-y-2">
                        {getStatusBadge(testResults.tokenValidation.success ? 'success' : 'error')}
                        {testResults.tokenValidation.success && (
                          <div className="text-sm">
                            <p><strong>Candidato:</strong> {testResults.tokenValidation.data.candidate?.name}</p>
                            <p><strong>Email:</strong> {testResults.tokenValidation.data.candidate?.email}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={testTokenValidation} 
                      disabled={isLoading || !testResults.tokenGeneration?.token}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Validar Token
                    </Button>
                  </CardContent>
                </Card>

                {/* Teste de Acesso ao Formulário */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Acesso ao Formulário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Testa o acesso direto ao formulário com token
                    </p>
                    
                    {testResults.formAccess && (
                      <div className="space-y-2">
                        {getStatusBadge(testResults.formAccess.success ? 'success' : 'error')}
                        {testResults.formAccess.success && (
                          <div className="text-sm">
                            <p><strong>Link gerado:</strong> Formulário aberto em nova aba</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={testFormAccess} 
                      disabled={!testResults.tokenGeneration?.link}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Formulário
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo dos Testes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Resumo dos Testes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.webhook?.success ? '✅' : '⏳'}
                      </div>
                      <p className="text-sm text-gray-600">Webhook</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.tokenGeneration?.success ? '✅' : '⏳'}
                      </div>
                      <p className="text-sm text-gray-600">Geração</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {testResults.tokenValidation?.success ? '✅' : '⏳'}
                      </div>
                      <p className="text-sm text-gray-600">Validação</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {testResults.formAccess?.success ? '✅' : '⏳'}
                      </div>
                      <p className="text-sm text-gray-600">Formulário</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Documentação */}
        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documentação da Integração
              </CardTitle>
              <CardDescription>
                Guia completo para configurar a integração na Gupy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>Passo a Passo para Configurar na Gupy</h3>
                <ol className="space-y-4">
                  <li>
                    <strong>1. Acesse o Painel da Gupy</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Faça login na plataforma Gupy e acesse as configurações de integração
                    </p>
                  </li>
                  
                  <li>
                    <strong>2. Configure o Webhook</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Adicione a URL do webhook: <code className="bg-gray-100 px-2 py-1 rounded">{config.webhookUrl}</code>
                    </p>
                  </li>
                  
                  <li>
                    <strong>3. Configure os Eventos</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Selecione os eventos: <code className="bg-gray-100 px-2 py-1 rounded">candidate.created</code> e <code className="bg-gray-100 px-2 py-1 rounded">candidate.updated</code>
                    </p>
                  </li>
                  
                  <li>
                    <strong>4. Configure os Headers</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Adicione o header de autorização: <code className="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer {config.apiKey}</code>
                    </p>
                  </li>
                  
                  <li>
                    <strong>5. Teste a Integração</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Use os testes disponíveis nesta página para verificar se tudo está funcionando
                    </p>
                  </li>
                </ol>

                <Separator className="my-6" />

                <h3>Estrutura dos Dados Enviados</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm">
{`{
  "candidate_id": "gupy_12345",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "position": "Desenvolvedor Frontend",
  "source": "gupy",
  "phone": "+55 11 99999-9999",
  "resume_url": "https://gupy.com/resume/12345"
}`}
                  </pre>
                </div>

                <Separator className="my-6" />

                <h3>Resposta do Webhook</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm">
{`{
  "success": true,
  "message": "Candidato criado com sucesso",
  "candidate": {
    "id": "uuid-gerado",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "access_token": "sispac_abc123...",
  "access_link": "https://app.com/form?token=sispac_abc123...",
  "next_steps": [
    "Envie o access_link para o candidato",
    "O link expira em 24 horas",
    "O candidato pode acessar diretamente o formulário"
  ]
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Logs da Integração
              </CardTitle>
              <CardDescription>
                Acompanhe as atividades e erros da integração em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum log disponível</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {log.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {log.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                        {log.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
