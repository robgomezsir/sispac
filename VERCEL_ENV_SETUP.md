# Configuração de Variáveis de Ambiente no Vercel

## Problema Identificado
A funcionalidade de adicionar usuário estava falhando devido à falta de configuração das variáveis de ambiente necessárias para autenticação com o Supabase.

## Solução Implementada
1. **Autenticação via JWT**: Substituímos a validação por chave Vercel por validação via token JWT do Supabase
2. **Verificação de Role**: Apenas usuários com role 'admin' podem executar operações administrativas
3. **Validação de Token**: O token é validado a cada requisição para garantir segurança

## Variáveis de Ambiente Necessárias

### No Vercel Dashboard:
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `sispac`
3. Vá para **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE=sua_chave_service_role_aqui
```

### Como Obter as Chaves:
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto `zibuyabpsvgulvigvdtb`
3. Vá para **Settings** > **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE`

## Configuração via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Configurar variáveis de ambiente
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE

# Fazer deploy
vercel --prod
```

## Verificação

Após configurar as variáveis:

1. **Reinicie o projeto** no Vercel
2. **Teste a funcionalidade** de adicionar usuário
3. **Verifique os logs** para confirmar que não há erros de autenticação

## Segurança

- ✅ Tokens JWT são validados a cada requisição
- ✅ Apenas usuários admin podem executar operações administrativas
- ✅ Tokens expirados são automaticamente rejeitados
- ✅ Logs detalhados para auditoria

## Troubleshooting

Se ainda houver problemas:

1. Verifique se as variáveis estão configuradas corretamente
2. Confirme se o usuário logado tem role 'admin'
3. Verifique os logs do Vercel para erros específicos
4. Teste a conexão com o Supabase diretamente
