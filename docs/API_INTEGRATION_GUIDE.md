# Guia de Integração da API SisPAC

## Visão Geral

O SisPAC oferece uma API REST completa para integração com sistemas externos como Gupy, plataformas de RH e outras ferramentas de recrutamento. Esta documentação fornece todas as informações necessárias para implementar a integração.

## Autenticação

Todos os endpoints da API requerem autenticação via Bearer Token:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Configuração da Chave de API

1. Acesse o painel da plataforma de deploy
2. Vá para Settings > Environment Variables
3. Adicione a variável `API_KEY` com sua chave de API
4. Faça o redeploy da aplicação

## Endpoints Disponíveis

### 1. Listar Candidatos

**GET** `/api/candidates`

Retorna todos os candidatos com perfil comportamental completo.

**Exemplo de Requisição:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-domain.com/api/candidates
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "score": 85,
    "status": "ACIMA DA EXPECTATIVA",
    "created_at": "2024-01-15T10:30:00Z",
    "behavioral_profile": {
      "perfil": "Profissional maduro emocionalmente...",
      "comportamento": "Proatividade clara...",
      "competencias": "Fortes competências interpessoais...",
      "lideranca": "Bom potencial para liderar times...",
      "areas_desenvolvimento": ["Delegação eficiente..."],
      "visao_estrategica": "Visão estratégica de médio prazo...",
      "recomendacoes": "Investir em programas de desenvolvimento..."
    }
  }
]
```

### 2. Detalhes do Candidato

**GET** `/api/candidate/:id`

Retorna detalhes completos de um candidato específico.

**Exemplo de Requisição:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-domain.app.com/api/candidate/123
```

**Resposta:**
```json
{
  "id": 123,
  "name": "Maria Santos",
  "email": "maria@email.com",
  "answers": {
    "1": ["RESPONSÁVEL", "PROATIVA", "COMUNICATIVA"],
    "2": ["LÍDER", "CONFIANTE", "ORGANIZADA"],
    "3": ["Sempre vou aos compromissos..."],
    "4": ["Trabalhar com Amor", "ética", "comprometimento"]
  },
  "score": 92,
  "status": "SUPEROU A EXPECTATIVA",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 3. Remover Candidato

**POST** `/api/deleteCandidate`

Remove um candidato do sistema (por ID, email ou nome).

**Exemplo de Requisição:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email": "candidato@email.com"}' \
     https://your-domain.app.com/api/deleteCandidate
```

**Resposta:**
```json
{
  "success": true,
  "message": "Candidato removido com sucesso",
  "candidate": {
    "id": 123,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### 4. Criar Usuário

**POST** `/api/addUser`

Cria um novo usuário do sistema (RH ou Admin).

**Exemplo de Requisição:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name": "Novo Usuário", "email": "usuario@empresa.com", "role": "rh"}' \
     https://your-domain.app.com/api/addUser
```

**Resposta:**
```json
{
  "message": "Usuário Novo Usuário criado com sucesso! Senha temporária: 123456",
  "userId": "uuid-here",
  "email": "usuario@empresa.com",
  "role": "rh",
  "profileCreated": true
}
```

### 5. Webhook da Gupy

**POST** `/api/gupy-webhook`

Endpoint para receber candidatos da plataforma Gupy com geração automática de token de acesso único.

**Exemplo de Requisição:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "candidate_id": "12345",
       "name": "João Silva",
       "email": "joao@email.com",
       "job_id": "vaga-001",
       "application_date": "2024-01-15T10:30:00Z"
     }' \
     https://your-domain.app.com/api/gupy-webhook
```

**Resposta:**
```json
{
  "success": true,
  "message": "Candidato criado com sucesso",
  "action": "created",
  "candidate": {
    "id": 123,
    "name": "João Silva",
    "email": "joao@email.com",
    "gupy_candidate_id": "12345",
    "status": "PENDENTE_TESTE",
    "access_token": "sispac_abc123def456..."
  },
  "access_link": "https://your-domain.app.com/form?token=sispac_abc123def456...",
  "next_steps": [
    "Candidato receberá link único para teste comportamental",
    "Link expira em 24 horas por segurança",
    "Resultados serão sincronizados automaticamente",
    "RH pode acompanhar progresso no dashboard"
  ]
}
```

### 6. Validar Token de Acesso

**POST** `/api/validate-token`

Valida token de acesso único para o formulário.

**Exemplo de Requisição:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"token": "sispac_abc123def456..."}' \
     https://your-domain.app.com/api/validate-token
```

**Resposta:**
```json
{
  "valid": true,
  "message": "Token válido",
  "candidate": {
    "id": 123,
    "name": "João Silva",
    "email": "joao@email.com",
    "gupy_candidate_id": "12345",
    "status": "PENDENTE_TESTE"
  },
  "token_info": {
    "created_at": "2024-01-15T10:30:00Z",
    "hours_old": 2.5,
    "expires_in_hours": 21.5
  }
}
```

## Sistema de Pontuação

### Categorias de Avaliação

1. **Questão 1: Como você acha que as pessoas te veem?**
   - 5 escolhas obrigatórias
   - Pesos: 1-3 pontos por característica
   - Exemplos: RESPONSÁVEL (2pts), LÍDER (2pts), GOSTA DE GENTE (3pts)

