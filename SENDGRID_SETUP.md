# Configuração do SendGrid para Envio de Emails

Este documento explica como configurar o SendGrid para envio automático de emails no sistema SisPAC.

## 1. Criar Conta no SendGrid

1. Acesse [https://sendgrid.com](https://sendgrid.com)
2. Crie uma conta gratuita (100 emails/dia)
3. Verifique seu email

## 2. Configurar Domínio (Opcional mas Recomendado)

### Para usar email personalizado:
1. Acesse **Settings > Sender Authentication**
2. Clique em **Authenticate Your Domain**
3. Siga as instruções para configurar DNS
4. Aguarde a verificação (pode levar até 48h)

### Para usar email do SendGrid:
- Use `noreply@sendgrid.net` (não recomendado para produção)

## 3. Criar API Key

1. Acesse **Settings > API Keys**
2. Clique em **Create API Key**
3. Escolha **Restricted Access**
4. Configure as permissões:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (opcional)
5. Copie a API Key gerada

## 4. Configurar Variáveis de Ambiente

### No Vercel (Produção):
1. Acesse o dashboard do Vercel
2. Vá para **Settings > Environment Variables**
3. Adicione as variáveis:
   - `SENDGRID_API_KEY`: Sua API Key do SendGrid
   - `SENDGRID_FROM_EMAIL`: Email remetente verificado

### Localmente (Desenvolvimento):
1. Copie `env.sendgrid.example` para `.env.local`
2. Configure as variáveis:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@seudominio.com
   ```

## 5. Verificar Configuração

Após configurar, teste o envio de email:

1. Acesse o Dashboard
2. Adicione um novo candidato
3. Verifique se o email foi enviado
4. Consulte os logs no console do Vercel

## 6. Monitoramento

### Logs de Email:
- Acesse **Activity > Email Activity** no SendGrid
- Visualize estatísticas de envio, bounces, etc.

### Logs da Aplicação:
- Console do Vercel mostra logs detalhados
- Tabela `email_logs` no Supabase registra todos os envios

## 7. Troubleshooting

### Erro: "Invalid API Key"
- Verifique se a API Key está correta
- Confirme se tem permissões de Mail Send

### Erro: "The from address does not match a verified Sender Identity"
- Verifique o email remetente no SendGrid
- Use um email verificado ou configure domínio

### Emails não chegam:
- Verifique a pasta de spam
- Confirme se o domínio está verificado
- Verifique logs de bounce no SendGrid

## 8. Limites e Custos

### Plano Gratuito:
- 100 emails/dia
- Sem suporte prioritário
- Branding SendGrid nos emails

### Planos Pagos:
- A partir de $19.95/mês
- Mais emails e recursos
- Suporte prioritário
- Sem branding SendGrid

## 9. Segurança

- Nunca commite a API Key no código
- Use variáveis de ambiente
- Monitore uso da API Key
- Revogue keys não utilizadas

## 10. Alternativas

Se preferir outros provedores:
- **Mailgun**: Similar ao SendGrid
- **AWS SES**: Mais econômico para grandes volumes
- **Resend**: Focado em desenvolvedores
- **Postmark**: Focado em transacionais
