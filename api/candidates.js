import { getSupabaseAdmin, assertAuth, ok, fail } from './_utils.js'

// Função para classificar o status baseado no score
function classify(score) {
  if (score <= 67) return 'ABAIXO DA EXPECTATIVA'
  if (score <= 75) return 'DENTRO DA EXPECTATIVA'
  if (score <= 95) return 'ACIMA DA EXPECTATIVA'
  return 'SUPEROU A EXPECTATIVA'
}

// Função para obter perfil comportamental
function getBehavioralProfile(status) {
  const profiles = {
    "ABAIXO DA EXPECTATIVA": "Pessoas nessa faixa tendem a demonstrar um alinhamento fraco entre como se veem e como são percebidas; apresentam valores selecionados que indicam boa intenção, mas com inconsistência prática. Há tendência a evitar exposição, agir de forma conservadora e priorizar segurança relacional.",
    "DENTRO DA EXPECTATIVA": "Indivíduos funcionais e confiáveis: equilibram competências sociais com entrega estável. São vistos como consistentes e responsáveis; têm valores alinhados ao ambiente, mas ainda sem grande diferenciação.",
    "ACIMA DA EXPECTATIVA": "Profissional maduro emocionalmente, com alto alinhamento de valores e imagem percebida. Demonstra empatia ativa e energia para colaborar.",
    "SUPEROU A EXPECTATIVA": "Perfil de alto desempenho humano: forte congruência entre valores, imagem e ação. Inspira confiança, responsabilidade e empatia."
  }
  return profiles[status] || "Perfil não disponível"
}

export default async function handler(req, res){
  try{
    // Validar autenticação e permissões
    await assertAuth(req)
    
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('id,name,email,score,status,created_at')
      .order('created_at', { ascending: false })
    
    if(error) {
      console.error('❌ Erro ao buscar candidatos:', error)
      return fail(res, { message: 'Erro ao buscar candidatos: ' + error.message }, 500)
    }
    
    // Adicionar perfil comportamental para cada candidato
    const candidatesWithProfile = data?.map(candidate => {
      const status = candidate.status || classify(candidate.score)
      return {
        ...candidate,
        status: status,
        behavioral_profile: getBehavioralProfile(status)
      }
    }) || []
    
    console.log('✅ Candidatos buscados com sucesso:', { count: candidatesWithProfile.length })
    
    ok(res, candidatesWithProfile)
    
  }catch(e){ 
    console.error('❌ Erro na API candidates:', e)
    fail(res, e) 
  }
}
