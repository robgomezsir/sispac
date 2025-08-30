import React, { useState, useCallback, useMemo } from 'react'
import { computeScore, classify, generateFeedback, getQuestionDetails } from '../utils/scoring'
import { questions } from '../data/questions'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail,
  Send,
  AlertCircle
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
  const [showResults, setShowResults] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [finalStatus, setFinalStatus] = useState(null)
  const [questionDetails, setQuestionDetails] = useState(null)
  const [feedback, setFeedback] = useState(null)

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

  // Função para calcular resultados
  const calculateResults = useCallback(() => {
    const { totalScore, questionScores } = computeScore(answers, questions)
    const status = classify(totalScore)
    const feedbackText = generateFeedback(totalScore, questionScores)
    const details = getQuestionDetails(questionScores)
    
    setFinalScore(totalScore)
    setFinalStatus(status)
    setQuestionDetails(details)
    setFeedback(feedbackText)
    setShowResults(true)
  }, [answers])

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
      const feedbackText = generateFeedback(totalScore, questionScores)

      const payload = {
        name: nome.trim(),
        email: email.toLowerCase(),
        answers,
        score: totalScore,
        status,
        question_scores: questionScores,
        feedback: feedbackText
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

      // opcional: salvar detalhamento textual simples
      const details = buildDetails(answers, totalScore, status)
      
      try {
        await supabase
          .from('results')
          .insert({
            candidate_id: inserted.id,
            details
          })
      } catch (err) {
        console.error('❌ [Formulario] Erro ao inserir resultados:', err)
        // Não falhar se apenas os resultados não puderem ser salvos
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
          <p className="text-muted-foreground text-lg">
            Suas respostas foram enviadas com sucesso.
          </p>
        </Card>
      </div>
    )
  }

  // Se está no passo final, mostrar resultados
  if(step === questions.length){
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">🎉 Obrigado por participar!</h2>
          <p className="text-muted-foreground text-lg">
            Confira seus resultados e envie para finalizar o processo.
          </p>
        </div>

        {/* Resultados */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">📊 Seus Resultados</CardTitle>
            <CardDescription>
              Análise detalhada das suas respostas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pontuação por questão */}
            {questionDetails && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pontuação por Questão:</h3>
                {questionDetails.map((detail, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{detail.question}</span>
                      <Badge variant="outline">
                        {detail.score}/{detail.max} ({detail.percentage}%)
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${detail.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pontuação total */}
            {finalScore !== null && (
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Pontuação Total</h3>
                <div className="text-3xl font-bold text-primary">
                  {finalScore}/100
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Mínimo: 68 | Máximo: 100
                </div>
              </div>
            )}

            {/* Status final */}
            {finalStatus && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Status Final</h3>
                <Badge 
                  variant={finalStatus === 'SUPEROU A EXPECTATIVA' ? 'default' : 
                          finalStatus === 'ACIMA DA EXPECTATIVA' ? 'secondary' : 
                          finalStatus === 'DENTRO DA EXPECTATIVA' ? 'outline' : 'outline'}
                  className={finalStatus === 'SUPEROU A EXPECTATIVA' ? 'bg-green-100 text-green-800' :
                           finalStatus === 'ACIMA DA EXPECTATIVA' ? 'bg-blue-100 text-blue-800' :
                           finalStatus === 'DENTRO DA EXPECTATIVA' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                >
                  {finalStatus}
                </Badge>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">💡 Feedback</h3>
                <p className="text-blue-800">{feedback}</p>
              </div>
            )}
          </CardContent>
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
    </div>
  )
}
