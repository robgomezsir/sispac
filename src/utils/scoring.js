export function computeScore(answersByQuestion, questions){
  let total = 0
  for(const q of questions){
    const selected = answersByQuestion[q.id] || []
    for(const s of selected){
      const item = q.answers.find(a => a.text === s)
      if(item) total += item.value
    }
  }
  return total
}
export function classify(score){
  if(score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if(score <= 75) return 'DENTRO DA EXPECTATIVA'
  if(score <= 90) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}
