import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { sispacLogoLarge } from '../assets'
import { 
  LogIn, 
  CheckCircle
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
  Label
} from '../components/ui'

export default function Home(){
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  // Redirecionar automaticamente se já estiver logado
  useEffect(() => {
    if (user) {
      console.log("🚀 [Home] Usuário já logado, redirecionando para dashboard...")
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function onSubmit(e){
    e.preventDefault()
    console.log("🔐 [Home] Iniciando processo de login...")
    setErr(null)
    setLoading(true)
    
    try{
      console.log("🔐 [Home] Chamando signIn...")
      const result = await signIn(email, password)
      console.log("✅ [Home] Login bem-sucedido:", result)
      
      // Aguardar um momento para o estado ser atualizado
      setTimeout(() => {
        if (user) {
          console.log("🚀 [Home] Redirecionando para dashboard...")
          navigate('/dashboard', { replace: true })
        }
      }, 100)
      
    }catch(e){
      console.error("❌ [Home] Erro no login:", e)
      console.error("❌ [Home] Mensagem de erro:", e.message)
      setErr(e.message)
    }finally{ 
      setLoading(false)
      console.log("🔐 [Home] Processo de login finalizado")
    }
  }

  // Se já estiver logado, mostrar loading
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="w-full max-w-md px-4">
        {/* Logo e Título Principal */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={sispacLogoLarge} alt="SisPAC Logo" className="h-20 md:h-24" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            SisPAC
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Sistema Propósito de Avaliação Comportamental
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <LogIn size={32} className="text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-base">
                Faça login para acessar o painel administrativo
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

          {err && (
            <CardFooter className="pt-0">
              <div className="w-full p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                ❌ {err}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
