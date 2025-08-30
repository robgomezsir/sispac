import React from 'react'

export default function ApiPanel(){
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-lg p-6">
      <h2 className="text-xl font-bold mb-2">Painel de API</h2>
      <p className="text-gray-600 mb-4">Endpoints disponíveis para integrações (ex.: Gupy):</p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><code>GET /api/candidates</code> — Lista candidatos (nome, email, score, status)</li>
        <li><code>GET /api/candidate/:id</code> — Detalhe do candidato</li>
      </ul>
      <p className="mt-4 text-sm text-gray-600">OBS: Endpoints protegidos por chave de API via header <code>Authorization: Bearer &lt;KEY&gt;</code>. Configure <code>VERCEL_API_KEY</code> nas variáveis do projeto.</p>
    </div>
  )
}
