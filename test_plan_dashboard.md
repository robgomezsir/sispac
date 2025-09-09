# Plano de Testes - Dashboard SisPAC

## Objetivo
Testar o carregamento e funcionalidades do dashboard, focando especialmente no carregamento de dados dos candidatos.

## Ambiente de Teste
- **URL**: http://localhost:5173
- **Navegador**: Chrome/Firefox
- **Dados**: Usar dados de teste do Supabase

## Cenários de Teste

### 1. Teste de Carregamento Inicial do Dashboard

#### 1.1 Acesso sem Autenticação
- **Objetivo**: Verificar redirecionamento para login
- **Passos**:
  1. Acessar http://localhost:5173/dashboard
  2. Verificar se é redirecionado para página de login
- **Resultado Esperado**: Redirecionamento para `/` (página de login)

#### 1.2 Acesso com Autenticação Válida
- **Objetivo**: Verificar carregamento correto do dashboard
- **Passos**:
  1. Fazer login com credenciais válidas
  2. Acessar http://localhost:5173/dashboard
  3. Verificar se o dashboard carrega
- **Resultado Esperado**: Dashboard carrega com interface completa

### 2. Teste de Carregamento de Dados

#### 2.1 Carregamento Automático de Candidatos
- **Objetivo**: Verificar se os dados são carregados automaticamente
- **Passos**:
  1. Fazer login
  2. Acessar dashboard
  3. Aguardar carregamento automático
  4. Verificar se dados aparecem
- **Resultado Esperado**: 
  - Loading spinner aparece inicialmente
  - Dados são carregados automaticamente
  - Estatísticas são exibidas (Total, Superaram, Acima, Dentro, Abaixo)

#### 2.2 Carregamento Manual (Botão Atualizar)
- **Objetivo**: Verificar funcionalidade do botão atualizar
- **Passos**:
  1. Fazer login e acessar dashboard
  2. Clicar no botão "Atualizar"
  3. Verificar se dados são recarregados
- **Resultado Esperado**: Dados são recarregados com loading spinner

#### 2.3 Tratamento de Erro de Conexão
- **Objetivo**: Verificar tratamento de erros de rede
- **Passos**:
  1. Desconectar internet
  2. Acessar dashboard
  3. Verificar mensagem de erro
- **Resultado Esperado**: Mensagem de erro de conexão exibida

### 3. Teste de Funcionalidades do Dashboard

#### 3.1 Filtros de Busca
- **Objetivo**: Verificar funcionalidade de busca
- **Passos**:
  1. Acessar dashboard com dados carregados
  2. Digitar no campo de busca
  3. Verificar filtragem em tempo real
- **Resultado Esperado**: Lista é filtrada conforme busca

#### 3.2 Filtros Avançados
- **Objetivo**: Verificar filtros por status, pontuação e data
- **Passos**:
  1. Acessar dashboard
  2. Abrir filtros avançados
  3. Aplicar filtros por status
  4. Aplicar filtros por pontuação
  5. Aplicar filtros por data
- **Resultado Esperado**: Dados são filtrados corretamente

#### 3.3 Ordenação
- **Objetivo**: Verificar funcionalidade de ordenação
- **Passos**:
  1. Acessar dashboard
  2. Clicar nos cabeçalhos das colunas para ordenar
  3. Verificar ordenação ascendente/descendente
- **Resultado Esperado**: Dados são ordenados corretamente

#### 3.4 Visualização em Cartões vs Tabela
- **Objetivo**: Verificar alternância entre visualizações
- **Passos**:
  1. Acessar dashboard
  2. Alternar entre visualização em cartões e tabela
  3. Verificar se dados são exibidos corretamente
- **Resultado Esperado**: Dados são exibidos corretamente em ambas as visualizações

### 4. Teste de Exportação

#### 4.1 Exportação de Dados
- **Objetivo**: Verificar funcionalidade de exportação
- **Passos**:
  1. Acessar dashboard com dados
  2. Clicar em "Exportar"
  3. Selecionar colunas para exportar
  4. Confirmar exportação
- **Resultado Esperado**: Arquivo Excel é baixado com dados selecionados

### 5. Teste de Performance

#### 5.1 Tempo de Carregamento
- **Objetivo**: Verificar performance do carregamento
- **Passos**:
  1. Acessar dashboard
  2. Medir tempo de carregamento inicial
  3. Medir tempo de recarregamento
- **Resultado Esperado**: Carregamento em menos de 3 segundos

#### 5.2 Carregamento com Muitos Dados
- **Objetivo**: Verificar performance com grande volume de dados
- **Passos**:
  1. Inserir muitos candidatos no banco
  2. Acessar dashboard
  3. Verificar tempo de carregamento
- **Resultado Esperado**: Interface permanece responsiva

### 6. Teste de Responsividade

#### 6.1 Diferentes Resoluções
- **Objetivo**: Verificar responsividade em diferentes telas
- **Passos**:
  1. Acessar dashboard em desktop (1920x1080)
  2. Reduzir para tablet (768x1024)
  3. Reduzir para mobile (375x667)
- **Resultado Esperado**: Interface se adapta corretamente

### 7. Teste de Acessibilidade

#### 7.1 Navegação por Teclado
- **Objetivo**: Verificar acessibilidade por teclado
- **Passos**:
  1. Acessar dashboard
  2. Navegar usando apenas teclado (Tab, Enter, setas)
  3. Verificar se todos os elementos são acessíveis
- **Resultado Esperado**: Todos os elementos são acessíveis por teclado

## Dados de Teste Necessários

### Usuários de Teste
- **Admin**: admin@sispac.com / senha123
- **Usuário**: user@sispac.com / senha123

### Candidatos de Teste
- Pelo menos 10 candidatos com diferentes status
- Diferentes pontuações (0-100)
- Diferentes datas de criação
- Diferentes perfis comportamentais

## Critérios de Sucesso

1. ✅ Dashboard carrega sem erros
2. ✅ Dados são carregados automaticamente
3. ✅ Filtros funcionam corretamente
4. ✅ Busca funciona em tempo real
5. ✅ Ordenação funciona corretamente
6. ✅ Exportação gera arquivo válido
7. ✅ Interface é responsiva
8. ✅ Performance é aceitável (< 3s)
9. ✅ Tratamento de erros é adequado
10. ✅ Acessibilidade é mantida

## Ferramentas de Teste Recomendadas

1. **Playwright** - Para testes automatizados
2. **Chrome DevTools** - Para análise de performance
3. **Lighthouse** - Para auditoria de acessibilidade
4. **Postman** - Para testes de API
5. **Testes Manuais** - Para validação visual

## Próximos Passos

1. Configurar ambiente de teste
2. Criar dados de teste no Supabase
3. Executar testes manuais
4. Implementar testes automatizados
5. Documentar resultados e bugs encontrados
