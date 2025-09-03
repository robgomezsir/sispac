import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

// Função para classificar o status baseado no score
function classify(score) {
  if (score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if (score <= 75) return 'DENTRO DA EXPECTATIVA'
  if (score <= 95) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}

// Função para obter perfil comportamental completo
function getBehavioralProfile(status) {
  const profiles = {
    "ABAIXO DA EXPECTATIVA": {
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
      visao_estrategica: "Visão limitada a tarefas imediatas, com dificuldade para enxergar impactos de longo prazo e conexões entre diferentes áreas.",
      recomendacoes: "Oferecer mentoring ou coaching focado em confiança, exercícios de tomada de decisão com baixo risco e treinamentos de comunicação assertiva."
    },
    "DENTRO DA EXPECTATIVA": {
      perfil: "Indivíduos funcionais e confiáveis: equilibram competências sociais com entrega estável. São vistos como consistentes e responsáveis; têm valores alinhados ao ambiente, mas ainda sem grande diferenciação.",
      comportamento: "Proativos em doses moderadas: assumem tarefas, colaboram e mantêm bom relacionamento interpessoal. Tendem a seguir processos e buscar segurança nas decisões.",
      competencias: "Bons fundamentos em comunicação, trabalho em equipe e cumprimento de prazos. Capacidade técnica razoável; aprendem com treinamentos formais.",
      lideranca: "Potencial para liderança de primeira linha (supervisão), especialmente em ambientes com processos claros.",
      areas_desenvolvimento: [
        "Tomada de decisão em ambientes ambíguos",
        "Pensamento estratégico de curto prazo",
        "Autonomia para iniciativas fora do manual"
      ],
      visao_estrategica: "Visão operacional com capacidade de planejamento de curto prazo, mas com limitações para estratégias de médio e longo prazo.",
      recomendacoes: "Designar projetos com responsabilidade incremental, treinamentos em resolução de problemas e incentivar participação em iniciativas interdepartamentais."
    },
    "ACIMA DA EXPECTATIVA": {
      perfil: "Profissional maduro emocionalmente, com alto alinhamento de valores e imagem percebida. Demonstra empatia ativa e energia para colaborar.",
      comportamento: "Proatividade clara, busca soluções que beneficiam grupo e organização. Resolve problemas considerando impacto nas pessoas.",
      competencias: "Fortes competências interpessoais e de execução: comunicação clara, priorização e acompanhamento. Boa relação entre habilidades técnicas e soft skills.",
      lideranca: "Bom potencial para liderar times com foco em cultura e engajamento. Lidera pelo exemplo e administra conflitos com empatia.",
      areas_desenvolvimento: [
        "Delegação eficiente para escalar impacto",
        "Visão estratégica de médio prazo",
        "Gestão de stakeholders complexos"
      ],
      visao_estrategica: "Visão estratégica de médio prazo bem desenvolvida, com capacidade de conectar diferentes áreas e antecipar tendências.",
      recomendacoes: "Investir em programas de desenvolvimento de liderança, dar projetos de maior responsabilidade e inserir em comitês interfuncionais."
    },
    "SUPEROU A EXPECTATIVA": {
      perfil: "Perfil de alto desempenho humano: forte congruência entre valores, imagem e ação. Inspira confiança, responsabilidade e empatia.",
      comportamento: "Atua com autonomia, iniciativa e visão. Resolve problemas complexos com abordagem humana, integrando resultados e cuidado com pessoas.",
      competencias: "Excelência em competências comportamentais e técnicas; alta adaptabilidade; forte capacidade de ensino e coaching.",
      lideranca: "Líder natural — influencia por autoridade moral mais que por poder hierárquico. Preparado para papéis estratégicos e de alto impacto.",
      areas_desenvolvimento: [
        "Evitar sobrecarga e centralização de decisões",
        "Estruturar sucessão e multiplicar conhecimento",
        "Foco em métricas estratégicas e governança"
      ],
      visao_estrategica: "Visão estratégica de longo prazo excepcional, com capacidade de transformar organizações e influenciar o mercado.",
      recomendacoes: "Promover para papéis de maior alcance, investir em formação executiva e designar como mentor de talentos-chave."
    }
  }
  
  return profiles[status] || {
    perfil: "Perfil não disponível",
    comportamento: "Dados insuficientes",
    competencias: "Dados insuficientes",
    lideranca: "Dados insuficientes",
    areas_desenvolvimento: ["Dados insuficientes"],
    visao_estrategica: "Dados insuficientes",
    recomendacoes: "Dados insuficientes"
  }
}

export default async function handler(req, res){
  try{
    console.log('🔍 [candidates] Iniciando requisição')
    console.log('🔍 [candidates] Headers:', req.headers)
    
    // Validar autenticação e permissões
    try {
      await assertAuth(req)
      console.log('✅ [candidates] Autenticação bem-sucedida')
    } catch (authError) {
      console.error('❌ [candidates] Erro de autenticação:', authError)
      return fail(res, authError, authError.status || 401)
    }
    
    const supabase = getSupabaseAdmin()
    console.log('✅ [candidates] Cliente Supabase criado')
    
    const { data, error } = await supabase
      .from('candidates')
      .select('id,name,email,score,status,created_at')
      .neq('status', 'PENDENTE_TESTE') // Excluir candidatos pendentes de teste
      .order('created_at', { ascending: false })
    
    if(error) {
      console.error('❌ Erro ao buscar candidatos:', error)
      return fail(res, { message: 'Erro ao buscar candidatos: ' + error.message }, 500)
    }
    
    console.log('✅ [candidates] Dados do Supabase obtidos:', data?.length || 0, 'registros')
    
    // Adicionar perfil comportamental completo para cada candidato
    const candidatesWithProfile = data?.map(candidate => {
      const status = candidate.status || classify(candidate.score)
      const behavioralProfile = getBehavioralProfile(status)
      
      return {
        ...candidate,
        status: status,
        behavioral_profile: behavioralProfile
      }
    }) || []
    
    console.log('✅ Candidatos buscados com sucesso:', { count: candidatesWithProfile.length })
    
    ok(res, candidatesWithProfile)
    
  }catch(e){ 
    console.error('❌ Erro na API candidates:', e)
    fail(res, e) 
  }
}
