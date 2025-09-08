# PRD - SisPAC (Sistema de Perfil de Avaliação Comportamental)

## 📋 **1. VISÃO GERAL DO PRODUTO**

### **1.1 Nome do Produto**
SisPAC - Sistema de Perfil de Avaliação Comportamental

### **1.2 Descrição**
O SisPAC é uma aplicação web progressiva (PWA) desenvolvida para avaliação comportamental de candidatos através de um questionário estruturado. O sistema utiliza um algoritmo de pontuação baseado em pesos específicos para classificar candidatos em diferentes níveis de adequação, oferecendo uma solução completa para recrutamento e seleção de pessoal.

### **1.3 Objetivos**
- Automatizar o processo de avaliação comportamental de candidatos
- Fornecer classificação objetiva baseada em valores e características pessoais
- Integrar com plataformas de recrutamento (Gupy)
- Gerar relatórios e análises detalhadas dos resultados
- Oferecer interface moderna e responsiva para diferentes dispositivos

### **1.4 Público-Alvo**
- **Primário**: Departamentos de Recursos Humanos
- **Secundário**: Gestores de recrutamento e seleção
- **Terciário**: Candidatos a vagas de emprego

---

## 🎯 **2. FUNCIONALIDADES PRINCIPAIS**

### **2.1 Sistema de Avaliação Comportamental**

#### **2.1.1 Questionário Estruturado**
- **4 Questões principais** com sistema de pontuação ponderada
- **Questão 1**: "Como você acha que as pessoas te veem?" (5 características)
- **Questão 2**: "E você, como se vê?" (5 características)
- **Questão 3**: "Frases de vida" (5 frases mais importantes)
- **Questão 4**: "Valores importantes" (5 valores prioritários)

#### **2.1.2 Sistema de Pontuação**
- **Algoritmo baseado em pesos específicos** para cada resposta
- **Características**: Pesos de 1-3 pontos
- **Frases de vida**: Pesos de 3-5 pontos
- **Valores**: Pesos de 7-9 pontos
- **Pontuação máxima**: 100 pontos

#### **2.1.3 Classificação de Status**
| Status | Pontuação | Descrição |
|--------|-----------|-----------|
| **ABAIXO DA EXPECTATIVA** | ≤ 67 | Candidato precisa desenvolver valores e características |
| **DENTRO DA EXPECTATIVA** | 68-75 | Candidato atende aos requisitos básicos |
| **ACIMA DA EXPECTATIVA** | 76-95 | Candidato demonstra valores fortes |
| **SUPEROU A EXPECTATIVA** | 96-100 | Candidato excepcional |

### **2.2 Gestão de Candidatos**

#### **2.2.1 Dashboard Principal**
- Visualização em cards ou tabela
- Estatísticas em tempo real
- Filtros avançados (status, pontuação, data)
- Busca por texto
- Ordenação por diferentes critérios

#### **2.2.2 Relatórios e Exportação**
- Exportação para Excel (.xlsx)
- Seleção de colunas personalizada
- Análise de perfil comportamental
- Relatórios detalhados por candidato

#### **2.2.3 Gestão de Dados**
- Visualização de respostas individuais
- Histórico de avaliações
- Remoção de candidatos
- Auditoria de operações

### **2.3 Sistema de Autenticação e Autorização**

#### **2.3.1 Níveis de Acesso**
- **Admin**: Acesso completo ao sistema
- **RH**: Gestão de candidatos e relatórios
- **User**: Visualização básica

#### **2.3.2 Funcionalidades por Role**
- **Admin**: Todas as funcionalidades + configurações + API
- **RH**: Dashboard + candidatos + relatórios + configurações básicas
- **User**: Visualização de dados

### **2.4 Integração com Gupy**

#### **2.4.1 Webhook de Integração**
- Recebimento automático de candidatos
- Geração de tokens únicos
- Sincronização de dados
- Validação de tokens

