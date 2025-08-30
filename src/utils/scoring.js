export function computeScore(answersByQuestion, questions){
  let total = 0
  for(const q of questions){
    const selected = answersByQuestion[q.id] || []
    // Cada resposta selecionada vale 1 ponto (sem pesos)
    total += selected.length
  }
  return total
}

export function classify(score){
  // Como agora cada pergunta tem 5 respostas, o total máximo é 20
  // Ajustando os critérios para o novo sistema
  if(score <= 15) return 'ABAIXO DA EXPECTATIVA'
  if(score <= 17) return 'DENTRO DA EXPECTATIVA'
  if(score <= 19) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}
