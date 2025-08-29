# SisPAC (React + Vite + Tailwind + Supabase)

## Pré-requisitos
- Node 18+
- Conta no Supabase com projeto criado
- (Opcional) Vercel para deploy

## Variáveis de ambiente
Crie um arquivo `.env` na raiz com:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=chave_anon
```

Para as APIs (serverless) na Vercel, configure no painel de variáveis do projeto:
- `SUPABASE_URL` (igual ao de cima)
- `SUPABASE_SERVICE_ROLE` (NÃO EXPONHA NO FRONTEND)
- `VERCEL_API_KEY` (chave privada para autorizar chamadas às rotas /api)

## Supabase - Tabelas
Execute o SQL em `supabase.sql` no seu projeto para criar as tabelas.

## Rodando localmente
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```
