// Configuração dos perfis de status com informações detalhadas
// Baseado nas propostas fornecidas para melhorar o dashboard

export const STATUS_PROFILES = {
  "ABAIXO DA EXPECTATIVA": {
    faixa: "Até 67 pontos",
    perfil: "Pessoas nessa faixa tendem a demonstrar um alinhamento fraco entre como se veem e como são percebidas; apresentam valores selecionados que indicam boa intenção, mas com inconsistência prática. Há tendência a evitar exposição, agir de forma conservadora e priorizar segurança relacional.",
    comportamento: "Comportamento reservado, prefere atuar de acordo com instruções claras. Evita riscos e decisões rápidas; pode reagir de forma passiva sob pressão.",
    competencias: "Competências interpessoais básicas (escuta, simpatia), mas com lacunas em tomada de decisão, proatividade e organização estratégica.",
    lideranca: "Pouca ou nenhuma propensão a liderança formal. Se assumir cargo de coordenação, tende a gerir tarefas mais do que pessoas.",
    areas_desenvolvimento: [
      "Autoconfiança e assertividade",
      "Iniciativa e resolução autônoma de problemas",
      "Clareza de prioridades e organização",
      "Comunicação direta em situações de conflito"
    ],
    recomendacoes: "Oferecer mentoring ou coaching focado em confiança, exercícios de tomada de decisão com baixo risco e treinamentos de comunicação assertiva.",
    cor: "destructive",
    icone: "AlertCircle",
    prioridade: 1
  },
  "DENTRO DA EXPECTATIVA": {
    faixa: "68 a 75 pontos",
    perfil: "Indivíduos funcionais e confiáveis: equilibram competências sociais com entrega estável. São vistos como consistentes e responsáveis; têm valores alinhados ao ambiente, mas ainda sem grande diferenciação.",
    comportamento: "Proativos em doses moderadas: assumem tarefas, colaboram e mantêm bom relacionamento interpessoal. Tendem a seguir processos e buscar segurança nas decisões.",
    competencias: "Bons fundamentos em comunicação, trabalho em equipe e cumprimento de prazos. Capacidade técnica razoável; aprendem com treinamentos formais.",
    lideranca: "Potencial para liderança de primeira linha (supervisão), especialmente em ambientes com processos claros.",
    areas_desenvolvimento: [
      "Tomada de decisão em ambientes ambíguos",
      "Pensamento estratégico de curto prazo",
      "Autonomia para iniciativas fora do manual"
    ],
    recomendacoes: "Designar projetos com responsabilidade incremental, treinamentos em resolução de problemas e incentivar participação em iniciativas interdepartamentais.",
    cor: "warning",
    icone: "Target",
    prioridade: 2
  },
  "ACIMA DA EXPECTATIVA": {
    faixa: "76 a 95 pontos",
    perfil: "Profissional maduro emocionalmente, com alto alinhamento de valores e imagem percebida. Demonstra empatia ativa e energia para colaborar.",
    comportamento: "Proatividade clara, busca soluções que beneficiam grupo e organização. Resolve problemas considerando impacto nas pessoas.",
    competencias: "Fortes competências interpessoais e de execução: comunicação clara, priorização e acompanhamento. Boa relação entre habilidades técnicas e soft skills.",
    lideranca: "Bom potencial para liderar times com foco em cultura e engajamento. Lidera pelo exemplo e administra conflitos com empatia.",
    areas_desenvolvimento: [
      "Delegação eficiente para escalar impacto",
      "Visão estratégica de médio prazo",
      "Gestão de stakeholders complexos"
    ],
    recomendacoes: "Investir em programas de desenvolvimento de liderança, dar projetos de maior responsabilidade e inserir em comitês interfuncionais.",
    cor: "success",
    icone: "TrendingUp",
    prioridade: 3
  },
  "SUPEROU A EXPECTATIVA": {
    faixa: "Acima de 95 pontos",
    perfil: "Perfil de alto desempenho humano: forte congruência entre valores, imagem e ação. Inspira confiança, responsabilidade e empatia.",
    comportamento: "Atua com autonomia, iniciativa e visão. Resolve problemas complexos com abordagem humana, integrando resultados e cuidado com pessoas.",
    competencias: "Excelência em competências comportamentais e técnicas; alta adaptabilidade; forte capacidade de ensino e coaching.",
    lideranca: "Líder natural — influencia por autoridade moral mais que por poder hierárquico. Preparado para papéis estratégicos e de alto impacto.",
    areas_desenvolvimento: [
      "Evitar sobrecarga e centralização de decisões",
      "Estruturar sucessão e multiplicar conhecimento",
      "Foco em métricas estratégicas e governança"
    ],
    recomendacoes: "Promover para papéis de maior alcance, investir em formação executiva e designar como mentor de talentos-chave.",
    cor: "primary",
    icone: "Award",
    prioridade: 4
  }
}

// Função para obter perfil por status
export function getStatusProfile(status) {
  return STATUS_PROFILES[status] || null
}

// Função para obter todos os perfis ordenados por prioridade
export function getAllStatusProfiles() {
  return Object.entries(STATUS_PROFILES)
    .sort(([,a], [,b]) => a.prioridade - b.prioridade)
    .map(([status, profile]) => ({ status, ...profile }))
}

// Função para obter estatísticas dos perfis
export function getStatusProfileStats(candidates) {
  const stats = {}
  
  Object.keys(STATUS_PROFILES).forEach(status => {
    stats[status] = {
      count: candidates.filter(c => c.status === status).length,
      percentage: 0,
      profile: STATUS_PROFILES[status]
    }
  })
  
  const total = candidates.length
  if (total > 0) {
    Object.values(stats).forEach(stat => {
      stat.percentage = Math.round((stat.count / total) * 100)
    })
  }
  
  return stats
}

// Função para obter recomendações personalizadas baseadas no score
export function getPersonalizedRecommendations(score, questionScores = {}) {
  const status = classifyScore(score)
  const profile = getStatusProfile(status)
  
  if (!profile) return []
  
  let recommendations = [...profile.recomendacoes.split(', ')]
  
  // Adicionar recomendações específicas baseadas no desempenho por questão
  if (questionScores[1] && questionScores[1] < 12) {
    recommendations.push("Trabalhar na percepção de como é visto pelos outros")
  }
  
  if (questionScores[2] && questionScores[2] < 12) {
    recommendations.push("Desenvolver autoconhecimento e autoestima")
  }
  
  if (questionScores[3] && questionScores[3] < 20) {
    recommendations.push("Focar no desenvolvimento de valores interpessoais")
  }
  
  if (questionScores[4] && questionScores[4] < 35) {
    recommendations.push("Reforçar valores organizacionais e profissionais")
  }
  
  return recommendations
}

// Função para classificar score (mantida compatibilidade com scoring.js)
function classifyScore(score) {
  if (score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if (score <= 75) return 'DENTRO DA EXPECTATIVA'
  if (score <= 95) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}
