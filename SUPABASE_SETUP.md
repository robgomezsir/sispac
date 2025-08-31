# 🚀 **Configuração do Supabase para o Sistema SisPAC**

## 📋 **Visão Geral**

Este documento contém as instruções para configurar o banco de dados Supabase com todas as tabelas necessárias para o funcionamento completo do sistema SisPAC.

## 🎯 **Tabelas Principais**

### **1. `profiles` - Usuários do Sistema**
- **Função**: Gerenciar usuários com diferentes níveis de acesso
- **Campos principais**: `id`, `email`, `full_name`, `role`, `created_at`
- **Roles**: `admin`, `rh`, `user`

### **2. `candidates` - Candidatos de Teste**
- **Função**: Armazenar dados dos candidatos e resultados dos testes
- **Campos principais**: `id`, `name`, `email`, `score`, `status`, `answers`
- **Status**: `SUPEROU A EXPECTATIVA`, `ACIMA DA EXPECTATIVA`, `DENTRO DA EXPECTATIVA`, `ABAIXO DA EXPECTATIVA`, `REMOVIDO`

### **3. `results` - Resultados Detalhados**
- **Função**: Armazenar respostas individuais de cada questão
- **Campos principais**: `candidate_id`, `question_id`, `selected_answers`, `score_question`

### **4. `questions` - Configuração das Questões**
- **Função**: Definir estrutura e configuração das questões do teste
- **Campos principais**: `id`, `title`, `max_choices`, `columns`, `category`

### **5. `question_answers` - Respostas Possíveis**
- **Função**: Definir todas as opções de resposta para cada questão
- **Campos principais**: `question_id`, `answer_text`, `answer_value`, `weight`

### **6. `test_sessions` - Sessões de Teste**
- **Função**: Controlar sessões ativas e progresso dos testes
- **Campos principais**: `session_token`, `candidate_id`, `status`, `progress_percentage`

### **7. `audit_logs` - Log de Auditoria**
- **Função**: Registrar todas as operações para auditoria
- **Campos principais**: `user_id`, `action`, `table_name`, `record_id`

## 🔧 **Como Implementar**

### **Passo 1: Acessar o Supabase Dashboard**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto do SisPAC

### **Passo 2: Executar o SQL**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Copie todo o conteúdo do arquivo `supabase_tables.sql`
4. Cole no editor SQL
5. Clique em **"Run"**

### **Passo 3: Verificar as Tabelas**
1. No menu lateral, clique em **"Table Editor"**
2. Verifique se todas as tabelas foram criadas:
   - ✅ `profiles`
   - ✅ `candidates`
   - ✅ `results`
   - ✅ `questions`
   - ✅ `question_answers`
   - ✅ `test_sessions`
   - ✅ `audit_logs`

### **Passo 4: Verificar os Dados Iniciais**
1. Na tabela `questions`, verifique se há 5 questões
2. Na tabela `question_answers`, verifique se há todas as respostas
3. Na tabela `profiles`, verifique se está vazia (pronta para receber usuários)

## 🚨 **Problemas Comuns e Soluções**

### **Problema 1: Erro de Permissão**
```
ERROR: permission denied for table
```
**Solução**: Verifique se você está logado como owner do projeto

### **Problema 2: Extensão não encontrada**
```
ERROR: extension "uuid-ossp" does not exist
```
**Solução**: A extensão é criada automaticamente pelo Supabase

### **Problema 3: Políticas RLS não funcionam**
```
ERROR: new row violates row-level security policy
```
**Solução**: Verifique se as políticas foram criadas corretamente

## 🔐 **Configuração de Segurança**

### **Row Level Security (RLS)**
- ✅ **Habilitado** em todas as tabelas
- ✅ **Políticas** configuradas para diferentes níveis de acesso
- ✅ **Usuários** podem ver apenas seus próprios dados
- ✅ **Admins** podem acessar todos os dados

### **Políticas de Acesso**
- **`profiles`**: Usuários veem apenas seu perfil, admins veem todos
- **`candidates`**: Todos os usuários autenticados podem ler, admins podem modificar
- **`results`**: Usuários podem ver resultados, admins podem modificar
- **`questions`**: Todos podem ler, admins podem modificar
- **`audit_logs`**: Apenas admins podem acessar

## 📊 **Estrutura de Dados**

### **Exemplo de Candidato**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "score": 85,
  "status": "ACIMA DA EXPECTATIVA",
  "answers": {
    "question_1": ["PRESTATIVA", "FELIZ", "COERENTE", "LÍDER", "GOSTA DE GENTE"],
    "question_2": ["RESPONSÁVEL", "EDUCADA", "ORGANIZADA", "PROATIVA", "INTELIGENTE"],
    "question_3": ["Sempre vou aos compromissos que combinei", "Ajudo as pessoas que precisam de mim"],
    "question_4": ["Trabalhar com Amor", "excelência em servir"],
    "question_5": ["Liderança", "Comunicação", "Empatia", "Integridade", "Mentoria"]
  },
  "created_at": "2025-08-31T15:30:00Z"
}
```

### **Exemplo de Resultado Detalhado**
```json
{
  "id": 1,
  "candidate_id": 1,
  "question_id": 1,
  "question_title": "Como você acha que as pessoas te vêem?",
  "selected_answers": ["PRESTATIVA", "FELIZ", "COERENTE", "LÍDER", "GOSTA DE GENTE"],
  "max_choices": 5,
  "response_time_seconds": 45,
  "score_question": 85.50,
  "feedback": "Excelente seleção de características positivas"
}
```

## 🔄 **Funções Automáticas**

### **Triggers**
- ✅ **`updated_at`**: Atualiza automaticamente quando registros são modificados
- ✅ **Validações**: Verifica constraints de dados antes da inserção

### **Funções**
- ✅ **`calculate_candidate_score()`**: Calcula score automático baseado nas respostas
- ✅ **`determine_candidate_status()`**: Define status baseado no score

## 📈 **Índices de Performance**

### **Índices Criados**
- ✅ **Email**: Busca rápida por email
- ✅ **Status**: Filtros por status do candidato
- ✅ **Score**: Ordenação por pontuação
- ✅ **Data**: Ordenação por data de criação
- ✅ **JSONB**: Busca eficiente em campos de resposta

## 🧪 **Testando a Configuração**

### **Teste 1: Inserir Usuário**
```sql
INSERT INTO profiles (email, full_name, role) 
VALUES ('admin@teste.com', 'Administrador Teste', 'admin');
```

### **Teste 2: Inserir Candidato**
```sql
INSERT INTO candidates (name, email, score, status, answers) 
VALUES ('Candidato Teste', 'candidato@teste.com', 75, 'DENTRO DA EXPECTATIVA', '{}');
```

### **Teste 3: Verificar Políticas RLS**
```sql
-- Deve retornar apenas o próprio perfil
SELECT * FROM profiles WHERE id = auth.uid();
```

## 🚀 **Próximos Passos**

1. ✅ **Execute o SQL** no Supabase
2. ✅ **Verifique as tabelas** criadas
3. ✅ **Teste as políticas** de segurança
4. ✅ **Configure as variáveis** de ambiente
5. ✅ **Teste o sistema** com dados reais

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs de erro no Supabase
2. Confirme se todas as tabelas foram criadas
3. Teste as políticas RLS individualmente
4. Verifique se as extensões estão habilitadas

---

**🎯 Sistema SisPAC configurado e pronto para uso!**
