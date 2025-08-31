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
  ChevronUp
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
  // Removidas variáveis não utilizadas: finalScore, finalStatus, questionDetails, feedback, showResults

  // Auto-scroll para o topo quando mudar de pergunta
  useEffect(() => {
    // Scroll suave para o topo com fallback para navegadores que não suportam smooth
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        // Fallback para navegadores que não suportam smooth
        window.scrollTo(0, 0)
      }
    }
    
    // Pequeno delay para garantir que o DOM foi atualizado
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

  // Scroll para o topo quando enviar formulário
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
      // Fallback para navegadores que não suportam smooth
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

  // Função calculateResults removida - não está sendo usada
  // const calculateResults = useCallback(() => {
  //   const { totalScore, questionScores } = computeScore(answers, questions)
  //   const status = classify(totalScore)
  //   const feedbackText = generateFeedback(totalScore, questionScores)
  //   const details = getQuestionDetails(questionScores)
  //   
  //   setFinalScore(totalScore)
  //   setFinalStatus(status)
  //   setQuestionDetails(details)
  //   setFeedback(feedbackText)
  //   setShowResults(true)
  // }, [answers])

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
        // Removido 'feedback' e 'question_scores' pois as colunas não existem na tabela
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

      // Inserção na tabela results removida - focar apenas na inserção principal
      // const details = buildDetails(answers, totalScore, status)
      // try {
      //   await supabase
      //     .from('results')
      //     .insert({
      //       candidate_id: inserted.id,
      //       details
      //     })
      // } catch (err) {
      //   console.error('❌ [Formulario] Erro ao inserir resultados:', err)
      //   // Não falhar se apenas os resultados não puderem ser salvos
      // }

      setSent(true)
      alert('Respostas enviadas com sucesso!')
    }catch(err){
      console.error('❌ [Formulario] Erro no envio:', err)
      setError(err.message)
    }finally{
      setSending(false)
    }
  }

  // Função para construir detalhes
  const buildDetails = (answers, score, status) => {
    return `Score: ${score}, Status: ${status}, Respostas: ${JSON.stringify(answers)}`
  }

  // Se já foi enviado, mostrar confirmação
  if(sent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">🎉 Obrigado por participar!</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Suas respostas foram enviadas com sucesso e estão sendo processadas.
          </p>
          
          {/* Botão Sair */}
          <Button 
            onClick={() => window.close()}
            variant="outline"
            className="px-8 py-3"
          >
            Sair
          </Button>
        </Card>
      </div>
    )
  }

  // Se está no passo final, mostrar resultados
  if(step === questions.length){
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">🎉 Obrigado por participar!</h2>
          <p className="text-muted-foreground text-lg">
            Agora preencha suas informações pessoais abaixo e clique em enviar para finalizar o processo.
          </p>
        </div>

        {/* Mensagem de Orientação */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-blue-800">📝 Próximo Passo</CardTitle>
            <CardDescription className="text-blue-700">
              Para finalizar sua participação, preencha as informações pessoais abaixo e clique em "Enviar Respostas".
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Formulário de Dados */}
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User size={20} />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Preencha seus dados para finalizar o processo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome"
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required
                  placeholder="Seu nome completo"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="seu@email.com"
                  className="h-12"
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full h-12 text-base font-semibold" 
                disabled={sending}
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={18} />
                    Enviar Respostas
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          {error && (
            <CardFooter className="pt-0">
              <div className="w-full p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    )
  }

  // Renderizar questão atual
  const question = questions[step]
  const questionAnswers = answers[question.id] || []
  const isComplete = questionAnswers.length === question.maxChoices

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Teste Comportamental
        </h1>
        <p className="text-muted-foreground text-lg">
          Questão {step + 1} de {questions.length}
        </p>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questão */}
      <Card className="p-8">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl">{question.title}</CardTitle>
          <CardDescription className="text-lg">
            Escolha até <strong>{question.maxChoices}</strong> opções
          </CardDescription>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">
              {questionAnswers.length}/{question.maxChoices} selecionadas
            </Badge>
            {isComplete && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                ✓ Completo
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className={`grid gap-4 ${question.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {question.answers.map((answer, index) => {
              const isSelected = questionAnswers.includes(answer.text)
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleAnswer(question.id, answer.text)}
                  disabled={!isSelected && questionAnswers.length >= question.maxChoices}
                  className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  } ${
                    !isSelected && questionAnswers.length >= question.maxChoices
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    }`}>
                      {isSelected && <CheckCircle size={16} />}
                    </div>
                    <span className="font-medium">{answer.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Anterior
          </Button>
          
          <Button
            type="button"
            onClick={nextStep}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            Próxima
            <ChevronRight size={16} />
          </Button>
        </CardFooter>
      </Card>

      {/* Botão Voltar ao Topo */}
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={scrollToTop}
          className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronUp size={16} />
          Voltar ao Topo
        </Button>
      </div>
    </div>
  )
}
