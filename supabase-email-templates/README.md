# 📧 Templates de Email para Supabase - SISPAC

Este diretório contém templates de email personalizados para o sistema de autenticação do Supabase.

## 🎨 Templates Disponíveis

### 📧 **Reset Password (Redefinição de Senha)**

#### 1. `reset-password-optimized.html` - Template Otimizado (RECOMENDADO)
- **Versão**: HTML moderno com CSS inline otimizado
- **Compatibilidade**: Clientes de email modernos (Gmail, Outlook, Apple Mail)
- **Características**: Design responsivo, gradientes, sombras, compatibilidade máxima
- **Baseado no**: Template fornecido pelo usuário, adaptado para funcionar perfeitamente

#### 2. `reset-password.html` - Template Completo
- **Versão**: HTML moderno com CSS inline
- **Compatibilidade**: Clientes de email modernos (Gmail, Outlook, Apple Mail)
- **Características**: Design responsivo, gradientes, sombras, animações CSS

#### 3. `reset-password-simple.html` - Template Simples
- **Versão**: HTML com CSS inline básico
- **Compatibilidade**: Clientes de email legados (Outlook antigo, Thunderbird)
- **Características**: Estrutura em tabelas, CSS inline, sem gradientes complexos

#### 4. `reset-password-basic.html` - Template Básico
- **Versão**: HTML muito simples, máxima compatibilidade
- **Compatibilidade**: Clientes de email muito básicos (Outlook muito antigo)
- **Características**: Estrutura em tabelas, sem CSS complexo, cores básicas

### 🎯 **Invite User (Convite de Usuário)**

#### 1. `invite-user-optimized.html` - Template Otimizado (RECOMENDADO)
- **Versão**: HTML moderno com CSS inline otimizado
- **Compatibilidade**: Clientes de email modernos (Gmail, Outlook, Apple Mail)
- **Características**: Design responsivo, gradientes, sombras, compatibilidade máxima
- **Baseado no**: Template de convite fornecido pelo usuário

#### 2. `invite-user-simple.html` - Template Simples
- **Versão**: HTML com CSS inline básico
- **Compatibilidade**: Clientes de email legados (Outlook antigo, Thunderbird)
- **Características**: Estrutura em tabelas, CSS inline, sem gradientes complexos

### ✨ **Magic Link (Acesso Direto)**

#### 1. `magic-link-optimized.html` - Template Otimizado (RECOMENDADO)
- **Versão**: HTML moderno com CSS inline otimizado
- **Compatibilidade**: Clientes de email modernos (Gmail, Outlook, Apple Mail)
- **Características**: Design responsivo, gradientes, sombras, compatibilidade máxima
- **Baseado no**: Template de Magic Link fornecido pelo usuário

#### 2. `magic-link-simple.html` - Template Simples
- **Versão**: HTML com CSS inline básico
- **Compatibilidade**: Clientes de email legados (Outlook antigo, Thunderbird)
- **Características**: Estrutura em tabelas, CSS inline, sem gradientes complexos

## 🔧 Como Configurar no Supabase

### Passo 1: Acessar o Dashboard
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**

### Passo 2: Configurar o Template "Reset Password"
1. Clique em **"Reset Password"** na lista de templates
2. **Subject heading**: `Redefinição de Senha - SisPAC`
3. **Message body**: 
   - Clique na aba **"<> Source"**
   - Cole o conteúdo do arquivo `reset-password-optimized.html` (RECOMENDADO)
   - Ou use outro template conforme sua necessidade
4. Clique em **"Save"**

### Passo 3: Configurar o Template "Invite User"
1. Clique em **"Invite user"** na lista de templates
2. **Subject heading**: `Convite para acessar o SisPAC`
3. **Message body**: 
   - Clique na aba **"<> Source"**
   - Cole o conteúdo do arquivo `invite-user-optimized.html` (RECOMENDADO)
   - Ou use outro template conforme sua necessidade
4. Clique em **"Save"**

### Passo 4: Configurar o Template "Magic Link"
1. Clique em **"Magic Link"** na lista de templates
2. **Subject heading**: `Acesse o SisPAC com Magic Link`
3. **Message body**: 
   - Clique na aba **"<> Source"**
   - Cole o conteúdo do arquivo `magic-link-optimized.html` (RECOMENDADO)
   - Ou use outro template conforme sua necessidade
4. Clique em **"Save"**

### Passo 5: Configurar URLs de Redirecionamento
1. Vá em **Authentication** → **URL Configuration**
2. Adicione sua URL de produção: `https://sispac-pfuhmrld6-rob-gomezs-projects.vercel.app/reset-password`
3. Adicione sua URL de desenvolvimento (se necessário): `http://localhost:5173/reset-password`

### Passo 6: Configurar Políticas de Senha
1. Em **Authentication** → **Settings**
2. Configure:
   - **Minimum password length**: 6
   - **Password strength**: Conforme sua necessidade

## 🎯 Variáveis do Template

O Supabase substitui automaticamente estas variáveis:

- `{{ .ConfirmationURL }}` - Link para confirmar ação (reset, convite ou magic link)
- `{{ .SiteURL }}` - URL base do seu site
- `{{ .Email }}` - Email do usuário (se disponível)

## 🚀 Melhorias Implementadas

### ✅ **Correções de Compatibilidade:**
- **Estrutura em tabelas** para máxima compatibilidade
- **CSS inline** em todos os elementos
- **Suporte a Outlook** com comentários condicionais
- **Fallbacks** para clientes que não suportam CSS avançado

### ✅ **Design Otimizado:**
- **Header com gradiente** nas cores da sua UI
- **Botão de ação** estilizado e responsivo
- **Informações organizadas** e claras
- **Footer com links úteis** e copyright

### ✅ **Segurança e UX:**
- **Explicação clara** do propósito do email
- **Aviso de expiração** (1 hora para reset, 24 horas para convite, tempo limitado para magic link)
- **Instruções de segurança** para usuários
- **Mensagem de não-resposta**

## 📱 Teste de Compatibilidade

### Clientes de Email Suportados
- ✅ **Gmail** (web e mobile) - Template otimizado
- ✅ **Outlook** (web e desktop) - Template otimizado
- ✅ **Apple Mail** - Template otimizado
- ✅ **Thunderbird** - Template simples
- ✅ **Yahoo Mail** - Template otimizado
- ✅ **Outlook legado** - Template básico

### Teste Recomendado
1. Configure os templates no Supabase
2. Teste reset de senha, convite de usuário e magic link
3. Verifique como aparece em diferentes clientes de email
4. Use os templates otimizados para melhor compatibilidade

## 🔒 Segurança

- ✅ Links expiram automaticamente (configurável no Supabase)
- ✅ URLs de redirecionamento restritas
- ✅ Rate limiting configurável
- ✅ Logs de auditoria disponíveis
- ✅ **Reset Password**: 1 hora (conforme seu template original)
- ✅ **Invite User**: 24 horas (conforme seu template original)
- ✅ **Magic Link**: Tempo limitado e uso único

## 📞 Suporte

Se precisar de ajuda para personalizar os templates:
1. Use os **templates otimizados** para melhor compatibilidade
2. Teste em diferentes clientes de email
3. Verifique a documentação do Supabase
4. Use ferramentas de preview de email (Litmus, Email on Acid)

---

**Recomendações**:
- **Reset Password**: Use `reset-password-optimized.html` como template principal
- **Invite User**: Use `invite-user-optimized.html` como template principal
- **Magic Link**: Use `magic-link-optimized.html` como template principal
- Todos foram adaptados especificamente dos seus templates originais e otimizados para máxima compatibilidade
