# Configuração de Variáveis de Ambiente

## 📋 Resumo das Variáveis Necessárias

### ✅ **Obrigatórias para Funcionamento Básico:**
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase

### 🔧 **Obrigatórias para APIs (Serverless):**
- `SUPABASE_URL` - URL do projeto Supabase (para APIs)
- `SUPABASE_ANON_KEY` - Chave anônima do Supabase (para APIs)
- `SUPABASE_SERVICE_ROLE` - Chave de serviço do Supabase (para APIs)
- `API_KEY` - Chave para autenticação das APIs


### 🌍 **Configuração do Ambiente:**
- `NODE_ENV` - Ambiente de execução (development/production)

## 🚀 Como Configurar

### 1. Copiar o arquivo de exemplo
```bash
cp env.example .env
```

### 2. Editar o arquivo .env
Substitua os valores pelos seus dados reais:

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui

# APIs (obrigatório para serverless)
SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE=sua_chave_de_servico_aqui
API_KEY=sua_chave_de_api_aqui


# Ambiente
NODE_ENV=development
```

## 🔑 Como Obter as Chaves

### Supabase
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY` e `SUPABASE_ANON_KEY`
   - **service_role** → `VITE_SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_SERVICE_ROLE`


### API_KEY
Gere uma chave aleatória segura (ex: `sispac_abc123def456...`)

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env` real
- As chaves `VITE_*` são públicas (frontend)
- As outras chaves são privadas (serverless/backend)
- Use valores diferentes para desenvolvimento e produção

## 🧪 Testando a Configuração

Após configurar, teste se está funcionando:

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Verificar se não há erros no console
```

## 🔍 Verificação de Status

A aplicação possui um painel de debug que mostra o status das variáveis:
- Acesse `/debug` na aplicação
- Verifique se todas as chaves estão configuradas corretamente
