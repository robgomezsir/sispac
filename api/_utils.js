import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin(){
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if(!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE')
  return createClient(url, key)
}
export function assertAuth(req){
  const header = req.headers['authorization'] || req.headers['Authorization']
  const token = header?.split(' ')[1]
  const expected = process.env.VERCEL_API_KEY
  if(!token || token !== expected){
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
}
export function ok(res, body){ res.status(200).json(body) }
export function fail(res, err){
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'error' })
}
