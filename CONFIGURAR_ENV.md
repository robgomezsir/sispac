# 🔐 Configuração Segura do .env

## ⚠️ IMPORTANTE - SEGURANÇA
Este arquivo contém as chaves reais do Supabase. **NUNCA** commite este arquivo para o Git!

## 📋 Passos para Configurar

### 1. Criar o arquivo .env
```bash
cp env.example .env
```

### 2. O arquivo .env já está configurado com as chaves corretas:
```env
# ===========================================
# CONFIGURAÇÃO DO SUPABASE (FRONTEND)
# ===========================================
VITE_SUPABASE_URL=https://vpdwqaktdglneoitmcnj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHdxYWt0ZGdsbmVvaXRtY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTE2MDMsImV4cCI6MjA3Mjg2NzYwM30.qmI4fUxpkZbCU9Ua5M35N3gDU7PAE0eaOMs2vFBjQow
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHdxYWt0ZGdsbmVvaXRtY25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI5MTYwMywiZXhwIjoyMDcyODY3NjAzfQ.PiPcE-H2I1Zmn2l_aL-TNaG8sRk2qO1NpQP433MxAdQ

# ===========================================
# CONFIGURAÇÃO DA API (PARA SERVERLESS)
# ===========================================
API_KEY=sua_chave_de_api_aqui

# ===========================================
# CONFIGURAÇÃO DO AMBIENTE
# ===========================================
NODE_ENV=development

# ===========================================
# VARIÁVEIS DO SUPABASE PARA APIs (SERVERLESS)
# ===========================================
SUPABASE_URL=https://vpdwqaktdglneoitmcnj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHdxYWt0ZGdsbmVvaXRtY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTE2MDMsImV4cCI6MjA3Mjg2NzYwM30.qmI4fUxpkZbCU9Ua5M35N3gDU7PAE0eaOMs2vFBjQow
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHdxYWt0ZGdsbmVvaXRtY25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI5MTYwMywiZXhwIjoyMDcyODY3NjAzfQ.PiPcE-H2I1Zmn2l_aL-TNaG8sRk2qO1NpQP433MxAdQ
```

### 3. Gerar uma chave de API segura
```bash
# Exemplo de geração de chave (substitua no .env)
echo "sispac_$(openssl rand -hex 16)"
```

### 4. Testar a configuração
```bash
npm run dev
```

## 🔒 Informações de Segurança

### Chaves Configuradas:
- **URL**: `https://vpdwqaktdglneoitmcnj.supabase.co`
- **Anon Key**: Configurada (pública)
- **Service Key**: Configurada (privada)
- **RLS Key**: `sb_publishable_G3_57LFFyIE0XeqF68Jr6w_hYVVjXOg`

### ⚠️ Lembrete de Segurança:
- O arquivo `.env` está no `.gitignore` (não será commitado)
- As chaves estão configuradas como fallbacks no código
- A aplicação funcionará mesmo sem o arquivo `.env`
- Para produção, configure as variáveis na plataforma de deploy

## ✅ Verificação
Após configurar, acesse `/debug` na aplicação para verificar se todas as chaves estão funcionando corretamente.
