# 👑 Configuração do Usuário ADMIN GERAL

## 🎯 **Objetivo**
Criar um usuário com role `admin` e testar o login no Dashboard do SisPAC.

## 📋 **Passos para Configurar o ADMIN**

### **1. Acessar o Painel do Supabase**
- URL: https://supabase.com/dashboard
- Login na sua conta
- Selecionar projeto: `zibuyabpsvgulvigvdtb`

### **2. Habilitar Autenticação por Email**
- **Authentication** > **Settings**
- **Auth Providers** > **Email** = `enabled`
- **Enable email confirmations** = `false` (para desenvolvimento)

### **3. Criar Usuário ADMIN**
- **Authentication** > **Users**
- **Add User**
- Preencher:
  - **Email**: `robgomez.sir@gmail.com`
  - **Password**: `admin1630`
  - **Email Confirm**: `true`

### **4. Executar Script SQL**
- **SQL Editor**
- Copiar e executar o conteúdo de `create-admin-user.sql`
- Verificar se todas as etapas foram executadas com sucesso

### **5. Verificar Configuração**
- Confirmar que o usuário foi criado
- Verificar se o perfil com role `admin` foi criado
- Confirmar que as políticas RLS estão ativas

## 🧪 **Teste do Login ADMIN**

### **1. Acessar a Aplicação**
- URL: `http://localhost:5174`
- Verificar se a página de login carrega

### **2. Fazer Login**
- **Email**: `robgomez.sir@gmail.com`
- **Password**: `admin1630`
- Clicar em **Entrar**

### **3. Verificar Redirecionamento**
- Deve ser redirecionado para `/dashboard`
- Menu de navegação deve aparecer com:
  - Formulário
  - Dashboard
  - Configurações (visível para admin)
  - Painel de API (visível para admin)

### **4. Testar Funcionalidades ADMIN**
- Acessar **Dashboard** - deve carregar dados
- Acessar **Configurações** - deve permitir acesso
- Acessar **Painel de API** - deve permitir acesso

## 🚨 **Possíveis Problemas e Soluções**

### **Erro: "Invalid login credentials"**
- Verificar se o usuário foi criado no Supabase
- Confirmar se a senha está correta
- Verificar se o email foi confirmado

### **Erro: "User not found"**
- Executar o script SQL completo
- Verificar se a tabela `profiles` foi criada
- Confirmar se o perfil foi inserido

### **Dashboard não carrega dados**
- Verificar se as tabelas `candidates` e `results` existem
- Confirmar se as políticas RLS permitem acesso autenticado

### **Menu de navegação incompleto**
- Verificar se o role está sendo definido como `admin`
- Confirmar se o hook `useAuth` está funcionando

## 🔍 **Verificações de Debug**

### **Console do Navegador (F12)**
- Verificar se há erros de JavaScript
- Confirmar se as chamadas para Supabase estão funcionando

### **Network Tab**
- Verificar se as requisições para Supabase estão sendo feitas
- Confirmar se as respostas estão corretas

### **Logs do Supabase**
- Verificar se há erros de autenticação
- Confirmar se as políticas RLS estão funcionando

## ✅ **Checklist de Sucesso**

- [ ] Usuário criado no Supabase
- [ ] Perfil com role `admin` criado
- [ ] Login funciona na aplicação
- [ ] Redirecionamento para Dashboard
- [ ] Menu de navegação completo
- [ ] Acesso às páginas protegidas
- [ ] Dashboard carrega dados
- [ ] Funcionalidades admin funcionando

## 🎉 **Resultado Esperado**
Após a configuração, você deve conseguir:
1. Fazer login com as credenciais admin
2. Acessar o Dashboard
3. Ver todas as opções do menu (incluindo Configurações e API)
4. Navegar entre as páginas protegidas
5. Visualizar dados no Dashboard

## 🆘 **Suporte**
Se encontrar problemas:
1. Verifique o console do navegador
2. Confirme a configuração no Supabase
3. Execute o script SQL novamente
4. Verifique as variáveis de ambiente