2. **Questão 2: E você, como se vê?**
   - 5 escolhas obrigatórias
   - Pesos: 1-3 pontos por característica
   - Exemplos: CONFIANTE (1pt), PROATIVA (2pts), AMOROSA (3pts)

3. **Questão 3: Frases de vida mais importantes**
   - 5 escolhas obrigatórias
   - Pesos: 3-5 pontos por frase
   - Exemplos: "Sempre vou aos compromissos..." (3pts), "Consigo entender como os outros se sentem" (5pts)

4. **Questão 4: Valores mais importantes**
   - 5 escolhas obrigatórias
   - Pesos: 7-9 pontos por valor
   - Exemplos: "Trabalhar com Amor" (9pts), "ética" (7pts), "comprometimento" (9pts)

### Classificação por Score

| Score | Status | Descrição |
|-------|--------|-----------|
| ≤ 67 | ABAIXO DA EXPECTATIVA | Potencial para crescimento |
| 68-75 | DENTRO DA EXPECTATIVA | Funcional e confiável |
| 76-95 | ACIMA DA EXPECTATIVA | Profissional maduro |
| ≥ 96 | SUPEROU A EXPECTATIVA | Alto desempenho |

## Sistema de Tokens de Acesso

### Visão Geral

O SisPAC implementa um sistema de tokens de acesso único para garantir segurança e controle de acesso ao formulário comportamental. Cada candidato recebe um token único que:

- **Expira em 24 horas** por segurança
- **É válido apenas uma vez** (após completar o teste)
- **É gerado automaticamente** pelo webhook da Gupy
- **Permite acesso direto** ao formulário sem login

### Características dos Tokens

- **Formato**: `sispac_` + 32 caracteres hexadecimais
- **Exemplo**: `sispac_abc123def456789012345678901234567890`
- **Expiração**: 24 horas a partir da criação
- **Validação**: Verificada no banco de dados em tempo real

### Fluxo de Segurança

1. **Geração**: Token criado automaticamente no webhook da Gupy
2. **Distribuição**: Link único enviado para o candidato
3. **Validação**: Token verificado antes de permitir acesso ao formulário
4. **Uso**: Token associado aos resultados do teste
5. **Expiração**: Token invalido após 24 horas ou uso

## Integração com Gupy

### Configuração do Webhook

1. Acesse as configurações da Gupy
2. Configure o webhook para: `https://your-domain.app.com/api/gupy-webhook`
3. Método: POST
4. Headers: `Content-Type: application/json`

### Payload do Webhook

```json
{
  "candidate_id": "ID do candidato na Gupy",
  "name": "Nome completo",
  "email": "Email do candidato",
  "job_id": "ID da vaga",
  "application_date": "Data da candidatura",
  "phone": "Telefone (opcional)",
  "resume_url": "URL do currículo (opcional)",
  "gupy_data": "Dados adicionais da Gupy (opcional)"
}
```

### Fluxo de Integração com Tokens

1. **Candidatura**: Candidato se inscreve na vaga na Gupy
2. **Webhook**: Gupy envia webhook para o SisPAC
3. **Geração de Token**: SisPAC gera token único e cria registro do candidato
4. **Link Único**: Candidato recebe link único com token para teste
5. **Validação**: Formulário valida token antes de permitir acesso
6. **Teste**: Candidato preenche o formulário comportamental
7. **Resultados**: Resultados são salvos e sincronizados automaticamente
8. **Relatórios**: RH acessa relatórios no SisPAC

## Códigos de Status HTTP

- **200**: Sucesso
- **400**: Dados inválidos
- **401**: Não autorizado
- **404**: Recurso não encontrado
- **405**: Método não permitido
- **409**: Conflito (recurso já existe)
- **500**: Erro interno do servidor

## Rate Limiting

A API possui limites de requisições por minuto para garantir estabilidade e performance:

- **Endpoints de leitura**: 100 requisições/minuto
- **Endpoints de escrita**: 50 requisições/minuto
- **Webhooks**: 200 requisições/minuto

## Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "error": "Descrição do erro",
  "message": "Mensagem detalhada",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Exemplos de Integração

### JavaScript/Node.js

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://your-domain.app.com/api',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Listar candidatos
async function getCandidates() {
  try {
    const response = await apiClient.get('/candidates');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error.response.data);
  }
}

// Criar candidato via webhook
async function createCandidateFromGupy(candidateData) {
  try {
    const response = await apiClient.post('/gupy-webhook', candidateData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar candidato:', error.response.data);
  }
}
```

### Python

```python
import requests

class SisPACClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_candidates(self):
        response = requests.get(
            f'{self.base_url}/api/candidates',
            headers=self.headers
        )
        return response.json()
    
    def create_candidate_from_gupy(self, candidate_data):
        response = requests.post(
            f'{self.base_url}/api/gupy-webhook',
            headers=self.headers,
            json=candidate_data
        )
        return response.json()

# Uso
client = SisPACClient('https://your-domain.app.com', 'YOUR_API_KEY')
candidates = client.get_candidates()
```

## Suporte

Para dúvidas ou suporte técnico:

1. Consulte a documentação interativa no Painel de API
2. Verifique os logs da aplicação na plataforma de deploy
3. Entre em contato com a equipe de desenvolvimento

## Changelog

### v1.0.0 (2024-01-15)
- Lançamento inicial da API
- Endpoints básicos de candidatos
- Integração com Gupy via webhook
- Sistema de pontuação comportamental
- Autenticação via Bearer Token
