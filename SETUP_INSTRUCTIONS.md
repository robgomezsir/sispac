# 🚨 INSTRUÇÕES URGENTES - Configuração do Ambiente

## ❌ **PROBLEMA IDENTIFICADO**

A aplicação **NÃO está funcionando** porque as variáveis de ambiente do Supabase não estão configuradas!

## 🔧 **SOLUÇÃO - Criar Arquivo .env**

### **Passo 1: Criar arquivo .env na raiz do projeto**

Crie um arquivo chamado `.env` (sem extensão) na pasta raiz do projeto `sispac-app` com o seguinte conteúdo:

```env
# Supabase Configuration - Modo Desenvolvimento
VITE_SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_AQUI
VITE_SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICO_AQUI

# Modo Desenvolvimento
NODE_ENV=development
VITE_APP_ENV=development
VITE_DEBUG=true
```

### **Passo 2: Obter as Chaves do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto `zibuyabpsvgulvigvdtb`
4. Vá para **Settings** > **API**
5. Copie as seguintes chaves:

#### **VITE_SUPABASE_ANON_KEY (Chave Anônima)**
- Localizada em: **Project API keys** > **anon public**
- Esta é a chave pública que pode ser exposta no frontend

#### **VITE_SUPABASE_SERVICE_ROLE_KEY (Chave de Serviço)**
- Localizada em: **Project API keys** > **service_role**
- ⚠️ **ATENÇÃO**: Esta chave é privada e deve ser mantida segura

### **Passo 3: Substituir no arquivo .env**

```env
# Exemplo de como deve ficar:
VITE_SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.REAL_KEY_HERE
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTY3MjgwMCwiZXhwIjoyMDUxMjQ4ODAwfQ.REAL_SERVICE_KEY_HERE
```

### **Passo 4: Reiniciar o Servidor**

Após criar o arquivo `.env`:

1. Pare o servidor (Ctrl+C)
2. Execute: `npm run dev`
3. Verifique no console se as mensagens de erro do Supabase desapareceram

## 🔍 **Como Verificar se Funcionou**

### **No Console do Navegador:**
- ✅ `🔍 [Supabase] URL: https://zibuyabpsvgulvigvdtb.supabase.co`
- ✅ `🔍 [Supabase] Anon Key: ***`
- ✅ `🔍 [Supabase] Service Key: ***`

### **No Console do Terminal:**
- ❌ Não deve aparecer: `❌ [Supabase] Variáveis de ambiente não configuradas!`

## 🧪 **Teste de Funcionamento**

1. Acesse: http://localhost:5178/
2. Tente fazer login com suas credenciais
3. Deve redirecionar para o dashboard automaticamente

## 🆘 **Se Ainda Não Funcionar**

### **Verificar no Console do Navegador:**
- Abra DevTools (F12)
- Vá para Console
- Procure por erros relacionados ao Supabase
- Verifique se as chaves estão sendo carregadas

### **Verificar no Terminal:**
- Execute: `npm run dev`
- Procure por mensagens de erro relacionadas ao Supabase

## 📁 **Estrutura de Arquivos**

```
sispac-app/
├── .env                    ← CRIAR ESTE ARQUIVO
├── src/
├── package.json
└── ...
```

## ⚠️ **IMPORTANTE**

- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- As chaves são específicas do seu projeto Supabase
- Sem essas chaves, a autenticação **NÃO funcionará**

---

**Após configurar o .env, a aplicação deve funcionar perfeitamente!** 🚀