#### **2.4.2 Fluxo de Integração**
1. Candidato se inscreve na Gupy
2. Webhook envia dados para SisPAC
3. Sistema gera token único
4. Candidato recebe link personalizado
5. Teste é realizado e resultados salvos
6. Dados são sincronizados automaticamente

### **2.5 Progressive Web App (PWA)**

#### **2.5.1 Funcionalidades PWA**
- Instalação no dispositivo
- Funcionamento offline
- Notificações push (estrutura implementada)
- Cache inteligente
- Atualizações automáticas

#### **2.5.2 Experiência Mobile**
- Interface responsiva
- Touch-friendly
- Performance otimizada
- Instalação via navegador

---

## 🏗️ **3. ARQUITETURA TÉCNICA**

### **3.1 Stack Tecnológico**

#### **3.1.1 Frontend**
- **React 18.3.1** - Biblioteca principal
- **Vite 5.4.6** - Build tool e dev server
- **Tailwind CSS 3.4.10** - Framework CSS
- **React Router DOM 6.26.2** - Roteamento
- **Lucide React** - Ícones

#### **3.1.2 Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança
- **Serverless Functions** - APIs

#### **3.1.3 Infraestrutura**
- **Vercel** - Deploy e hospedagem
- **CDN Global** - Distribuição de conteúdo
- **SSL/TLS** - Segurança de dados

### **3.2 Estrutura de Dados**

#### **3.2.1 Tabelas Principais**
- **`profiles`** - Usuários do sistema
- **`candidates`** - Candidatos e resultados
- **`results`** - Respostas detalhadas
- **`questions`** - Configuração das questões
- **`question_answers`** - Opções de resposta
- **`test_sessions`** - Sessões ativas
- **`audit_logs`** - Log de auditoria

#### **3.2.2 Relacionamentos**
- Candidatos → Resultados (1:N)
- Questões → Respostas (1:N)
- Usuários → Candidatos (1:N)
- Sessões → Candidatos (1:1)

---

## 📱 **4. INTERFACE E EXPERIÊNCIA DO USUÁRIO**

### **4.1 Design System**

#### **4.1.1 Paleta de Cores**
- **Primária**: Azul moderno
- **Secundária**: Tons de cinza
- **Status**: Verde (sucesso), Amarelo (atenção), Vermelho (erro)
- **Background**: Gradientes suaves

#### **4.1.2 Componentes**
- Cards modernos com sombras
- Botões com estados interativos
- Modais responsivos
- Filtros avançados
- Tabelas com ordenação

### **4.2 Navegação**

#### **4.2.1 Estrutura de Menu**
- **Dashboard** - Visão geral dos candidatos
- **Formulário** - Questionário de avaliação
- **Configurações** - Gestão de usuários e sistema
- **API Panel** - Documentação e testes (Admin)
- **Integração Gupy** - Configuração de webhooks (Admin)

#### **4.2.2 Responsividade**
- Sidebar colapsível em mobile
- Menu hambúrguer
- Cards adaptáveis
- Tabelas com scroll horizontal

### **4.3 Fluxos de Usuário**

#### **4.3.1 Fluxo do Candidato**
1. Acesso via link único
2. Validação de token
3. Preenchimento do questionário
4. Visualização de resultados
5. Confirmação de envio

#### **4.3.2 Fluxo do RH**
1. Login no sistema
2. Acesso ao dashboard
3. Visualização de candidatos
4. Aplicação de filtros
5. Geração de relatórios
6. Exportação de dados

---

## 🔒 **5. SEGURANÇA E COMPLIANCE**

### **5.1 Autenticação e Autorização**

#### **5.1.1 Supabase Auth**
- Autenticação via email/senha
- Tokens JWT seguros
- Refresh automático de tokens
- Logout seguro

#### **5.1.2 Row Level Security (RLS)**
- Políticas de acesso por tabela
- Isolamento de dados por usuário
- Controle de permissões granular
- Auditoria de acessos

