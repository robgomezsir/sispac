export default async function handler(req, res) {
  console.log('🧪 [Test] API de teste chamada')
  console.log('🧪 [Test] Método:', req.method)
  console.log('🧪 [Test] URL:', req.url)
  console.log('🧪 [Test] Headers:', req.headers)
  
  // Permitir qualquer método para teste
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API de teste funcionando!',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
      }
    })
  }
  
  if (req.method === 'POST') {
    return res.status(200).json({
      message: 'API de teste POST funcionando!',
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    })
  }
  
  return res.status(405).json({
    error: 'Método não permitido',
    allowedMethods: ['GET', 'POST'],
    receivedMethod: req.method
  })
}
