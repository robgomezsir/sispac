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
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

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
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_here
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
- **URL**: Configurada (substitua pela sua URL)
- **Anon Key**: Configurada (pública)
- **Service Key**: Configurada (privada)
- **RLS Key**: Configurada (substitua pela sua chave)

### ⚠️ Lembrete de Segurança:
- O arquivo `.env` está no `.gitignore` (não será commitado)
- As chaves estão configuradas como fallbacks no código
- A aplicação funcionará mesmo sem o arquivo `.env`
- Para produção, configure as variáveis na plataforma de deploy

## ✅ Verificação
Após configurar, acesse `/debug` na aplicação para verificar se todas as chaves estão funcionando corretamente.
