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
  Shield
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
  Badge
} from '../components/ui'

export default function Formulario(){
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

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
    
    const question = questions[step]
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

      const { totalScore } = computeScore(answers, questions)
      const status = classify(totalScore)

      const payload = {
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
          .insert(payload)
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
            .insert(payload)
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
        throw new Error(`Erro ao salvar dados: ${insertError?.message || 'Falha na inserção'}`)
      }

      setSent(true)
      alert('Respostas enviadas com sucesso!')
    }catch(err){
      console.error('❌ [Formulario] Erro no envio:', err)
      setError(err.message)
    }finally{
      setSending(false)
    }
  }

  // Se já foi enviado, mostrar confirmação
  if(sent) {
    return (
      <div className="min-h-screen bg-gradient-pastel relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 p-6 relative z-10">
          <Card className="card-modern text-center p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-success/20 shadow-glow-success">
              <CheckCircle size={48} className="text-success" />
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
              🎉 Obrigado por participar!
            </h2>
            <p className="text-muted-foreground text-xl mb-8 font-medium">
              Suas respostas foram enviadas com sucesso e estão sendo processadas.
            </p>
            
            {/* Botão Sair */}
            <Button 
              onClick={() => window.close()}
              variant="outline"
              className="btn-secondary-modern px-10 py-4 text-lg"
            >
              Sair
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Se está no passo final, mostrar resultados
  if(step === questions.length){
    return (
      <div className="min-h-screen bg-gradient-pastel relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 p-6 relative z-10">
          {/* Header de Sucesso */}
          <div className="card-modern p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-success/20 shadow-glow-success">
              <Award size={40} className="text-success" />
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
              🎉 Parabéns!
            </h2>
            <p className="text-muted-foreground text-xl font-medium">
              Agora preencha suas informações pessoais abaixo e clique em enviar para finalizar o processo.
            </p>
          </div>

          {/* Mensagem de Orientação */}
          <Card className="card-modern p-6 bg-gradient-to-r from-info/10 to-info/5 border-info/20">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-info flex items-center justify-center gap-2">
                <Target size={20} />
                Próximo Passo
              </CardTitle>
              <CardDescription className="text-info/80 text-lg">
                Para finalizar sua participação, preencha as informações pessoais abaixo e clique em "Enviar Respostas".
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Formulário de Dados */}
          <Card className="card-modern p-10">
            <CardHeader className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <User size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Informações Pessoais</CardTitle>
              <CardDescription className="text-lg">
                Preencha seus dados para finalizar o processo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="nome" className="text-base font-medium">Nome Completo</Label>
                  <Input 
                    id="nome"
                    type="text" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    required
                    placeholder="Seu nome completo"
                    className="input-modern h-14 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
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
                
                <Button 
                  type="submit"
                  className="btn-primary-modern w-full h-14 text-lg font-semibold mt-6" 
                  disabled={sending}
                >
                  {sending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send size={20} />
                      <span>Enviar Respostas</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            
            {error && (
              <CardFooter className="pt-0">
                <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="font-medium">{error}</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    )
  }

  // Renderizar questão atual
  const question = questions[step]
  const questionAnswers = answers[question.id] || []
  const isComplete = questionAnswers.length === question.maxChoices

  return (
    <div className="min-h-screen bg-gradient-pastel relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 p-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-glow">
            <Sparkles size={40} className="text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Teste Comportamental
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Questão {step + 1} de {questions.length}
          </p>
          
          {/* Barra de Progresso */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="w-full bg-muted/50 rounded-full h-3 border border-border/50">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 shadow-glow"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Início</span>
              <span>Final</span>
            </div>
          </div>
        </div>

        {/* Questão */}
        <Card className="card-modern p-10">
          <CardHeader className="text-center space-y-6">
            <CardTitle className="text-3xl font-bold">{question.title}</CardTitle>
            <CardDescription className="text-xl text-muted-foreground">
              Escolha até <strong className="text-foreground">{question.maxChoices}</strong> opções
            </CardDescription>
            <div className="flex items-center justify-center gap-3">
              <Badge className="badge-modern text-base px-4 py-2">
                {questionAnswers.length}/{question.maxChoices} selecionadas
              </Badge>
              {isComplete && (
                <Badge className="badge-success text-base px-4 py-2">
                  <CheckCircle size={16} className="mr-2" />
                  Completo
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className={`grid gap-6 ${question.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
              {question.answers.map((answer, index) => {
                const isSelected = questionAnswers.includes(answer.text)
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleAnswer(question.id, answer.text)}
                    disabled={!isSelected && questionAnswers.length >= question.maxChoices}
                    className={`p-6 text-left rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-glow scale-105'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/30 hover:scale-102'
                    } ${
                      !isSelected && questionAnswers.length >= question.maxChoices
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground scale-110'
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && <CheckCircle size={16} />}
                      </div>
                      <span className="font-semibold text-lg">{answer.text}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={!canGoBack}
              className="btn-secondary-modern px-8 py-3 text-base"
            >
              <ChevronLeft size={18} className="mr-2" />
              Anterior
            </Button>
            
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="btn-primary-modern px-8 py-3 text-base"
            >
              <span>Próxima</span>
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </CardFooter>
        </Card>

        {/* Botão Voltar ao Topo */}
        <div className="flex justify-center pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={scrollToTop}
            className="btn-secondary-modern opacity-70 hover:opacity-100 transition-all duration-300"
          >
            <ChevronUp size={18} className="mr-2" />
            Voltar ao Topo
          </Button>
        </div>
      </div>
    </div>
  )
}
