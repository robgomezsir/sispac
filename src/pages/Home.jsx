import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { 
  LogIn, 
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Star,
  Award,
  Target
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Input,
  Label
} from '../components/ui'

export default function Home(){
  const { user, signIn, isLoading, authError, clearError, retryConnection } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  // Debug logs
  useEffect(() => {
    console.log('🔍 [Home] Componente Home renderizado')
    console.log('🔍 [Home] Estado atual:', { user: !!user, isLoading, loading, authError })
  }, [user, isLoading, loading, authError])

  // Redirecionar automaticamente se já estiver logado - SEM dependências circulares
  useEffect(() => {
    console.log('🔍 [Home] Verificando redirecionamento...')
    if (user && !isLoading && !hasRedirected.current) {
      console.log("🚀 [Home] Usuário já logado, redirecionando para dashboard...")
      hasRedirected.current = true
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading]) // Removida dependência navigate

  async function onSubmit(e){
    e.preventDefault()
    console.log("🔐 [Home] Iniciando processo de login...")
    setErr(null)
    setLoading(true)
    
    try{
      console.log("🔐 [Home] Chamando signIn...")
      await signIn(email, password)
      console.log("✅ [Home] Login bem-sucedido")
      
      // O redirecionamento será feito automaticamente pelo useAuth
      // Não precisamos fazer nada aqui
      
    }catch(e){
      console.error("❌ [Home] Erro no login:", e)
      console.error("❌ [Home] Mensagem de erro:", e.message)
      setErr(e.message)
    }finally{ 
      setLoading(false)
      console.log("🔐 [Home] Processo de login finalizado")
    }
  }

  // Se ainda estiver carregando, mostrar loading
  if (isLoading) {
    console.log('🔍 [Home] Mostrando tela de carregamento...')
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-glow animate-pulse-soft">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Carregando Sistema</h2>
          <p className="text-muted-foreground text-lg">Preparando sua experiência...</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-soft"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-soft" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-soft" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  // Se já estiver logado, mostrar loading de redirecionamento
  if (user) {
    console.log('🔍 [Home] Usuário logado, mostrando tela de redirecionamento...')
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-success/20 shadow-glow-success animate-pulse-soft">
            <CheckCircle size={48} className="text-success animate-bounce-soft" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Confirmado!</h2>
          <p className="text-muted-foreground text-lg">Redirecionando para o dashboard...</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-success rounded-full animate-bounce-soft"></div>
            <div className="w-2 h-2 bg-success rounded-full animate-bounce-soft" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-success rounded-full animate-bounce-soft" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  console.log('🔍 [Home] Mostrando formulário de login...')

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="w-full max-w-4xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Lado esquerdo - Informações do sistema */}
          <div className="text-center lg:text-left space-y-8 animate-slide-in-from-left">
            {/* Logo e título */}
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl border border-primary/20 shadow-glow animate-bounce-soft">
                <img 
                  src="/logo192.png" 
                  alt="SisPAC Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  SisPAC
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
                  Sistema Propósito de Avaliação Comportamental
                </p>
                <p className="text-lg text-muted-foreground/80 leading-relaxed">
                  Plataforma moderna para avaliação e análise comportamental de candidatos
                </p>
              </div>
            </div>

            {/* Características do sistema */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center border border-success/20 group-hover:scale-110 transition-transform duration-300">
                    <Shield size={24} className="text-success" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-semibold text-foreground">Seguro</h3>
                    <p className="text-sm text-muted-foreground">Dados protegidos</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center border border-warning/20 group-hover:scale-110 transition-transform duration-300">
                    <Zap size={24} className="text-warning" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-semibold text-foreground">Rápido</h3>
                    <p className="text-sm text-muted-foreground">Processamento ágil</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center border border-info/20 group-hover:scale-110 transition-transform duration-300">
                    <Heart size={24} className="text-info" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-semibold text-foreground">Intuitivo</h3>
                    <p className="text-sm text-muted-foreground">Interface amigável</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas ou benefícios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center lg:text-left p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Star size={20} className="text-warning" />
                  <span className="text-2xl font-bold text-foreground">99%</span>
                </div>
                <p className="text-sm text-muted-foreground">Precisão nos resultados</p>
              </div>
              
              <div className="text-center lg:text-left p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Award size={20} className="text-success" />
                  <span className="text-2xl font-bold text-foreground">24/7</span>
                </div>
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de login */}
          <div className="animate-slide-in-from-right">
            <Card className="card-modern border-0 shadow-2xl backdrop-blur-sm max-w-md mx-auto">
              <CardHeader className="text-center space-y-6 pb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
                  <Lock size={40} className="text-primary" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-bold">Acesso ao Sistema</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground/80">
                    Faça login para acessar o painel administrativo
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pb-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      Email
                    </Label>
                    <div className="relative">
                      <Input 
                        id="email"
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required
                        placeholder="seu@email.com"
                        className="input-modern h-14 text-base pl-12 pr-4"
                      />
                      <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Lock size={16} className="text-primary" />
                      Senha
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required
                        placeholder="••••••••"
                        className="input-modern h-14 text-base pl-12 pr-12"
                      />
                      <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="btn-primary-modern w-full h-14 text-lg font-semibold mt-6 group" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <LogIn size={20} />
                        <span>Entrar no Sistema</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>

              {/* Exibir erros de autenticação com design moderno */}
              {authError && (
                <div className="px-6 pb-6">
                  <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-2xl text-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="flex-1 font-medium">{authError}</span>
                      <button
                        onClick={clearError}
                        className="text-destructive/70 hover:text-destructive transition-colors duration-200 p-1 rounded-lg hover:bg-destructive/10"
                        title="Fechar"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {retryConnection && (
                      <button
                        onClick={retryConnection}
                        disabled={isLoading}
                        className="mt-3 text-xs text-destructive/80 hover:text-destructive underline transition-colors duration-200 font-medium"
                      >
                        Tentar novamente
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Exibir erros de formulário com design moderno */}
              {err && (
                <div className="px-6 pb-6">
                  <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-2xl text-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">{err}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Footer com informações adicionais */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-sm text-muted-foreground/80">
                © 2024 SisPAC - Sistema de Avaliação Comportamental
              </p>
              <p className="text-xs text-muted-foreground/60">
                Desenvolvido com ❤️ para facilitar a avaliação de candidatos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
