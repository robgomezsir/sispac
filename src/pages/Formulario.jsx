import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [timeSpent, setTimeSpent] = useState(0)

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
      // Verificar se já respondeu
      const { data: existing, error: e1 } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('name', nome.trim())
        .limit(1)
      if(e1) throw e1
      if(existing && existing.length){
        alert('Você já respondeu o teste. Obrigado!')
        setSent(true)
        return
      }

      const { totalScore, questionScores } = computeScore(answers, questions)
      const status = classify(totalScore)

      const candidatePayload = {
        name: nome.trim(),
        email: email.toLowerCase(),
        answers,
        score: totalScore,
        status
      }

      // Tentar primeiro com cliente normal, depois com admin se falhar
      let inserted, insertError
      
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

      // Inserir resultados detalhados se possível
      try {
        const resultsPayload = questionScores.map(qs => ({
          candidate_id: inserted.id,
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

  // Se já foi enviado, mostrar tela de sucesso
  if (sent) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Header de sucesso */}
            <div className="space-y-6 animate-slide-in-from-top">
              <div className="w-24 h-24 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto border border-success/20 shadow-glow-success animate-bounce-soft">
                <CheckCircle size={48} className="text-success" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-success to-foreground bg-clip-text text-transparent">
                  Teste Concluído!
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  Obrigado por participar da nossa avaliação comportamental
                </p>
              </div>
            </div>

            {/* Mensagem de agradecimento */}
            <Card className="card-modern animate-slide-in-from-bottom" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto border border-success/20 shadow-glow-success">
                    <CheckCircle size={40} className="text-success" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Teste Finalizado com Sucesso!</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Obrigado por participar da nossa avaliação comportamental. 
                      Suas respostas foram salvas e serão analisadas pela nossa equipe.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary-modern px-8 py-4 group"
                  >
                    <ArrowRight size={20} className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
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
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 animate-slide-in-from-top">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl border border-primary/20 shadow-glow animate-bounce-soft">
                <img 
                  src="/logo192.png" 
                  alt="SisPAC Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Avaliação Comportamental
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Descubra seu perfil comportamental através deste teste especializado
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          {step > 0 && (
            <div className="space-y-4 animate-slide-in-from-bottom">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progresso do teste</span>
                <span>{step - 1} de {questions.length}</span>
              </div>
              <Progress value={progress} className="h-3 bg-muted/30" />
              <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                <div className="flex items-center gap-2">
                  <Timer size={14} />
                  <span>Tempo: {formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} />
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
                <CardHeader className="text-center space-y-6 pb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
                    <GraduationCap size={40} className="text-primary" />
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-bold">Bem-vindo ao Teste</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground/80">
                      Antes de começar, precisamos de algumas informações básicas
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
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
                      className="input-modern h-14 text-base"
                    />
                  </div>
                  
                  <div className="space-y-4">
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
                      className="input-modern h-14 text-base"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex justify-center pt-8">
                  <Button 
                    onClick={() => setStep(1)}
                    disabled={!nome.trim() || !email.trim()}
                    className="btn-primary-modern px-12 py-4 text-lg group"
                  >
                    <Play size={20} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Começar Teste
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              // Questão atual
              <Card className="card-modern">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <span className="text-lg font-bold text-primary">{step}</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">Questão {step}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {questions[step - 1]?.maxChoices > 1 
                            ? `Selecione até ${questions[step - 1].maxChoices} opções` 
                            : 'Selecione uma opção'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      {Math.round((step / questions.length) * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground leading-relaxed">
                      {questions[step - 1]?.title}
                    </h3>
                    
                    <div className={`grid gap-3 ${
                      questions[step - 1]?.id <= 2 ? 'grid-cols-3' : 'grid-cols-2'
                    }`}>
                      {questions[step - 1]?.answers?.map((answer, index) => {
                        const questionId = questions[step - 1]?.id
                        const currentAnswers = answers[questionId] || []
                        const isSelected = currentAnswers.includes(answer.text)
                        
                        return (
                          <button
                            key={index}
                            onClick={() => toggleAnswer(questionId, answer.text)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-md ${
                              isSelected 
                                ? 'border-primary bg-primary/10 shadow-glow' 
                                : 'border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isSelected 
                                  ? 'border-primary bg-primary' 
                                  : 'border-border/50 group-hover:border-primary/50'
                              }`}>
                                {isSelected ? (
                                  <Check size={16} className="text-primary-foreground" />
                                ) : (
                                  <Circle size={16} className="text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                )}
                              </div>
                              <span className={`font-medium transition-colors duration-300 ${
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

                <CardFooter className="flex justify-between pt-8">
                  <Button 
                    variant="outline"
                    onClick={prevStep}
                    disabled={!canGoBack}
                    className="btn-secondary-modern px-8 py-4 group"
                  >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Anterior
                  </Button>
                  
                  <Button 
                    onClick={step === questions.length ? handleSubmit : nextStep}
                    disabled={!canProceed}
                    className="btn-primary-modern px-8 py-4 group"
                  >
                    {step === questions.length ? (
                      <>
                        <Send size={20} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        Próxima
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
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
