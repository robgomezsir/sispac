import React, { useState } from 'react'
import { questions } from '../data/questions'
import { computeScore, classify } from '../utils/scoring'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Home,
  User,
  Mail,
  BarChart3,
  Award,
  AlertCircle
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Formulario(){
  const [step, setStep] = useState(0) // 0..3 perguntas, 4 = final
  const [answers, setAnswers] = useState({})
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function toggleOption(qid, optionText){
    const selected = answers[qid] || []
    const exists = selected.includes(optionText)
    let next = selected
    if(exists){
      next = selected.filter(x=>x!==optionText)
    }else{
      if(selected.length>=5){
        alert('Você só pode escolher até 5 opções nesta questão.')
        return
      }
      next = [...selected, optionText]
    }
    setAnswers({ ...answers, [qid]: next })
  }

  function next(){
    if(step < questions.length) setStep(step+1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function prev(){
    if(step > 0) setStep(step-1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(){
    setSending(true)
  }

  async function handleSend(){
    setError(null); setSending(true)
    try{
      // verificação nome + sobrenome
      if(!nome.trim().includes(' ')) throw new Error('Informe Nome e Sobrenome.')
      // checar duplicidade (nome+email) já respondeu
      const { data: existing, error: e1 } = await supabase
        .from('candidates')
        .select('id, email, name')
        .eq('email', email.toLowerCase())
        .eq('name', nome.trim())
        .limit(1)
      if(e1) throw e1
      if(existing && existing.length){
        alert('Você já respondeu o teste. Obrigado!')
        setSent(true)
        return
      }

      const score = computeScore(answers, questions)
      const status = classify(score)

      const payload = {
        name: nome.trim(),
        email: email.toLowerCase(),
        answers,
        score,
        status
      }

      const { data: inserted, error: e2 } = await supabase.from('candidates').insert(payload).select().single()
      if(e2) throw e2

      // opcional: salvar detalhamento textual simples
      const details = buildDetails(answers, score, status)
      await supabase.from('results').insert({
        candidate_id: inserted.id,
        details
      })

      setSent(true)
      alert('Respostas enviadas com sucesso!')
    }catch(err){
      setError(err.message)
    }finally{
      setSending(false)
    }
  }

  if(step === questions.length){
    const score = computeScore(answers, questions)
    const status = classify(score)
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'SUPEROU A EXPECTATIVA':
          return 'bg-green-50 text-green-700 border-green-200'
        case 'ACIMA DA EXPECTATIVA':
          return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'DENTRO DA EXPECTATIVA':
          return 'bg-yellow-50 text-yellow-700 border-yellow-200'
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200'
      }
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">🎉 Obrigado por participar!</h2>
          <p className="text-muted-foreground text-lg">
            Confira seus dados e envie para finalizar o processo.
          </p>
        </div>

        {/* Formulário de Dados */}
        <div className="card p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User size={20} />
            Informações Pessoais
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="label">Nome completo</label>
              <input 
                className="input" 
                value={nome} 
                onChange={e=>setNome(e.target.value)} 
                placeholder="Nome e Sobrenome"
              />
            </div>
            <div className="space-y-2">
              <label className="label">Email</label>
              <input 
                className="input" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="card bg-muted/50 p-6 mb-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Resultados da Avaliação
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Pontuação Total</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border",
                  getStatusColor(status)
                )}>
                  <Award size={16} />
                  {status}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              className="btn-outline flex items-center gap-2" 
              onClick={()=>setStep(questions.length-1)}
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={handleSend} 
              disabled={sending || sent}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {sending ? 'Enviando...' : (sent ? 'Enviado' : 'Enviar Respostas')}
            </button>
            <button 
              className="btn-destructive flex items-center gap-2" 
              onClick={() => navigate('/')}
              disabled={sending}
            >
              <Home size={16} />
              {sent ? 'Voltar ao Início' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[step]
  const selected = answers[q.id] || []

  const progress = Math.round(((step+1) / (questions.length+1)) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progresso do Teste</span>
            <span className="text-muted-foreground">{step+1} de {questions.length}</span>
          </div>
          <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
              style={{ width: progress + '%' }}
            />
          </div>
        </div>
      </div>

      {/* Pergunta */}
      <div className="card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Pergunta {step+1}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{q.title}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecione até 5 opções que melhor descrevem você:
            </p>
            
            <ul className="space-y-3">
              {q.answers.map((a, idx)=>{
                const active = selected.includes(a.text)
                return (
                  <li 
                    key={idx} 
                    onClick={()=>toggleOption(q.id, a.text)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                      active 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-background hover:bg-muted/50 border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.text}</span>
                      <div className={cn(
                        "flex items-center gap-2",
                        active ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        <span className="text-sm">+{a.value}</span>
                        {active && <CheckCircle size={16} />}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button 
              className="btn-outline flex items-center gap-2" 
              onClick={prev} 
              disabled={step===0}
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
            
            {step === questions.length - 1 ? (
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={next}
              >
                Finalizar Teste
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={next}
              >
                Próxima Pergunta
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function buildDetails(answers, score, status){
  // Geração simples de texto corporativo; pode ser substituído por lógica mais avançada
  const lines = []
  lines.push(`Score total: ${score} | Status: ${status}`)
  for(const [qid, arr] of Object.entries(answers)){
    lines.push(`Q${qid}: ${arr.join(', ')}`)
  }
  const perfil = status === 'SUPEROU A EXPECTATIVA' ? 'Perfil de alta aderência e forte orientação a valores.' :
                 status === 'ACIMA DA EXPECTATIVA' ? 'Perfil consistente, com boa maturidade emocional.' :
                 status === 'DENTRO DA EXPECTATIVA' ? 'Perfil estável, com oportunidades de desenvolvimento.' :
                 'Perfil em desenvolvimento; focar em capacitações e mentoria.'
  lines.push('Análise: ' + perfil)
  return lines.join('\n')
}