### **5.2 Proteção de Dados**

#### **5.2.1 Criptografia**
- Dados em trânsito (HTTPS)
- Dados em repouso (AES-256)
- Tokens seguros
- Chaves de API protegidas

#### **5.2.2 Validação**
- Validação de entrada
- Sanitização de dados
- Rate limiting
- CORS configurado

---

## 📊 **6. MÉTRICAS E ANALYTICS**

### **6.1 Métricas de Negócio**

#### **6.1.1 KPIs Principais**
- Total de candidatos avaliados
- Distribuição por status
- Taxa de conclusão de testes
- Tempo médio de avaliação

#### **6.1.2 Relatórios Disponíveis**
- Relatório de candidatos por período
- Análise de distribuição de scores
- Relatório de perfis comportamentais
- Exportação de dados completos

### **6.2 Métricas Técnicas**

#### **6.2.1 Performance**
- Tempo de carregamento < 2s
- Uptime > 99.9%
- Tempo de resposta da API < 500ms
- Cache hit rate > 80%

#### **6.2.2 Usabilidade**
- Taxa de conclusão de testes > 90%
- Tempo médio de preenchimento < 15min
- Taxa de erro < 1%
- Satisfação do usuário > 4.5/5

---

## 🚀 **7. ROADMAP E EVOLUÇÃO**

### **7.1 Funcionalidades Atuais (v1.0)**
- ✅ Sistema de avaliação comportamental
- ✅ Dashboard de candidatos
- ✅ Integração com Gupy
- ✅ PWA funcional
- ✅ Sistema de autenticação
- ✅ Relatórios e exportação

### **7.2 Próximas Versões**

#### **7.2.1 v1.1 - Melhorias de UX**
- Notificações push
- Temas personalizáveis
- Atalhos de teclado
- Modo escuro

#### **7.2.2 v1.2 - Analytics Avançados**
- Dashboard de métricas
- Gráficos interativos
- Comparação de candidatos
- Análise de tendências

#### **7.2.3 v1.3 - Integrações Adicionais**
- Integração com LinkedIn
- API pública
- Webhooks customizados
- Integração com ATS

### **7.3 Funcionalidades Futuras**
- IA para análise de perfil
- Recomendações automáticas
- Chatbot para suporte
- Mobile app nativo

---

## 🎯 **8. CRITÉRIOS DE SUCESSO**

### **8.1 Métricas de Adoção**
- 100+ candidatos avaliados/mês
- 10+ empresas utilizando
- 95%+ taxa de satisfação
- 90%+ taxa de conclusão de testes

### **8.2 Métricas Técnicas**
- 99.9% uptime
- < 2s tempo de carregamento
- 0 vulnerabilidades críticas
- 100% cobertura de testes

### **8.3 Métricas de Negócio**
- Redução de 50% no tempo de triagem
- Aumento de 30% na qualidade das contratações
- ROI positivo em 6 meses
- Escalabilidade para 1000+ usuários

---

## 📞 **9. SUPORTE E MANUTENÇÃO**

### **9.1 Suporte Técnico**
- Documentação completa
- Guias de integração
- Suporte via email
- Base de conhecimento

### **9.2 Manutenção**
- Atualizações mensais
- Correções de bugs
- Melhorias de performance
- Backup automático

### **9.3 Monitoramento**
- Logs centralizados
- Alertas automáticos
- Métricas em tempo real
- Health checks

---

## 📋 **10. CONCLUSÃO**

O SisPAC representa uma solução completa e moderna para avaliação comportamental de candidatos, combinando tecnologia avançada com interface intuitiva. O sistema está preparado para escalar e evoluir conforme as necessidades do mercado, oferecendo valor real para departamentos de RH e empresas de recrutamento.

**Data de Criação**: 31 de Agosto de 2024  
**Versão do Documento**: 1.0  
**Status**: Ativo  
**Próxima Revisão**: 30 de Setembro de 2024
