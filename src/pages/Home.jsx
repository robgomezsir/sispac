import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LogIn, 
  FileText, 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Home(){
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    console.log("🔐 [Home] Iniciando processo de login...")
    setErr(null); setLoading(true)
    
    try{
      console.log("🔐 [Home] Chamando signIn...")
      const result = await signIn(email, password)
      console.log("✅ [Home] Login bem-sucedido, aguardando redirecionamento automático...", result)
      setSuccess(true)
      // O redirecionamento agora é automático via useAuth
    }catch(e){
      console.error("❌ [Home] Erro no login:", e)
      console.error("❌ [Home] Mensagem de erro:", e.message)
      setErr(e.message)
    }finally{ 
      setLoading(false)
      console.log("🔐 [Home] Processo de login finalizado")
    }
  }

  const features = [
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Autenticação segura e controle de acesso baseado em roles"
    },
    {
      icon: TrendingUp,
      title: "Análise Comportamental",
      description: "Avaliações precisas com algoritmos otimizados"
    },
    {
      icon: Users,
      title: "Gestão de Candidatos",
      description: "Dashboard completo para RH e gestores"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Exportação de dados em múltiplos formatos"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Sistema de Avaliação
            <span className="text-primary block">Comportamental</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plataforma moderna para avaliação e gestão de candidatos com interface intuitiva 
            e ferramentas avançadas de análise comportamental.
          </p>
        </div>
        
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/form" 
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Realizar Teste
              <ArrowRight size={20} />
            </Link>
            <button 
              className="btn-outline text-lg px-8 py-4 flex items-center justify-center gap-2"
              onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <LogIn size={20} />
              Acessar Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="card p-6 text-center space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <feature.icon size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Login Section - Centralizado */}
      {!user && (
        <div id="login-form" className="flex justify-center">
          <div className="card p-8 space-y-6 w-full max-w-md">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <LogIn size={24} />
                Acesso ao Dashboard
              </h2>
              <p className="text-muted-foreground">
                Faça login para acessar o painel administrativo e gerenciar candidatos.
              </p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="label">Email</label>
                <input 
                  className="input" 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="label">Senha</label>
                <input 
                  type="password" 
                  className="input" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                className="btn-primary w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={16} />
                    Entrar no Sistema
                  </div>
                )}
              </button>
            </form>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} />
                Login realizado com sucesso! Redirecionando...
              </div>
            )}

            {err && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                ❌ {err}
              </div>
              )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="card p-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Por que escolher o SisPAC?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Seguro e Confiável</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">+1000</div>
              <div className="text-sm text-muted-foreground">Avaliações Realizadas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
