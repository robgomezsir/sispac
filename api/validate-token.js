import { getSupabaseAdmin, ok, fail } from './_utils.js'
import { isValidTokenFormat, isTokenNotExpired, logTokenAction } from './token-utils.js'

export default async function handler(req, res){
  try{
    
    // Validar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Método não permitido',
        message: 'Apenas requisições POST são aceitas'
      })
    }
    
    const { token } = req.body || {}
    
    // Validação do token
    if(!token || !token.trim()) {
      logTokenAction('VALIDATION_FAILED', null, { reason: 'Token não fornecido' })
      return fail(res, { message: 'Token é obrigatório' }, 400)
    }
    
    const cleanToken = token.trim()
    
    // Validar formato do token
    if(!isValidTokenFormat(cleanToken)) {
      logTokenAction('VALIDATION_FAILED', cleanToken, { reason: 'Formato inválido' })
      return fail(res, { message: 'Formato de token inválido' }, 400)
    }
    
    // Verificar se token não expirou
    if(!isTokenNotExpired(cleanToken)) {
      logTokenAction('VALIDATION_FAILED', cleanToken, { reason: 'Token expirado' })
      return fail(res, { message: 'Token expirado' }, 401)
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar candidato pelo token
    const { data: candidate, error: searchError } = await supabase
      .from('candidates')
      .select('id, name, email, status, access_token, token_created_at, created_at')
      .eq('access_token', cleanToken)
      .single()
    
    if(searchError) {
      if(searchError.code === 'PGRST116') {
        logTokenAction('VALIDATION_FAILED', cleanToken, { reason: 'Token não encontrado no banco' })
        return fail(res, { message: 'Token inválido ou não encontrado' }, 404)
      }
      return fail(res, { message: 'Erro ao validar token' }, 500)
    }
    
    // Verificar se o candidato já completou o teste
    if(candidate.status && candidate.status !== 'PENDENTE_TESTE') {
      logTokenAction('VALIDATION_FAILED', cleanToken, { 
        reason: 'Teste já completado', 
        candidate_id: candidate.id,
        status: candidate.status 
      })
      return fail(res, { 
        message: 'Este teste já foi completado',
        candidate_status: candidate.status 
      }, 409)
    }
    
    // Verificar se o token não é muito antigo (24 horas)
    const tokenCreatedAt = new Date(candidate.token_created_at || candidate.created_at)
    const now = new Date()
    const hoursDiff = (now - tokenCreatedAt) / (1000 * 60 * 60)
    
    if(hoursDiff > 24) {
      logTokenAction('VALIDATION_FAILED', cleanToken, { 
        reason: 'Token muito antigo', 
        candidate_id: candidate.id,
        hours_old: hoursDiff 
      })
      return fail(res, { message: 'Token expirado. Solicite um novo link.' }, 401)
    }
    
    logTokenAction('VALIDATION_SUCCESS', cleanToken, { 
      candidate_id: candidate.id,
      candidate_email: candidate.email,
      hours_old: hoursDiff 
    })
    
    return ok(res, {
      valid: true,
      message: 'Token válido',
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status
      },
      token_info: {
        created_at: candidate.token_created_at || candidate.created_at,
        hours_old: Math.round(hoursDiff * 100) / 100,
        expires_in_hours: Math.max(0, 24 - hoursDiff)
      }
    })
    
  }catch(e){ 
    fail(res, e) 
  }
}
