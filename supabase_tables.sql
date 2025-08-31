-- =====================================================
-- SISTEMA SISPAC - ESTRUTURA DE BANCO DE DADOS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: profiles (Usuários do Sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'rh' CHECK (role IN ('admin', 'rh', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone TEXT,
    department TEXT,
    position TEXT
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- =====================================================
-- TABELA: candidates (Candidatos de Teste)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.candidates (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    status TEXT NOT NULL DEFAULT 'DENTRO DA EXPECTATIVA' 
        CHECK (status IN (
            'SUPEROU A EXPECTATIVA',
            'ACIMA DA EXPECTATIVA', 
            'DENTRO DA EXPECTATIVA',
            'ABAIXO DA EXPECTATIVA',
            'REMOVIDO'
        )),
    answers JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    test_duration_minutes INTEGER,
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    source TEXT DEFAULT 'manual', -- 'manual', 'form', 'import'
    tags TEXT[],
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Índices para candidates
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON public.candidates(score);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_priority ON public.candidates(priority);

-- Índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_candidates_answers_gin ON public.candidates USING GIN (answers);

-- =====================================================
-- TABELA: results (Resultados Detalhados dos Testes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.results (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_title TEXT NOT NULL,
    selected_answers TEXT[] NOT NULL,
    max_choices INTEGER NOT NULL DEFAULT 5,
    response_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados da questão
    question_category TEXT,
    question_weight DECIMAL(3,2) DEFAULT 1.00,
    
    -- Análise da resposta
    is_correct BOOLEAN,
    score_question DECIMAL(5,2),
    feedback TEXT,
    
    UNIQUE(candidate_id, question_id)
);

-- Índices para results
CREATE INDEX IF NOT EXISTS idx_results_candidate_id ON public.results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_results_question_id ON public.results(question_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON public.results(created_at);
CREATE INDEX IF NOT EXISTS idx_results_category ON public.results(question_category);

-- =====================================================
-- TABELA: questions (Configuração das Questões)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    max_choices INTEGER NOT NULL DEFAULT 5,
    columns INTEGER NOT NULL DEFAULT 3,
    category TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para questions
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);

-- =====================================================
-- TABELA: question_answers (Respostas Possíveis)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.question_answers (
    id BIGSERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    weight DECIMAL(3,2) DEFAULT 1.00,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(question_id, answer_text)
);

-- Índices para question_answers
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_active ON public.question_answers(is_active);
CREATE INDEX IF NOT EXISTS idx_question_answers_order ON public.question_answers(order_index);

-- =====================================================
-- TABELA: test_sessions (Sessões de Teste)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id BIGINT REFERENCES public.candidates(id) ON DELETE SET NULL,
    session_token TEXT UNIQUE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'completed', 'expired', 'abandoned')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para test_sessions
CREATE INDEX IF NOT EXISTS idx_test_sessions_candidate_id ON public.test_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_token ON public.test_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON public.test_sessions(status);
CREATE INDEX IF NOT EXISTS idx_test_sessions_expires ON public.test_sessions(expires_at);

-- =====================================================
-- TABELA: audit_logs (Log de Auditoria)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular score automático baseado nas respostas
CREATE OR REPLACE FUNCTION calculate_candidate_score(candidate_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    question_count INTEGER := 0;
BEGIN
    SELECT 
        COALESCE(SUM(COALESCE(score_question, 0)), 0),
        COUNT(*)
    INTO total_score, question_count
    FROM public.results 
    WHERE candidate_id = $1;
    
    IF question_count > 0 THEN
        RETURN ROUND((total_score / question_count) * 100);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para determinar status baseado no score
CREATE OR REPLACE FUNCTION determine_candidate_status(score INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN score >= 95 THEN 'SUPEROU A EXPECTATIVA'
        WHEN score >= 76 THEN 'ACIMA DA EXPECTATIVA'
        WHEN score >= 68 THEN 'DENTRO DA EXPECTATIVA'
        ELSE 'ABAIXO DA EXPECTATIVA'
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para profiles (usuários podem ver apenas seu próprio perfil, admins podem ver todos)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para candidates (todos os usuários autenticados podem ler, admins podem modificar)
CREATE POLICY "Authenticated users can view candidates" ON public.candidates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage candidates" ON public.candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para results (usuários podem ver resultados de candidatos, admins podem modificar)
CREATE POLICY "Authenticated users can view results" ON public.results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage results" ON public.results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para questions (todos podem ler, admins podem modificar)
CREATE POLICY "Everyone can view questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para question_answers (todos podem ler, admins podem modificar)
CREATE POLICY "Everyone can view question answers" ON public.question_answers
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage question answers" ON public.question_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para test_sessions (usuários podem ver suas próprias sessões, admins podem ver todas)
CREATE POLICY "Users can view own test sessions" ON public.test_sessions
    FOR SELECT USING (auth.uid()::text = candidate_id::text);

CREATE POLICY "Admins can view all test sessions" ON public.test_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para audit_logs (apenas admins podem ver)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir questões padrão
INSERT INTO public.questions (id, title, max_choices, columns, category, weight, order_index) VALUES
(1, 'Como você acha que as pessoas te vêem? (assinale apenas 5 características)', 5, 3, 'percepção', 1.00, 1),
(2, 'E você, como se vê? (assinale apenas 5 características)', 5, 3, 'autopercepção', 1.00, 2),
(3, 'Pense em toda sua vida até aqui e curta apenas as 05 frases mais importantes para você', 5, 2, 'valores', 1.00, 3),
(4, 'Quais os valores que você considera mais importantes? (assinale apenas 5 características)', 5, 2, 'valores', 1.00, 4),
(5, 'Quais as características que você considera mais importantes em um líder? (assinale apenas 5 características)', 5, 2, 'liderança', 1.00, 5)
ON CONFLICT (id) DO NOTHING;

-- Inserir respostas padrão para a questão 1
INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
(1, 'RECEPTIVA', 'receptiva', false, 1.00, 1),
(1, 'DETALHISTA', 'detalhista', false, 1.00, 2),
(1, 'DEDICADA', 'dedicada', false, 1.00, 3),
(1, 'COMUNICATIVA', 'comunicativa', false, 1.00, 4),
(1, 'PRESTATIVA', 'prestativa', false, 1.00, 5),
(1, 'RESPONSÁVEL', 'responsavel', false, 1.00, 6),
(1, 'FELIZ', 'feliz', false, 1.00, 7),
(1, 'PERFECCIONISTA', 'perfeccionista', false, 1.00, 8),
(1, 'EDUCADA', 'educada', false, 1.00, 9),
(1, 'COERENTE', 'coerente', false, 1.00, 10),
(1, 'LÍDER', 'lider', false, 1.00, 11),
(1, 'GOSTA DE GENTE', 'gosta_de_gente', false, 1.00, 12),
(1, 'ESTUDIOSA', 'estudiosa', false, 1.00, 13),
(1, 'VERDADEIRA', 'verdadeira', false, 1.00, 14),
(1, 'AMOROSA', 'amorosa', false, 1.00, 15),
(1, 'ORGANIZADA', 'organizada', false, 1.00, 16),
(1, 'RESPEITADORA', 'respeitadora', false, 1.00, 17),
(1, 'DESCOLADA', 'descolada', false, 1.00, 18),
(1, 'SENSATA', 'sensata', false, 1.00, 19),
(1, 'CONFIANTE', 'confiante', false, 1.00, 20),
(1, 'GENTIL', 'gentil', false, 1.00, 21),
(1, 'PRATICA', 'pratica', false, 1.00, 22),
(1, 'PROATIVA', 'proativa', false, 1.00, 23),
(1, 'SÉRIA', 'seria', false, 1.00, 24),
(1, 'REALISTA', 'realista', false, 1.00, 25),
(1, 'INTELIGENTE', 'inteligente', false, 1.00, 26),
(1, 'RIGIDA', 'rigida', false, 1.00, 27),
(1, 'BOM HUMOR', 'bom_humor', false, 1.00, 28),
(1, 'ESFORÇADA', 'esforcada', false, 1.00, 29),
(1, 'ENGRAÇADA', 'engracada', false, 1.00, 30),
(1, 'RACIONAL', 'racional', false, 1.00, 31),
(1, 'GENEROSA', 'generosa', false, 1.00, 32),
(1, 'PACIENTE', 'paciente', false, 1.00, 33),
(1, 'TÍMIDA', 'timida', false, 1.00, 34),
(1, 'SENSÍVEL', 'sensivel', false, 1.00, 35),
(1, 'VAIDOSA', 'vaidosa', false, 1.00, 36)
ON CONFLICT (question_id, answer_text) DO NOTHING;

-- Inserir respostas padrão para a questão 2 (mesmas opções da questão 1)
INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index)
SELECT 2, answer_text, answer_value, is_correct, weight, order_index
FROM public.question_answers WHERE question_id = 1
ON CONFLICT (question_id, answer_text) DO NOTHING;

-- Inserir respostas para a questão 3
INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
(3, 'Sempre que alguma pessoa me procura para contar os problemas eu escuto e ajudo.', 'ajuda_problemas', false, 1.00, 1),
(3, 'Meus amigos/familiares podem contar comigo em momentos alegres e tristes.', 'suporte_familia', false, 1.00, 2),
(3, 'Se vejo uma pessoa derrubando a carteira de dinheiro sem perceber, eu aviso.', 'honestidade', false, 1.00, 3),
(3, 'Sempre vou aos compromissos que combinei (se não tiver nenhum problema maior).', 'compromisso', false, 1.00, 4),
(3, 'Ajudo as pessoas que precisam de mim.', 'ajuda_pessoas', false, 1.00, 5),
(3, 'Consigo entender como os outros se sentem.', 'empatia', false, 1.00, 6),
(3, 'Minha família é o mais importante para mim.', 'familia_importante', false, 1.00, 7),
(3, 'Sou fiel a tudo que eu acredito.', 'fidelidade_valores', false, 1.00, 8),
(3, 'Sei reconhecer quando estou errada.', 'autocritica', false, 1.00, 9),
(3, 'Quando preciso resolver algum problema, tento tomar a melhor decisão pensando em todos os envolvidos.', 'decisao_coletiva', false, 1.00, 10),
(3, 'Mesmo com muitas dificuldades eu não desisto fácil.', 'persistencia', false, 1.00, 11),
(3, 'Respeito a opinião/ponto de vista das outras pessoas.', 'respeito_opinioes', false, 1.00, 12),
(3, 'Não minto para as pessoas.', 'veracidade', false, 1.00, 13)
ON CONFLICT (question_id, answer_text) DO NOTHING;

-- Inserir respostas para a questão 4
INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
(4, 'Trabalhar com Amor', 'trabalhar_amor', false, 1.00, 1),
(4, 'cuidar/importar-se', 'cuidar_importar', false, 1.00, 2),
(4, 'excelência em servir', 'excelencia_servir', false, 1.00, 3)
ON CONFLICT (question_id, answer_text) DO NOTHING;

-- Inserir respostas para a questão 5
INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
(5, 'Liderança', 'lideranca', false, 1.00, 1),
(5, 'Comunicação', 'comunicacao', false, 1.00, 2),
(5, 'Empatia', 'empatia', false, 1.00, 3),
(5, 'Visão Estratégica', 'visao_estrategica', false, 1.00, 4),
(5, 'Integridade', 'integridade', false, 1.00, 5),
(5, 'Capacidade de Decisão', 'capacidade_decisao', false, 1.00, 6),
(5, 'Mentoria', 'mentoria', false, 1.00, 7),
(5, 'Inovação', 'inovacao', false, 1.00, 8)
ON CONFLICT (question_id, answer_text) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Tabela de usuários do sistema com diferentes níveis de acesso';
COMMENT ON TABLE public.candidates IS 'Tabela de candidatos que realizaram testes comportamentais';
COMMENT ON TABLE public.results IS 'Resultados detalhados de cada questão respondida pelos candidatos';
COMMENT ON TABLE public.questions IS 'Configuração das questões do teste comportamental';
COMMENT ON TABLE public.question_answers IS 'Respostas possíveis para cada questão';
COMMENT ON TABLE public.test_sessions IS 'Sessões de teste para controle de progresso e tempo';
COMMENT ON TABLE public.audit_logs IS 'Log de auditoria para todas as operações do sistema';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
