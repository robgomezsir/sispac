import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { sispacLogoLarge } from '../assets'
import { 
  LogIn, 
  FileText, 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Award
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input,
  Label,
  Badge,
  Separator
} from '../components/ui'

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
      description: "Autenticação segura e controle de acesso baseado em roles",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: TrendingUp,
      title: "Análise Comportamental",
      description: "Avaliações precisas com algoritmos otimizados",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      icon: Users,
      title: "Gestão de Candidatos",
      description: "Dashboard completo para RH e gestores",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Exportação de dados em múltiplos formatos",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ]

  const stats = [
    { value: "100%", label: "Seguro e Confiável", icon: Shield, color: "text-blue-600" },
    { value: "24/7", label: "Disponível", icon: Zap, color: "text-green-600" },
    { value: "+1000", label: "Avaliações Realizadas", icon: Target, color: "text-purple-600" }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative text-center space-y-8 py-20 px-4">
          {/* Logo Principal */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img src={sispacLogoLarge} alt="SisPAC - Sistema de Avaliação Comportamental" className="h-24 md:h-32 drop-shadow-lg" />
              <div className="absolute -top-2 -right-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  v2.0
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Sistema de Avaliação
              <span className="block text-primary">Comportamental</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Plataforma moderna para avaliação e gestão de candidatos com interface intuitiva 
              e ferramentas avançadas de análise comportamental.
            </p>
          </div>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link to="/form">
                  <FileText className="w-5 h-5 mr-2" />
                  Realizar Teste
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1"
                onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Acessar Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={32} className={feature.color} />
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Login Section - Centralizado */}
      {!user && (
        <div id="login-form" className="flex justify-center px-4">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <LogIn size={32} className="text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Acesso ao Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Faça login para acessar o painel administrativo e gerenciar candidatos.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    placeholder="seu@email.com"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    placeholder="••••••••"
                    className="h-12 text-base"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn size={18} />
                      Entrar no Sistema
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            {success && (
              <CardFooter className="pt-0">
                <div className="w-full p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} />
                  Login realizado com sucesso! Redirecionando...
                </div>
              </CardFooter>
            )}

            {err && (
              <CardFooter className="pt-0">
                <div className="w-full p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  ❌ {err}
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      )}

      {/* Stats Section */}
      <div className="px-4">
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl">Por que escolher o SisPAC?</CardTitle>
            <CardDescription className="text-lg">
              Tecnologia de ponta para resultados excepcionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <stat.icon size={20} className={stat.color} />
                    <span className="text-base font-medium">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center px-4">
        <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="space-y-6">
              <Award className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">Pronto para começar?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Junte-se a centenas de empresas que já confiam no SisPAC para suas avaliações comportamentais.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <Link to="/form">
                      <FileText className="w-5 h-5 mr-2" />
                      Começar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
