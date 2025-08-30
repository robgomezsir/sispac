import React, { useState, useEffect } from 'react'
import { questions } from '../data/questions'
import { computeScore, classify } from '../utils/scoring'
import { supabase, supabaseAdmin } from '../lib/supabase'
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
  AlertCircle,
  X
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

  // Autoscroll para o início da página quando o step mudar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  function toggleOption(qid, optionText){
    const selected = answers[qid] || []
    const exists = selected.includes(optionText)
    let next = selected
    if(exists){
      next = selected.filter(x=>x!==optionText)
    }else{
      if(selected.length>=5){
        // Não permitir mais de 5 seleções
        return
      }
      next = [...selected, optionText]
    }
    setAnswers({ ...answers, [qid]: next })
  }

  function next(){
    if(step < questions.length) {
      setStep(step+1)
      // O useEffect já cuida do scroll automático
    }
  }
  
  function prev(){
    if(step > 0) {
      setStep(step-1)
      // O useEffect já cuida do scroll automático
    }
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
      const details = buildDetails(answers, score, status)
      
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
              <X size={16} />
              Sair
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[step]
  const selected = answers[q.id] || []
  const maxChoices = q.maxChoices || 5
  const columns = q.columns || 1

  const progress = Math.round(((step+1) / (questions.length+1)) * 100)

  // Verificar se pode avançar (deve ter exatamente 5 respostas)
  const canProceed = selected.length === maxChoices

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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecione exatamente {maxChoices} opções:
              </p>
              <div className="text-sm font-medium">
                {selected.length}/{maxChoices} selecionadas
              </div>
            </div>
            
            {/* Grid de respostas baseado no número de colunas */}
            <div className={cn(
              "grid gap-3",
              columns === 3 ? "grid-cols-1 md:grid-cols-3" : 
              columns === 2 ? "grid-cols-1 md:grid-cols-2" : 
              "grid-cols-1"
            )}>
              {q.answers.map((a, idx)=>{
                const active = selected.includes(a.text)
                const disabled = !active && selected.length >= maxChoices
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => !disabled && toggleOption(q.id, a.text)}
                    className={cn(
                      "p-4 border rounded-lg transition-all duration-200 cursor-pointer",
                      active 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : disabled
                        ? "bg-muted/30 text-muted-foreground border-muted cursor-not-allowed opacity-60"
                        : "bg-background hover:bg-muted/50 border-border hover:border-primary/50 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium",
                        active ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {a.text}
                      </span>
                      <div className={cn(
                        "flex items-center gap-2",
                        active ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {active && <CheckCircle size={16} />}
                      </div>
                    </div>
                    
                    {/* Mensagem discreta quando não pode selecionar */}
                    {disabled && (
                      <div className="mt-2 text-xs text-muted-foreground italic">
                        Para escolher esta resposta, desmarque uma ou mais das respostas já escolhidas.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
                disabled={!canProceed}
              >
                Finalizar Teste
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={next}
                disabled={!canProceed}
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
