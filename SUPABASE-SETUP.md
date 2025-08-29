# 🔐 Configuração do Supabase para Login

## 📋 **Passos para Configurar Autenticação**

### 1. **Acessar o Painel do Supabase**
- URL: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `zibuyabpsvgulvigvdtb`

### 2. **Habilitar Autenticação por Email/Senha**
- Vá para **Authentication** > **Settings**
- Em **Auth Providers**, certifique-se que **Email** está habilitado
- Configure **Enable email confirmations** como `false` (para desenvolvimento)

### 3. **Criar Usuário de Teste**
- Vá para **Authentication** > **Users**
- Clique em **Add User**
- Preencha:
  - **Email**: `robgomez.sir@gmail.com`
  - **Password**: `admin1630`
  - **Email Confirm**: `true`

### 4. **Executar Script SQL**
- Vá para **SQL Editor**
- Execute o script `setup-auth.js` que foi criado

### 5. **Verificar Configuração**
- Teste o login na aplicação
- Verifique se consegue acessar o Dashboard
- Confirme se o role está sendo definido corretamente

## 🚨 **Problemas Comuns**

### **Erro: "Invalid login credentials"**
- Verifique se o usuário foi criado no Supabase
- Confirme se a senha está correta
- Verifique se o email está confirmado

### **Erro: "User not found"**
- Execute o script SQL para criar o perfil
- Verifique se as políticas RLS estão corretas

### **Dashboard não carrega dados**
- Verifique se as tabelas `candidates` e `results` existem
- Confirme se as políticas RLS permitem acesso autenticado

## 🔧 **Teste do Sistema**

1. **Acesse**: `http://localhost:5174`
2. **Faça login** com: `robgomez.sir@gmail.com` / `admin1630`
3. **Verifique** se é redirecionado para `/dashboard`
4. **Confirme** se consegue ver o menu de navegação
5. **Teste** acesso às páginas protegidas

## 📱 **Credenciais de Teste**
- **Admin**: `robgomez.sir@gmail.com` / `admin1630`
- **Acesso**: Dashboard, Configurações, API Panel
- **Role**: `admin`

## 🆘 **Suporte**
Se continuar com problemas, verifique:
- Console do navegador (F12)
- Logs do Supabase
- Configuração das variáveis de ambiente
