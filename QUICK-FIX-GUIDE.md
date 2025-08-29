# 🚨 RESOLUÇÃO RÁPIDA - Erro "Database error querying schema"

## ❌ **Problema Identificado:**
```
Database error querying schema
500 (Internal Server Error)
```

## 🔍 **Causa:**
O Supabase não consegue autenticar porque as tabelas e políticas RLS não estão configuradas.

## ✅ **Solução em 3 Passos:**

### **PASSO 1: Executar Script SQL no Supabase**
1. Acesse: https://supabase.com/dashboard
2. Selecione projeto: `zibuyabpsvgulvigvdtb`
3. Vá para **SQL Editor**
4. Cole e execute o conteúdo de `create-admin-user.sql`
5. Verifique se não há erros

### **PASSO 2: Criar Usuário ADMIN**
1. **Authentication** > **Users**
2. **Add User**
3. Preencher:
   - Email: `robgomez.sir@gmail.com`
   - Password: `admin1630`
   - Email Confirm: `true`
4. **Create User**

### **PASSO 3: Testar Login**
1. Recarregar aplicação: `http://localhost:5174`
2. Tentar login com as credenciais acima
3. Verificar console (F12) para logs

## 🚨 **Se Ainda Der Erro:**

### **Verificar no Supabase:**
```sql
-- Executar no SQL Editor
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### **Verificar Autenticação:**
```sql
-- Verificar se usuário foi criado
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'robgomez.sir@gmail.com';

-- Verificar se perfil foi criado
SELECT * FROM public.profiles 
WHERE email = 'robgomez.sir@gmail.com';
```

## 🔧 **Comandos de Debug:**

### **No Console do Navegador:**
```javascript
// Testar conexão
window.testLogin('robgomez.sir@gmail.com', 'admin1630')

// Verificar estado
console.log("Estado da autenticação:", { user, role })
```

## 📱 **Resultado Esperado:**
- ✅ Login funcionando
- ✅ Redirecionamento para Dashboard
- ✅ Menu completo visível
- ✅ Dados carregando no Dashboard

## 🆘 **Suporte:**
Se continuar com problemas:
1. Verificar logs no console
2. Confirmar execução do script SQL
3. Verificar se usuário foi criado
4. Testar conexão com Supabase
