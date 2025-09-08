import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { computeScore, classify } from '../utils/scoring'
import { questions } from '../data/questions'
import { supabase } from '../lib/supabase'
import { validateCandidateToken } from '../api/validate-token'
import { Progress } from '../ui/progress'
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail,
  Send,
  AlertCircle,
  ChevronUp,
  Sparkles,
  Target,
  Award,
  Clock,
  Star,
  Heart,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Brain,
  Lightbulb,
  Users,
  BarChart3,
  Timer,
  Calendar,
  BookOpen,
  GraduationCap,
  ChevronDown,
  FileText
} from 'lucide-react'
// Usando elementos HTML padrão temporariamente

export default function FormularioNew(){
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [tokenValidating, setTokenValidating] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [candidateData, setCandidateData] = useState(null)
  const [tokenError, setTokenError] = useState(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [privacyExpanded, setPrivacyExpanded] = useState(false)

  // Validar token na inicialização
  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        // Se não há token, permitir acesso direto (compatibilidade com fluxo antigo)
        setTokenValid(true)
        return
      }
      
      // Validar token usando o novo sistema
      try {
        const validation = await validateCandidateToken(token)
        if (validation.valid) {
          console.log('✅ [Formulario] Token válido:', token)
          setTokenValid(true)
          setCandidateData({
            id: validation.candidate.id,
            name: validation.candidate.name,
            email: validation.candidate.email,
            status: 'PENDENTE_TESTE'
          })
          setNome(validation.candidate.name)
          setEmail(validation.candidate.email)
          return
        } else {
          console.log('❌ [Formulario] Token inválido:', validation.error)
          setTokenValid(false)
          setTokenError(validation.error)
          return
        }
      } catch (error) {
        console.error('❌ [Formulario] Erro na validação do token:', error)
        setTokenValid(false)
        setTokenError('Erro na validação do token')
        return
      }
      // Token validado acima, não precisa fazer mais nada
    }
  }, [searchParams])

  // Auto-scroll para o topo quando mudar de pergunta
  useEffect(() => {
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        window.scrollTo(0, 0)
      }
    }
    
    const timer = setTimeout(scrollToTop, 100)
    return () => clearTimeout(timer)
  }, [step])

  // Scroll para o topo quando mostrar resultados
  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
          window.scrollTo(0, 0)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [sent])

  // Timer para acompanhar tempo gasto
  useEffect(() => {
    if (!sent && step > 0) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [sent, step])

  // Função para alternar resposta
  const toggleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || []
      const isSelected = currentAnswers.includes(answer)
      
      if (isSelected) {
        // Remover resposta
        return {
          ...prev,
          [questionId]: currentAnswers.filter(a => a !== answer)
        }
      } else {
        // Adicionar resposta (se não exceder o limite)
        const question = questions.find(q => q.id === questionId)
        if (currentAnswers.length < question.maxChoices) {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer]
          }
        }
        return prev
      }
    })
  }, [])

  // Função para verificar se pode avançar
  const canProceed = useMemo(() => {
    if (step >= questions.length) return true
    
    const question = questions[step - 1]
    if (!question) return false
    
    const questionAnswers = answers[question.id] || []
    
    return questionAnswers.length === question.maxChoices
  }, [step, answers])

  // Função para verificar se pode voltar
  const canGoBack = useMemo(() => {
    return step > 0
  }, [step])

  // Função para avançar
  const nextStep = useCallback(() => {
    if (canProceed && step < questions.length) {
      setStep(step + 1)
    }
  }, [canProceed, step])

  // Função para voltar
  const prevStep = useCallback(() => {
    if (canGoBack) {
      setStep(step - 1)
    }
  }, [canGoBack, step])

  // NOVA FUNÇÃO SIMPLIFICADA PARA ENVIAR RESPOSTAS
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    
    try {
      const { totalScore, questionScores } = computeScore(answers, questions)
      const status = classify(totalScore)
      const token = searchParams.get('token')

      if (token) {
        // NOVA ABORDAGEM: Usar API específica para atualizar candidato via token
        
        const response = await fetch('/api/updateCandidateByToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            answers,
            score: totalScore,
            status
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao atualizar candidato')
        }
        
      } else {
        // Fluxo sem token: usar API insertCandidate (que já verifica candidatos pendentes)
        
        const response = await fetch('/api/insertCandidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nome.trim(),
            email: email.toLowerCase(),
            answers,
            score: totalScore,
            status
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 409) {
            alert('Você já respondeu o teste. Obrigado!')
            setSent(true)
            return
          }
          throw new Error(data.message || 'Erro ao processar candidato')
        }
      }

      setSent(true)
      
    } catch (err) {
      setError(err.message || 'Erro ao enviar respostas')
    } finally {
      setSending(false)
    }
  }

  // Calcular progresso
  const progress = useMemo(() => {
    if (step === 0) return 0
    return ((step - 1) / questions.length) * 100
  }, [step])

  // Formatar tempo
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Se está validando token, mostrar loading
  if (tokenValidating) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6 animate-slide-in-from-top">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow animate-pulse">
                <Shield size={40} className="sm:w-12 sm:h-12 text-primary" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Validando Acesso
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium px-4">
                  Verificando seu link de acesso...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se token é inválido, mostrar erro
  if (tokenError) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6 animate-slide-in-from-top">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center mx-auto border border-destructive/20 shadow-glow">
                <AlertCircle size={40} className="sm:w-12 sm:h-12 text-destructive" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-destructive to-foreground bg-clip-text text-transparent">
                  Acesso Negado
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium px-4">
                  {tokenError}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-modern animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
              <div className="p-6 sm:p-8 text-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center mx-auto border border-destructive/20">
                    <AlertCircle size={32} className="sm:w-10 sm:h-10 text-destructive" />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Link Inválido ou Expirado</h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-4">
                      O link que você está tentando usar é inválido, expirou ou já foi utilizado. 
                      Entre em contato com o RH para solicitar um novo link de acesso.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto"
                  >
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se já foi enviado, mostrar tela de sucesso
  if (sent) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Header de sucesso */}
            <div className="space-y-4 sm:space-y-6 animate-slide-in-from-top">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto border border-success/20 shadow-glow-success animate-bounce-soft">
                <CheckCircle size={40} className="sm:w-12 sm:h-12 text-success" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-success to-foreground bg-clip-text text-transparent">
                  Teste Concluído!
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium px-4">
                  Obrigado por participar da nossa avaliação comportamental
                </p>
              </div>
            </div>

            {/* Mensagem de agradecimento */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-modern animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
              <div className="p-6 sm:p-8 text-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto border border-success/20 shadow-glow-success">
                    <CheckCircle size={32} className="sm:w-10 sm:h-10 text-success" />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Teste Finalizado com Sucesso!</h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-4">
                      Obrigado por participar da nossa avaliação comportamental. 
                      Suas respostas foram salvas e serão analisadas pela nossa equipe.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto"
                  >
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Header moderno */}
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20 mb-2 sm:mb-4">
              <img 
                src="/logo192.png" 
                alt="SisPAC Logo" 
                className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Avaliação Comportamental
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Descubra seu perfil comportamental através deste teste especializado
              </p>
            </div>
          </div>

          {/* Barra de progresso moderna */}
          {step > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2">
                <span>Progresso do teste</span>
                <span>{step - 1} de {questions.length}</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Timer size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>Tempo: {formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{Math.round(progress)}% concluído</span>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo principal */}
          <div className="animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
            {step === 0 ? (
              // Tela inicial
              <div className="card-modern rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
                    <GraduationCap size={32} className="sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-bold">Bem-vindo ao Teste</h3>
                    <p className="text-base sm:text-lg text-muted-foreground/80 px-4">
                      Antes de começar, precisamos de algumas informações básicas
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="space-y-3 sm:space-y-4">
                    <label htmlFor="nome" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      Nome Completo
                    </label>
                    <input 
                      id="nome"
                      type="text"
                      value={nome} 
                      onChange={e => setNome(e.target.value)} 
                      required
                      placeholder="Digite seu nome completo"
                      className="input-modern h-12 sm:h-14 text-base"
                    />
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      Email
                    </label>
                    <input 
                      id="email"
                      type="email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                      placeholder="seu@email.com"
                      className="input-modern h-12 sm:h-14 text-base"
                    />
                  </div>

                  {/* Cartão de Aceite da Política de Privacidade */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-border/50 bg-card/50 hover:shadow-md transition-all duration-300">
                      <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* Header do cartão */}
                          <div 
                            className="flex items-center justify-between cursor-pointer group"
                            onClick={() => setPrivacyExpanded(!privacyExpanded)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                <Shield size={16} className="text-primary" />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="privacy-accept"
                                  checked={privacyAccepted}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setPrivacyAccepted(e.target.checked)
                                  }}
                                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                                />
                                <label 
                                  htmlFor="privacy-accept" 
                                  className="text-sm font-semibold text-foreground cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Aceito a Política de Privacidade para Candidatos
                                </label>
                              </div>
                            </div>
                            <ChevronDown 
                              size={20} 
                              className={`text-muted-foreground transition-transform duration-300 group-hover:text-primary ${
                                privacyExpanded ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>

                          {/* Conteúdo expansível */}
                          {privacyExpanded && (
                            <div className="mt-4 pt-4 border-t border-border/50 animate-slide-in-from-top">
                              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText size={16} className="text-primary" />
                                  <span className="font-semibold text-foreground">Política de Privacidade para Candidatos</span>
                                </div>
                                
                                <p className="text-xs text-muted-foreground/80">
                                  [Nome da Empresa] valoriza a proteção dos seus dados pessoais e, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD), informa abaixo como tratamos os dados de candidatos em processos seletivos.
                                </p>

                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">1. Controlador dos Dados</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      A responsável pelo tratamento dos seus dados é [Nome da Empresa], inscrita no CNPJ sob nº [número do CNPJ], com sede em [endereço].
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">2. Dados Coletados</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Durante o processo seletivo, poderemos coletar e tratar os seguintes dados:
                                    </p>
                                    <ul className="text-xs text-muted-foreground/80 mt-1 ml-4 space-y-1">
                                      <li>• Nome completo, e-mail e telefone de contato;</li>
                                      <li>• Resultados de testes;</li>
                                      <li>• Outras informações necessárias para avaliação do candidato.</li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">3. Finalidade do Tratamento</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Os dados coletados serão utilizados exclusivamente para:
                                    </p>
                                    <ul className="text-xs text-muted-foreground/80 mt-1 ml-4 space-y-1">
                                      <li>• Conduzir processos de recrutamento e seleção;</li>
                                      <li>• Avaliar a adequação do candidato à vaga;</li>
                                      <li>• Cumprir obrigações legais ou regulatórias relacionadas à contratação.</li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">4. Base Legal</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      O tratamento de dados ocorre com fundamento em:
                                    </p>
                                    <ul className="text-xs text-muted-foreground/80 mt-1 ml-4 space-y-1">
                                      <li>• Execução de contrato e procedimentos preliminares (Art. 7º, V da LGPD);</li>
                                      <li>• Legítimo interesse da empresa para fins de recrutamento (Art. 7º, IX da LGPD).</li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">5. Compartilhamento</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Os dados poderão ser acessados apenas por profissionais de RH, gestores da área responsável pela vaga e consultorias contratadas para apoio na seleção, sempre sob obrigação de confidencialidade.
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">6. Armazenamento e Segurança</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Seus dados serão armazenados em sistemas internos com acesso restrito e medidas de segurança técnicas e administrativas para evitar acessos não autorizados.
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">7. Prazo de Retenção</h4>
                                    <ul className="text-xs text-muted-foreground/80 mt-1 ml-4 space-y-1">
                                      <li>• Se contratado, os dados passarão a compor o dossiê do colaborador.</li>
                                      <li>• Se não contratado, os dados serão mantidos por até [X meses] para futuras oportunidades, salvo se você solicitar a exclusão imediata.</li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">8. Direitos do Candidato</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Nos termos da LGPD, você pode, a qualquer momento:
                                    </p>
                                    <ul className="text-xs text-muted-foreground/80 mt-1 ml-4 space-y-1">
                                      <li>• Solicitar acesso aos seus dados pessoais;</li>
                                      <li>• Corrigir informações incorretas;</li>
                                      <li>• Pedir a exclusão dos seus dados;</li>
                                      <li>• Revogar o consentimento para permanência no banco de talentos.</li>
                                    </ul>
                                    <p className="text-xs text-muted-foreground/80 mt-2">
                                      Para exercer seus direitos, entre em contato pelo e-mail: [contato@empresa.com].
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-foreground text-xs">9. Alterações</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                      Esta Política pode ser atualizada periodicamente. A versão mais recente estará sempre disponível em [site da empresa].
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6 sm:pt-8">
                  <button 
                    onClick={() => setStep(1)}
                    disabled={!nome.trim() || !email.trim() || !privacyAccepted}
                    className="btn-primary-modern px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg group w-full sm:w-auto"
                  >
                    <Play size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Começar Teste
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ) : (
              // Questão atual
              <div className="card-modern rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <span className="text-base sm:text-lg font-bold text-primary">{step}</span>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Questão {step}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {questions[step - 1]?.maxChoices > 1 
                            ? `Selecione até ${questions[step - 1].maxChoices} opções` 
                            : 'Selecione uma opção'}
                        </p>
                      </div>
                    </div>
                    <span variant="outline" className="bg-primary/20 text-primary border-primary/30 self-start sm:self-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {Math.round((step / questions.length) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                      {questions[step - 1]?.title}
                    </h3>
                    
                    <div className={`grid gap-2 sm:gap-3 ${
                      questions[step - 1]?.id <= 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                      {questions[step - 1]?.answers?.map((answer, index) => {
                        const questionId = questions[step - 1]?.id
                        const currentAnswers = answers[questionId] || []
                        const isSelected = currentAnswers.includes(answer.text)
                        
                        return (
                          <button
                            key={index}
                            onClick={() => toggleAnswer(questionId, answer.text)}
                            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-md ${
                              isSelected 
                                ? 'border-primary bg-primary/10 shadow-glow' 
                                : 'border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                isSelected 
                                  ? 'border-primary bg-primary' 
                                  : 'border-border/50 group-hover:border-primary/50'
                              }`}>
                                {isSelected ? (
                                  <Check size={14} className="sm:w-4 sm:h-4 text-primary-foreground" />
                                ) : (
                                  <Circle size={14} className="sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                )}
                              </div>
                              <span className={`font-medium text-sm sm:text-base transition-colors duration-300 ${
                                isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                              }`}>
                                {answer.text}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-6 sm:pt-8">
                  <button 
                    variant="outline"
                    onClick={prevStep}
                    disabled={!canGoBack}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground btn-secondary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Anterior
                  </button>
                  
                  <button 
                    onClick={step === questions.length ? handleSubmit : nextStep}
                    disabled={!canProceed}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto order-1 sm:order-2"
                  >
                    {step === questions.length ? (
                      <>
                        <Send size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        Próxima
                        <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exibir erro */}
          {error && (
            <div className="animate-slide-in-from-bottom" style={{animationDelay: '0.4s'}}>
              <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
