import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { computeScore, classify } from '../utils/scoring'
import { questions } from '../data/questions'
import { supabase, supabaseAdmin } from '../lib/supabase'
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
  GraduationCap
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
  Progress,
  Separator
} from '../components/ui'

export default function Formulario(){
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

  // Validar token na inicialização
  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        // Se não há token, permitir acesso direto (compatibilidade com fluxo antigo)
        console.log('🔍 [Formulario] Nenhum token fornecido, permitindo acesso direto')
        setTokenValid(true)
        return
      }
      
      console.log('🔍 [Formulario] Validando token:', token.substring(0, 8) + '...')
      setTokenValidating(true)
      setTokenError(null)
      
      try {
        const response = await fetch('/api/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })
        
        const data = await response.json()
        
        if (response.ok && data.valid) {
          console.log('✅ [Formulario] Token válido:', data.candidate)
          setTokenValid(true)
          setCandidateData(data.candidate)
          
          // Preencher dados do candidato se disponíveis
          if (data.candidate.name) {
            setNome(data.candidate.name)
          }
          if (data.candidate.email) {
            setEmail(data.candidate.email)
          }
        } else {
          console.log('❌ [Formulario] Token inválido:', data.message)
          setTokenError(data.message || 'Token inválido')
          setTokenValid(false)
        }
      } catch (error) {
        console.error('❌ [Formulario] Erro ao validar token:', error)
        setTokenError('Erro ao validar token. Tente novamente.')
        setTokenValid(false)
      } finally {
        setTokenValidating(false)
      }
    }
    
    validateToken()
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

  // Função para scroll manual para o topo (fallback)
  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      window.scrollTo(0, 0)
    }
  }, [])

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

  // Função para enviar respostas
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    
    try {
      const { totalScore, questionScores } = computeScore(answers, questions)
      const status = classify(totalScore)

      let candidateId = null
      let inserted = null

      // Se há dados do candidato (vindo do token), atualizar registro existente
      console.log('🔍 [Formulario] Debug - candidateData:', candidateData)
      console.log('🔍 [Formulario] Debug - token:', searchParams.get('token'))
      
      // Verificar se há token válido (mesmo sem candidateData)
      const hasValidToken = searchParams.get('token') && searchParams.get('token').startsWith('sispac_')
      
      if ((candidateData && candidateData.id) || hasValidToken) {
        // Se há token válido, sempre procurar o candidato pelo token primeiro
        let candidateToUpdate = candidateData
        
        if (hasValidToken && (!candidateData || !candidateData.id)) {
          console.log('🔍 [Formulario] Token válido encontrado, buscando candidato pelo token...')
          const token = searchParams.get('token')
          
          const { data: tokenCandidate, error: tokenError } = await supabase
            .from('candidates')
            .select('id, name, email, status')
            .eq('access_token', token)
            .single()
          
          if (tokenError) {
            console.error('❌ [Formulario] Erro ao buscar candidato pelo token:', tokenError)
            throw new Error('Erro ao validar token. Tente novamente.')
          }
          
          if (!tokenCandidate) {
            throw new Error('Token inválido ou candidato não encontrado.')
          }
          
          candidateToUpdate = tokenCandidate
          console.log('✅ [Formulario] Candidato encontrado pelo token:', candidateToUpdate)
        }
        
        if (candidateToUpdate && candidateToUpdate.id) {
          console.log('🔄 [Formulario] Atualizando candidato existente:', candidateToUpdate.id)
          
          const updatePayload = {
            name: nome.trim(),
            answers,
            score: totalScore,
            status,
            updated_at: new Date().toISOString()
          }

          // Tentar atualizar com cliente normal primeiro
          let updateError
          try {
            const result = await supabase
              .from('candidates')
              .update(updatePayload)
              .eq('id', candidateToUpdate.id)
              .select()
              .single()
            inserted = result.data
            updateError = result.error
          } catch (err) {
            updateError = err
          }

          // Se falhou com cliente normal, tentar com admin
          if (updateError && supabaseAdmin !== supabase) {
            try {
              const result = await supabaseAdmin
                .from('candidates')
                .update(updatePayload)
                .eq('id', candidateToUpdate.id)
                .select()
                .single()
              inserted = result.data
              updateError = result.error
            } catch (err) {
              updateError = err
            }
          }

          if (updateError || !inserted) {
            console.error('❌ [Formulario] Erro ao atualizar candidato:', updateError)
            throw new Error(updateError?.message || 'Erro ao salvar respostas')
          }

          candidateId = candidateToUpdate.id
          console.log('✅ [Formulario] Candidato atualizado com sucesso:', candidateId)
        } else {
          throw new Error('Candidato não encontrado para atualização.')
        }

      } else {
        // Fluxo antigo: verificar se já respondeu e inserir novo candidato
        console.log('🔄 [Formulario] Verificando se candidato já existe...')
        
        const { data: existing, error: e1 } = await supabase
          .from('candidates')
          .select('id, status')
          .eq('email', email.toLowerCase())
          .limit(1)
        if(e1) throw e1
        
        if(existing && existing.length){
          const existingCandidate = existing[0]
          console.log('🔍 [Formulario] Candidato existente encontrado:', existingCandidate)
          
          if (existingCandidate.status === 'PENDENTE_TESTE') {
            // Se é um candidato pendente, atualizar em vez de inserir novo
            console.log('🔄 [Formulario] Candidato pendente encontrado, atualizando...')
            
            const updatePayload = {
              name: nome.trim(),
              answers,
              score: totalScore,
              status,
              updated_at: new Date().toISOString()
            }

            let updateError
            try {
              const result = await supabase
                .from('candidates')
                .update(updatePayload)
                .eq('id', existingCandidate.id)
                .select()
                .single()
              inserted = result.data
              updateError = result.error
            } catch (err) {
              updateError = err
            }

            if (updateError && supabaseAdmin !== supabase) {
              try {
                const result = await supabaseAdmin
                  .from('candidates')
                  .update(updatePayload)
                  .eq('id', existingCandidate.id)
                  .select()
                  .single()
                inserted = result.data
                updateError = result.error
              } catch (err) {
                updateError = err
              }
            }

            if (updateError || !inserted) {
              console.error('❌ [Formulario] Erro ao atualizar candidato pendente:', updateError)
              throw new Error(updateError?.message || 'Erro ao salvar respostas')
            }

            candidateId = existingCandidate.id
            console.log('✅ [Formulario] Candidato pendente atualizado com sucesso:', candidateId)
            
          } else {
            // Candidato já completou o teste
            alert('Você já respondeu o teste. Obrigado!')
            setSent(true)
            return
          }
        } else {
          // Se não encontrou candidato existente, inserir novo
          console.log('🔄 [Formulario] Nenhum candidato existente encontrado, inserindo novo...')
          
          const candidatePayload = {
            name: nome.trim(),
            email: email.toLowerCase(),
            answers,
            score: totalScore,
            status
          }

          // Tentar primeiro com cliente normal, depois com admin se falhar
          let insertError
          
          try {
            const result = await supabase
              .from('candidates')
              .insert(candidatePayload)
              .select()
              .single()
            inserted = result.data
            insertError = result.error
          } catch (err) {
            insertError = err
          }

          // Se falhou com cliente normal, tentar com admin
          if (insertError && supabaseAdmin !== supabase) {
            try {
              const result = await supabaseAdmin
                .from('candidates')
                .insert(candidatePayload)
                .select()
                .single()
              inserted = result.data
              insertError = result.error
            } catch (err) {
              insertError = err
            }
          }
          
          if(insertError || !inserted) {
            console.error('❌ [Formulario] Erro ao inserir candidato:', insertError)
            throw new Error(insertError?.message || 'Erro ao salvar respostas')
          }

          candidateId = inserted.id
          console.log('✅ [Formulario] Novo candidato inserido com sucesso:', candidateId)
        }
      }

      // Inserir resultados detalhados se possível
      try {
        const resultsPayload = questionScores.map(qs => ({
          candidate_id: candidateId,
          question_id: qs.questionId,
          question_title: qs.questionTitle,
          question_category: qs.questionCategory,
          selected_answers: qs.selectedAnswers,
          score_question: qs.score,
          is_correct: qs.isCorrect
        }))

        await supabaseAdmin
          .from('results')
          .insert(resultsPayload)
      } catch (err) {
        console.warn('⚠️ [Formulario] Erro ao salvar resultados detalhados:', err)
        // Não falhar se não conseguir salvar resultados detalhados
      }

      console.log("✅ [Formulario] Respostas enviadas com sucesso!")
      setSent(true)
      
    } catch (err) {
      console.error("❌ [Formulario] Erro ao enviar respostas:", err)
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

            <Card className="card-modern animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 sm:p-8 text-center">
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
                  <Button 
                    onClick={() => navigate('/')}
                    className="btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto"
                  >
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Voltar ao Início
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <Card className="card-modern animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 sm:p-8 text-center">
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
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto"
                  >
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              <Card className="card-modern">
                <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
                    <GraduationCap size={32} className="sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Bem-vindo ao Teste</CardTitle>
                    <CardDescription className="text-base sm:text-lg text-muted-foreground/80 px-4">
                      Antes de começar, precisamos de algumas informações básicas
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <Label htmlFor="nome" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      Nome Completo
                    </Label>
                    <Input 
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
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      Email
                    </Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                      placeholder="seu@email.com"
                      className="input-modern h-12 sm:h-14 text-base"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex justify-center pt-6 sm:pt-8">
                  <Button 
                    onClick={() => setStep(1)}
                    disabled={!nome.trim() || !email.trim()}
                    className="btn-primary-modern px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg group w-full sm:w-auto"
                  >
                    <Play size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Começar Teste
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              // Questão atual
              <Card className="card-modern">
                <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <span className="text-base sm:text-lg font-bold text-primary">{step}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold">Questão {step}</CardTitle>
                        <CardDescription className="text-sm sm:text-base text-muted-foreground">
                          {questions[step - 1]?.maxChoices > 1 
                            ? `Selecione até ${questions[step - 1].maxChoices} opções` 
                            : 'Selecione uma opção'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 self-start sm:self-auto">
                      {Math.round((step / questions.length) * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 sm:space-y-6">
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
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-6 sm:pt-8">
                  <Button 
                    variant="outline"
                    onClick={prevStep}
                    disabled={!canGoBack}
                    className="btn-secondary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Anterior
                  </Button>
                  
                  <Button 
                    onClick={step === questions.length ? handleSubmit : nextStep}
                    disabled={!canProceed}
                    className="btn-primary-modern px-6 sm:px-8 py-3 sm:py-4 group w-full sm:w-auto order-1 sm:order-2"
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
                  </Button>
                </CardFooter>
              </Card>
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
