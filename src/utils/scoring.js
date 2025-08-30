// Sistema de pontuação atualizado com pesos específicos
// Baseado no prompt estruturado fornecido

// Pesos das características (Questões 1 e 2)
const CHARACTER_WEIGHTS = {
  "RECEPTIVA": 2,
  "DETALHISTA": 2,
  "DEDICADA": 2,
  "COMUNICATIVA": 2,
  "PRESTATIVA": 2,
  "RESPONSÁVEL": 2,
  "FELIZ": 2,
  "PERFECCIONISTA": 1,
  "EDUCADA": 2,
  "COERENTE": 1,
  "LÍDER": 2,
  "GOSTA DE GENTE": 3,
  "ESTUDIOSA": 1,
  "VERDADEIRA": 3,
  "AMOROSA": 3,
  "ORGANIZADA": 2,
  "RESPEITADORA": 3,
  "DESCOLADA": 1,
  "SENSATA": 2,
  "CONFIANTE": 1,
  "GENTIL": 3,
  "PRATICA": 1,
  "PROATIVA": 2,
  "SÉRIA": 1,
  "REALISTA": 1,
  "INTELIGENTE": 2,
  "RIGIDA": 1,
  "BOM HUMOR": 2,
  "ESFORÇADA": 2,
  "ENGRAÇADA": 1,
  "RACIONAL": 1,
  "GENEROSA": 3,
  "PACIENTE": 2,
  "TÍMIDA": 1,
  "SENSÍVEL": 2,
  "VAIDOSA": 1
}

// Pesos das frases de vida (Questão 3)
const LIFE_PHRASE_WEIGHTS = {
  "Sempre que alguma pessoa me procura para contar os problemas eu escuto e ajudo.": 3,
  "Meus amigos/familiares podem contar comigo em momentos alegres e tristes.": 3,
  "Se vejo uma pessoa derrubando a carteira de dinheiro sem perceber, eu aviso.": 5,
  "Sempre vou aos compromissos que combinei (se não tiver nenhum problema maior).": 3,
  "Ajudo as pessoas que precisam de mim.": 5,
  "Consigo entender como os outros se sentem.": 5,
  "Minha família é o mais importante para mim.": 5,
  "Sou fiel a tudo que eu acredito.": 3,
  "Sei reconhecer quando estou errada.": 5,
  "Quando preciso resolver algum problema, tento tomar a melhor decisão pensando em todos os envolvidos.": 3,
  "Mesmo com muitas dificuldades eu não desisto fácil.": 3,
  "Respeito a opinião/ponto de vista das outras pessoas.": 4,
  "Não minto para as pessoas.": 4
}

// Pesos dos valores (Questão 4)
const VALUE_WEIGHTS = {
  "Trabalhar com Amor": 9,
  "cuidar/importar-se": 8,
  "excelência em servir": 9,
  "aprendizagem contínua": 7,
  "ética": 7,
  "família": 8,
  "iniciativa": 7,
  "Respeito": 8,
  "compaixão": 7,
  "comprometimento": 9,
  "trabalho produtivo": 9,
  "generosidade": 8,
  "crescimento pessoal": 7,
  "Honestidade/Integridade": 9,
  "empatia": 8,
  "responsabilidade": 7,
  "escutar": 8,
  "orientar/guiar": 7
}

// Função para calcular pontuação da questão 1 ou 2 (características)
function calculateCharacterScore(selectedAnswers) {
  let score = 0
  for (const answer of selectedAnswers) {
    const weight = CHARACTER_WEIGHTS[answer] || 0
    score += weight
  }
  return score
}

// Função para calcular pontuação da questão 3 (frases de vida)
function calculateLifePhraseScore(selectedAnswers) {
  let score = 0
  for (const answer of selectedAnswers) {
    const weight = LIFE_PHRASE_WEIGHTS[answer] || 0
    score += weight
  }
  return score
}

// Função para calcular pontuação da questão 4 (valores)
function calculateValueScore(selectedAnswers) {
  let score = 0
  for (const answer of selectedAnswers) {
    const weight = VALUE_WEIGHTS[answer] || 0
    score += weight
  }
  return score
}

// Função principal para calcular score total
export function computeScore(answersByQuestion, questions) {
  let totalScore = 0
  let questionScores = {}
  
  for (const question of questions) {
    const selectedAnswers = answersByQuestion[question.id] || []
    let questionScore = 0
    
    switch (question.id) {
      case 1: // Como você acha que as pessoas te veem?
      case 2: // E você, como se vê?
        questionScore = calculateCharacterScore(selectedAnswers)
        break
      case 3: // Frases de vida
        questionScore = calculateLifePhraseScore(selectedAnswers)
        break
      case 4: // Valores importantes
        questionScore = calculateValueScore(selectedAnswers)
        break
      default:
        questionScore = 0
    }
    
    questionScores[question.id] = questionScore
    totalScore += questionScore
  }
  
  return { totalScore, questionScores }
}

// Função para classificar o status final
export function classify(score) {
  if (score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if (score <= 75) return 'DENTRO DA EXPECTATIVA'
  if (score <= 95) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}

// Função para gerar feedback personalizado
export function generateFeedback(score, questionScores) {
  let feedback = ""
  
  if (score <= 67) {
    feedback = "Você tem potencial para crescimento. Considere refletir sobre suas escolhas e valores para desenvolver melhor suas características pessoais."
  } else if (score <= 75) {
    feedback = "Você demonstra valores sólidos e está no caminho certo. Continue desenvolvendo suas qualidades para alcançar seu potencial máximo."
  } else if (score <= 95) {
    feedback = "Excelente! Você demonstra valores fortes em responsabilidade e empatia, está acima da expectativa e possui grande potencial de liderança."
  } else {
    feedback = "Parabéns! Você superou todas as expectativas. Suas escolhas refletem um caráter excepcional e valores profundamente enraizados."
  }
  
  return feedback
}

// Função para obter detalhes da pontuação por questão
export function getQuestionDetails(questionScores) {
  const details = {
    1: { title: "Como você acha que as pessoas te veem?", min: 10, max: 15 },
    2: { title: "E você, como se vê?", min: 10, max: 15 },
    3: { title: "Frases de vida", min: 17, max: 25 },
    4: { title: "Valores importantes", min: 31, max: 45 }
  }
  
  let result = []
  for (const [questionId, score] of Object.entries(questionScores)) {
    const detail = details[questionId]
    if (detail) {
      result.push({
        question: detail.title,
        score: score,
        min: detail.min,
        max: detail.max,
        percentage: Math.round((score / detail.max) * 100)
      })
    }
  }
  
  return result
}
