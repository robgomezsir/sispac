export default async function handler(req, res) {
  console.log('🔍 [test] API de teste chamada')
  
  res.status(200).json({ 
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}
