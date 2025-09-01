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
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from '../components/Sidebar.jsx'

export default function ApiPanel(){
  const [copiedEndpoint, setCopiedEndpoint] = useState(null)

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/api/candidates',
      description: 'Lista candidatos (nome, email, score, status)',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.vercel.app/api/candidates'
    },
    {
      method: 'GET',
      path: '/api/candidate/:id',
      description: 'Detalhe do candidato específico',
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://your-domain.vercel.app/api/candidate/123'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Sidebar />
      <div className="max-w-6xl mx-auto space-y-8 p-6 relative z-10">
        {/* Header da página */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-glow">
            <Code size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Painel de API
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Endpoints disponíveis para integrações externas como Gupy, sistemas de RH e outras plataformas
          </p>
        </div>

        {/* Informações de Segurança */}
        <div className="card-modern p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center border border-warning/20">
              <Shield size={24} className="text-warning" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Segurança e Autenticação</h2>
              <p className="text-muted-foreground">Todos os endpoints são protegidos por autenticação</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-primary" />
                <span className="font-medium">Chave de API</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Configure a variável <code className="bg-muted/50 px-2 py-1 rounded text-xs">VERCEL_API_KEY</code> nas variáveis do projeto Vercel.
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
        </div>

        {/* Endpoints Disponíveis */}
        <div className="card-modern p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center border border-success/20">
              <Database size={24} className="text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Endpoints Disponíveis</h2>
              <p className="text-muted-foreground">Lista completa de endpoints da API</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="p-6 border border-border/50 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      endpoint.method === 'GET' 
                        ? 'bg-success/20 text-success border border-success/30' 
                        : 'bg-warning/20 text-warning border border-warning/30'
                    }`}>
                      {endpoint.method}
                    </div>
                    <code className="text-lg font-mono font-semibold text-foreground">{endpoint.path}</code>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(endpoint.example, endpoint.path)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted/70 rounded-lg transition-colors duration-200"
                  >
                    {copiedEndpoint === endpoint.path ? (
                      <CheckCircle size={16} className="text-success" />
                    ) : (
                      <Copy size={16} className="text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {copiedEndpoint === endpoint.path ? 'Copiado!' : 'Copiar'}
                    </span>
                  </button>
                </div>
                
                <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Exemplo de uso:</span>
                    <ExternalLink size={16} className="text-muted-foreground" />
                  </div>
                  <code className="text-sm font-mono text-foreground break-all">
                    {endpoint.example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentação Adicional */}
        <div className="card-modern p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center border border-info/20">
              <Zap size={24} className="text-info" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Documentação e Suporte</h2>
              <p className="text-muted-foreground">Recursos adicionais para desenvolvedores</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Formato de Resposta</h3>
              <p className="text-muted-foreground text-sm">
                Todos os endpoints retornam dados no formato JSON com estrutura padronizada e códigos de status HTTP apropriados.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Rate Limiting</h3>
              <p className="text-muted-foreground text-sm">
                A API possui limites de requisições por minuto para garantir estabilidade e performance do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
