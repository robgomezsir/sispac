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

  // O redirecionamento é agora gerenciado pelo useAuth
  // Removido para evitar conflitos de redirecionamento

  async function onSubmit(e){
    e.preventDefault()
    console.log("🔐 [Home] Iniciando processo de login...")
    setErr(null)
    setLoading(true)
    
    try{
      console.log("🔐 [Home] Chamando signIn...")
      await signIn(email, password)
      console.log("✅ [Home] Login bem-sucedido")
      
      // Limpar campos após login bem-sucedido
      setEmail('')
      setPassword('')
      
      // REDIRECIONAMENTO FORÇADO IMEDIATO
      console.log("🚀 [Home] REDIRECIONANDO FORÇADAMENTE PARA DASHBOARD...")
      window.location.href = '/dashboard'
      
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

  // Se já estiver logado, não renderizar nada - deixar o useAuth gerenciar
  if (user) {
    console.log('🔍 [Home] Usuário logado, não renderizando formulário...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <div className="text-muted-foreground">Redirecionando...</div>
        </div>
      </div>
    )
  }

  console.log('🔍 [Home] Mostrando formulário de login...')

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-auto p-6 mobile-scrollable mobile-login-container bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-6xl relative z-10 py-12 mobile-content">
        <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-center min-h-0">
          {/* Lado esquerdo - Informações do sistema */}
          <div className="text-center lg:text-left space-y-8 animate-slide-in-from-left order-2 lg:order-1">
            {/* Logo e título */}
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/20 rounded-3xl border-2 border-primary/30 shadow-2xl animate-float group">
                <img 
                  src="/logo192.png" 
                  alt="SisPAC Logo" 
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-glow">
                  SisPAC
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-bold leading-relaxed">
                  Sistema Propósito de Avaliação Comportamental
                </p>
                <p className="text-lg text-muted-foreground/80 leading-relaxed font-medium">
                  Plataforma moderna para avaliação e análise comportamental de candidatos
                </p>
              </div>
            </div>

            {/* Características do sistema */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-3xl bg-gradient-to-br from-success/15 to-success/8 border-2 border-success/30 hover:from-success/25 hover:to-success/15 transition-all duration-300 group hover:scale-105 transform-gpu shadow-lg hover:shadow-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-success/30 to-success/20 rounded-2xl flex items-center justify-center border-2 border-success/30 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Shield size={28} className="text-success" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-bold text-foreground text-lg">Seguro</h3>
                    <p className="text-sm text-muted-foreground font-medium">Dados protegidos</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-3xl bg-gradient-to-br from-warning/15 to-warning/8 border-2 border-warning/30 hover:from-warning/25 hover:to-warning/15 transition-all duration-300 group hover:scale-105 transform-gpu shadow-lg hover:shadow-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-warning/30 to-warning/20 rounded-2xl flex items-center justify-center border-2 border-warning/30 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Zap size={28} className="text-warning" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-bold text-foreground text-lg">Rápido</h3>
                    <p className="text-sm text-muted-foreground font-medium">Processamento ágil</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-start gap-3 p-4 rounded-3xl bg-gradient-to-br from-info/15 to-info/8 border-2 border-info/30 hover:from-info/25 hover:to-info/15 transition-all duration-300 group hover:scale-105 transform-gpu shadow-lg hover:shadow-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-info/30 to-info/20 rounded-2xl flex items-center justify-center border-2 border-info/30 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Heart size={28} className="text-info" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="font-bold text-foreground text-lg">Intuitivo</h3>
                    <p className="text-sm text-muted-foreground font-medium">Interface amigável</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas ou benefícios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center lg:text-left p-4 rounded-3xl bg-gradient-to-br from-warning/15 to-warning/8 border-2 border-warning/30 hover:scale-105 transition-all duration-300 transform-gpu shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <Star size={24} className="text-warning" />
                  <span className="text-3xl font-black text-foreground">99%</span>
                </div>
                <p className="text-sm text-muted-foreground font-semibold">Precisão nos resultados</p>
              </div>
              
              <div className="text-center lg:text-left p-4 rounded-3xl bg-gradient-to-br from-success/15 to-success/8 border-2 border-success/30 hover:scale-105 transition-all duration-300 transform-gpu shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <Award size={24} className="text-success" />
                  <span className="text-3xl font-black text-foreground">24/7</span>
                </div>
                <p className="text-sm text-muted-foreground font-semibold">Disponibilidade</p>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de login */}
          <div className="animate-slide-in-from-right order-1 lg:order-2 mobile-login-form">
            <Card className="border-0 shadow-2xl backdrop-blur-md max-w-lg mx-auto hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 bg-card/90">
              <CardHeader className="text-center space-y-6 pb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/20 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/30 shadow-2xl animate-pulse-soft group">
                  <Lock size={48} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-black">Acesso ao Sistema</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground/80 font-medium">
                    Faça login para acessar o painel administrativo
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pb-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-base font-bold text-foreground flex items-center gap-3">
                      <Mail size={20} className="text-primary" />
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
                        className="h-16 text-lg pl-14 pr-6 rounded-2xl"
                      />
                      <Mail size={24} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="password" className="text-base font-bold text-foreground flex items-center gap-3">
                      <Lock size={20} className="text-primary" />
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
                        className="h-16 text-lg pl-14 pr-14 rounded-2xl"
                      />
                      <Lock size={24} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-110"
                      >
                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full h-16 text-lg font-bold mt-6 group" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <LogIn size={24} />
                        <span>Entrar no Sistema</span>
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>



              {/* Exibir erros de formulário com design moderno */}
              {err && (
                <div className="px-8 pb-8">
                  <div className="w-full p-6 bg-gradient-to-r from-destructive/15 to-destructive/8 border-2 border-destructive/30 text-destructive rounded-3xl text-base backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-bold">{err}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Footer com informações adicionais */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-base text-muted-foreground/80 font-medium">
                © 2024 SisPAC - Sistema de Avaliação Comportamental
              </p>
              <p className="text-sm text-muted-foreground/60 font-medium">
                Desenvolvido com ❤️ para facilitar a avaliação de candidatos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
