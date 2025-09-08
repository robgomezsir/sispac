# SisPAC (React + Vite + Tailwind + Supabase)

## Pré-requisitos
- Node 18+
- Conta no Supabase com projeto criado
- (Opcional) Plataforma de deploy

## Variáveis de ambiente
Crie um arquivo `.env` na raiz com:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

Para as APIs (serverless), configure no painel de variáveis do projeto:
- `VITE_SUPABASE_URL` (igual ao de cima)
- `VITE_SUPABASE_ANON_KEY` (igual ao de cima)
- `SUPABASE_SERVICE_ROLE` (NÃO EXPONHA NO FRONTEND)
- `API_KEY` (chave privada para autorizar chamadas às rotas /api)

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

## Deploy
### Deploy (Recomendado)
1. Conecte seu repositório à plataforma de deploy
2. Configure as variáveis de ambiente no painel do projeto
3. Configure roteamento para SPA (Single Page Application)

### Outros provedores
- Certifique-se de que o roteamento SPA está configurado
- Todas as rotas devem redirecionar para `index.html`
- Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Solução de problemas
### Página branca após deploy
1. Verifique se as variáveis de ambiente estão configuradas
2. Abra o console do navegador para ver erros
3. Verifique se o roteamento SPA está configurado
4. Teste localmente com `npm run preview`

### Erro de contexto do AuthProvider
- Certifique-se de que o `AuthProvider` está envolvendo a aplicação no `main.jsx`
- Verifique se não há erros de importação

### Problemas de CSS
- Execute `npm run build` para verificar se há erros
- Verifique se o Tailwind está configurado corretamente
