import React, { useState } from 'react'
import { questions } from '../data/questions'
import { computeScore, classify } from '../utils/scoring'
import { supabase } from '../lib/supabase'

export default function Formulario(){
  const [step, setStep] = useState(0) // 0..3 perguntas, 4 = final
  const [answers, setAnswers] = useState({})
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

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
    return (
      <div className="card max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">🎉 Obrigado por participar!</h2>
        <p className="text-center text-gray-600 mb-6">Confira seus dados e envie.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome e Sobrenome"/>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemplo.com"/>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm">
            <span><b>Score:</b> {score}</span>
            <span><b>Status:</b> {status}</span>
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-3">{error}</div>}

        <div className="flex gap-3 justify-center">
          <button className="btn-secondary" onClick={()=>setStep(questions.length-1)}>Voltar</button>
          <button className="btn-primary" onClick={handleSend} disabled={sending || sent}>
            {sending ? 'Enviando...' : (sent ? 'Enviado' : 'Enviar')}
          </button>
          <button className="btn-danger" disabled={!sent}>Sair</button>
        </div>
      </div>
    )
  }

  const q = questions[step]
  const selected = answers[q.id] || []

  const progress = Math.round(((step+1) / (questions.length+1)) * 100)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: progress + '%' }}></div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-2">Pergunta {step+1} de {questions.length}</h2>
        <p className="text-gray-600 mb-4">{q.title}</p>

        <ul className="space-y-2">
          {q.answers.map((a, idx)=>{
            const active = selected.includes(a.text)
            return (
              <li key={idx} onClick={()=>toggleOption(q.id, a.text)}
                  className={
                    'p-3 border rounded-xl cursor-pointer transition ' +
                    (active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-300')
                  }>
                <div className="flex justify-between">
                  <span>{a.text}</span>
                  <span className={active ? 'opacity-80' : 'text-gray-400'}>+{a.value}</span>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="flex justify-between mt-6">
          <button className="btn-secondary" onClick={prev} disabled={step===0}>Voltar</button>
          {step === questions.length - 1 ? (
            <button className="btn-primary" onClick={next}>Finalizar</button>
          ) : (
            <button className="btn-primary" onClick={next}>Próxima</button>
          )}
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
