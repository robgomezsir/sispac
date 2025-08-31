-- =====================================================
-- SISTEMA SISPAC - ESTRUTURA DE BANCO DE DADOS (CORRIGIDO)
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: profiles
-- =====================================================

-- Verificar se a tabela profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Criar tabela profiles se não existir
        CREATE TABLE public.profiles (
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
        
        -- Criar índices
        CREATE INDEX idx_profiles_email ON public.profiles(email);
        CREATE INDEX idx_profiles_role ON public.profiles(role);
        CREATE INDEX idx_profiles_active ON public.profiles(is_active);
        
        RAISE NOTICE 'Tabela profiles criada com sucesso';
    ELSE
        -- Verificar se a coluna is_active existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active') THEN
            -- Adicionar coluna is_active se não existir
            ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_active adicionada à tabela profiles';
        END IF;
        
        -- Verificar se a coluna full_name existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
            -- Adicionar coluna full_name se não existir
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
            RAISE NOTICE 'Coluna full_name adicionada à tabela profiles';
        END IF;
        
        -- Verificar se a coluna role existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
            -- Adicionar coluna role se não existir
            ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'rh';
            RAISE NOTICE 'Coluna role adicionada à tabela profiles';
        END IF;
        
        RAISE NOTICE 'Tabela profiles já existe e foi atualizada';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: candidates
-- =====================================================

-- Verificar se a tabela candidates existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
        -- Criar tabela candidates se não existir
        CREATE TABLE public.candidates (
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
            source TEXT DEFAULT 'manual',
            tags TEXT[],
            priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
        );
        
        -- Criar índices
        CREATE INDEX idx_candidates_email ON public.candidates(email);
        CREATE INDEX idx_candidates_status ON public.candidates(status);
        CREATE INDEX idx_candidates_score ON public.candidates(score);
        CREATE INDEX idx_candidates_created_at ON public.candidates(created_at);
        CREATE INDEX idx_candidates_source ON public.candidates(source);
        CREATE INDEX idx_candidates_priority ON public.candidates(priority);
        CREATE INDEX idx_candidates_answers_gin ON public.candidates USING GIN (answers);
        
        RAISE NOTICE 'Tabela candidates criada com sucesso';
    ELSE
        -- Verificar se a coluna status existe e tem as opções corretas
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'status') THEN
            -- Atualizar constraint de status se necessário
            BEGIN
                ALTER TABLE public.candidates DROP CONSTRAINT IF EXISTS candidates_status_check;
                ALTER TABLE public.candidates ADD CONSTRAINT candidates_status_check 
                    CHECK (status IN ('SUPEROU A EXPECTATIVA', 'ACIMA DA EXPECTATIVA', 'DENTRO DA EXPECTATIVA', 'ABAIXO DA EXPECTATIVA', 'REMOVIDO'));
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Não foi possível atualizar constraint de status: %', SQLERRM;
            END;
        END IF;
        
        RAISE NOTICE 'Tabela candidates já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: results
-- =====================================================

-- Verificar se a tabela results existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'results') THEN
        -- Criar tabela results se não existir
        CREATE TABLE public.results (
            id BIGSERIAL PRIMARY KEY,
            candidate_id BIGINT NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
            question_id INTEGER NOT NULL,
            question_title TEXT NOT NULL,
            selected_answers TEXT[] NOT NULL,
            max_choices INTEGER NOT NULL DEFAULT 5,
            response_time_seconds INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            question_category TEXT,
            question_weight DECIMAL(3,2) DEFAULT 1.00,
            is_correct BOOLEAN,
            score_question DECIMAL(5,2),
            feedback TEXT,
            UNIQUE(candidate_id, question_id)
        );
        
        -- Criar índices
        CREATE INDEX idx_results_candidate_id ON public.results(candidate_id);
        CREATE INDEX idx_results_question_id ON public.results(question_id);
        CREATE INDEX idx_results_created_at ON public.results(created_at);
        CREATE INDEX idx_results_category ON public.results(question_category);
        
        RAISE NOTICE 'Tabela results criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela results já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: questions
-- =====================================================

-- Verificar se a tabela questions existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
        -- Criar tabela questions se não existir
        CREATE TABLE public.questions (
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
        
        -- Criar índices
        CREATE INDEX idx_questions_active ON public.questions(is_active);
        CREATE INDEX idx_questions_order ON public.questions(order_index);
        CREATE INDEX idx_questions_category ON public.questions(category);
        
        RAISE NOTICE 'Tabela questions criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela questions já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: question_answers
-- =====================================================

-- Verificar se a tabela question_answers existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_answers') THEN
        -- Criar tabela question_answers se não existir
        CREATE TABLE public.question_answers (
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
        
        -- Criar índices
        CREATE INDEX idx_question_answers_question_id ON public.question_answers(question_id);
        CREATE INDEX idx_question_answers_active ON public.question_answers(is_active);
        CREATE INDEX idx_question_answers_order ON public.question_answers(order_index);
        
        RAISE NOTICE 'Tabela question_answers criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela question_answers já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: test_sessions
-- =====================================================

-- Verificar se a tabela test_sessions existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_sessions') THEN
        -- Criar tabela test_sessions se não existir
        CREATE TABLE public.test_sessions (
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
        
        -- Criar índices
        CREATE INDEX idx_test_sessions_candidate_id ON public.test_sessions(candidate_id);
        CREATE INDEX idx_test_sessions_token ON public.test_sessions(session_token);
        CREATE INDEX idx_test_sessions_status ON public.test_sessions(status);
        CREATE INDEX idx_test_sessions_expires ON public.test_sessions(expires_at);
        
        RAISE NOTICE 'Tabela test_sessions criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela test_sessions já existe';
    END IF;
END $$;

-- =====================================================
-- VERIFICAR E CRIAR/ATUALIZAR TABELA: audit_logs
-- =====================================================

-- Verificar se a tabela audit_logs existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        -- Criar tabela audit_logs se não existir
        CREATE TABLE public.audit_logs (
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
        
        -- Criar índices
        CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
        CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
        CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
        CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
        
        RAISE NOTICE 'Tabela audit_logs criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela audit_logs já existe';
    END IF;
END $$;

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

-- Criar triggers apenas se as colunas updated_at existirem
DO $$
BEGIN
    -- Trigger para profiles
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para candidates
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
        CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para questions
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
        CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
-- POLÍTICAS RLS CORRIGIDAS (SEM RECURSÃO)
-- =====================================================

-- Habilitar RLS em todas as tabelas
DO $$
BEGIN
    -- Profiles - POLÍTICAS CORRIGIDAS PARA EVITAR RECURSÃO
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas existentes se houver
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        
        -- POLÍTICA CORRIGIDA: Usuários podem ver apenas seu próprio perfil
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
        
        -- POLÍTICA CORRIGIDA: Usuários podem inserir seu próprio perfil
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        
        -- POLÍTICA CORRIGIDA: Usuários podem atualizar seu próprio perfil
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        
        -- POLÍTICA CORRIGIDA: Admins podem ver todos os perfis (SEM RECURSÃO)
        CREATE POLICY "Admins can view all profiles" ON public.profiles
            FOR SELECT USING (
                auth.jwt() ->> 'role' = 'service_role' 
                OR 
                (auth.jwt() ->> 'role' = 'authenticated' AND 
                 EXISTS (
                     SELECT 1 FROM auth.users 
                     WHERE id = auth.uid() 
                     AND raw_user_meta_data ->> 'role' = 'admin'
                 ))
            );
        
        RAISE NOTICE 'Políticas RLS para profiles corrigidas (sem recursão)';
    END IF;
    
    -- Candidates - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
        ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
        DROP POLICY IF EXISTS "Admins can manage candidates" ON public.candidates;
        DROP POLICY IF EXISTS "Everyone can view candidates" ON public.candidates;
        
        -- POLÍTICA SIMPLIFICADA: Todos os usuários autenticados podem ler candidatos
        CREATE POLICY "Everyone can view candidates" ON public.candidates
            FOR SELECT USING (auth.role() = 'authenticated');
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode modificar candidatos
        CREATE POLICY "Service role can manage candidates" ON public.candidates
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para candidates simplificadas';
    END IF;
    
    -- Results - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'results') THEN
        ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Authenticated users can view results" ON public.results;
        DROP POLICY IF EXISTS "Admins can manage results" ON public.results;
        DROP POLICY IF EXISTS "Everyone can view results" ON public.results;
        
        -- POLÍTICA SIMPLIFICADA: Todos os usuários autenticados podem ler resultados
        CREATE POLICY "Everyone can view results" ON public.results
            FOR SELECT USING (auth.role() = 'authenticated');
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode modificar resultados
        CREATE POLICY "Service role can manage results" ON public.results
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para results simplificadas';
    END IF;
    
    -- Questions - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
        ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Everyone can view questions" ON public.questions;
        DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
        
        -- POLÍTICA SIMPLIFICADA: Todos podem ler questões
        CREATE POLICY "Everyone can view questions" ON public.questions
            FOR SELECT USING (true);
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode modificar questões
        CREATE POLICY "Service role can manage questions" ON public.questions
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para questions simplificadas';
    END IF;
    
    -- Question answers - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_answers') THEN
        ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Everyone can view question answers" ON public.question_answers;
        DROP POLICY IF EXISTS "Admins can manage question answers" ON public.question_answers;
        
        -- POLÍTICA SIMPLIFICADA: Todos podem ler respostas
        CREATE POLICY "Everyone can view question answers" ON public.question_answers
            FOR SELECT USING (true);
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode modificar respostas
        CREATE POLICY "Service role can manage question answers" ON public.question_answers
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para question_answers simplificadas';
    END IF;
    
    -- Test sessions - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_sessions') THEN
        ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own test sessions" ON public.test_sessions;
        DROP POLICY IF EXISTS "Admins can view all test sessions" ON public.test_sessions;
        DROP POLICY IF EXISTS "Everyone can view test sessions" ON public.test_sessions;
        
        -- POLÍTICA SIMPLIFICADA: Todos os usuários autenticados podem ler sessões
        CREATE POLICY "Everyone can view test sessions" ON public.test_sessions
            FOR SELECT USING (auth.role() = 'authenticated');
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode modificar sessões
        CREATE POLICY "Service role can manage test sessions" ON public.test_sessions
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para test_sessions simplificadas';
    END IF;
    
    -- Audit logs - POLÍTICAS SIMPLIFICADAS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
        DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;
        
        -- POLÍTICA SIMPLIFICADA: Apenas service_role pode acessar logs de auditoria
        CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
            FOR ALL USING (auth.role() = 'service_role');
        
        RAISE NOTICE 'Políticas RLS para audit_logs simplificadas';
    END IF;
END $$;

-- =====================================================
-- DADOS INICIAIS (apenas se as tabelas estiverem vazias)
-- =====================================================

-- Inserir questões padrão apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.questions LIMIT 1) THEN
        INSERT INTO public.questions (id, title, max_choices, columns, category, weight, order_index) VALUES
        (1, 'Como você acha que as pessoas te vêem? (assinale apenas 5 características)', 5, 3, 'percepção', 1.00, 1),
        (2, 'E você, como se vê? (assinale apenas 5 características)', 5, 3, 'autopercepção', 1.00, 2),
        (3, 'Pense em toda sua vida até aqui e curta apenas as 05 frases mais importantes para você', 5, 2, 'valores', 1.00, 3),
        (4, 'Quais os valores que você considera mais importantes? (assinale apenas 5 características)', 5, 2, 'valores', 1.00, 4),
        (5, 'Quais as características que você considera mais importantes em um líder? (assinale apenas 5 características)', 5, 2, 'liderança', 1.00, 5);
        
        RAISE NOTICE 'Questões padrão inseridas com sucesso';
    ELSE
        RAISE NOTICE 'Tabela questions já contém dados';
    END IF;
END $$;

-- Inserir respostas padrão apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.question_answers LIMIT 1) THEN
        -- Inserir respostas para a questão 1
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
        (1, 'VAIDOSA', 'vaidosa', false, 1.00, 36);
        
        -- Inserir respostas para a questão 2 (mesmas opções da questão 1)
        INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index)
        SELECT 2, answer_text, answer_value, is_correct, weight, order_index
        FROM public.question_answers WHERE question_id = 1;
        
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
        (3, 'Não minto para as pessoas.', 'veracidade', false, 1.00, 13);
        
        -- Inserir respostas para a questão 4
        INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
        (4, 'Trabalhar com Amor', 'trabalhar_amor', false, 1.00, 1),
        (4, 'cuidar/importar-se', 'cuidar_importar', false, 1.00, 2),
        (4, 'excelência em servir', 'excelencia_servir', false, 1.00, 3);
        
        -- Inserir respostas para a questão 5
        INSERT INTO public.question_answers (question_id, answer_text, answer_value, is_correct, weight, order_index) VALUES
        (5, 'Liderança', 'lideranca', false, 1.00, 1),
        (5, 'Comunicação', 'comunicacao', false, 1.00, 2),
        (5, 'Empatia', 'empatia', false, 1.00, 3),
        (5, 'Visão Estratégica', 'visao_estrategica', false, 1.00, 4),
        (5, 'Integridade', 'integridade', false, 1.00, 5),
        (5, 'Capacidade de Decisão', 'capacidade_decisao', false, 1.00, 6),
        (5, 'Mentoria', 'mentoria', false, 1.00, 7),
        (5, 'Inovação', 'inovacao', false, 1.00, 8);
        
        RAISE NOTICE 'Respostas padrão inseridas com sucesso';
    ELSE
        RAISE NOTICE 'Tabela question_answers já contém dados';
    END IF;
END $$;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        COMMENT ON TABLE public.profiles IS 'Tabela de usuários do sistema com diferentes níveis de acesso';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
        COMMENT ON TABLE public.candidates IS 'Tabela de candidatos que realizaram testes comportamentais';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'results') THEN
        COMMENT ON TABLE public.results IS 'Resultados detalhados de cada questão respondida pelos candidatos';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
        COMMENT ON TABLE public.questions IS 'Configuração das questões do teste comportamental';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_answers') THEN
        COMMENT ON TABLE public.question_answers IS 'Respostas possíveis para cada questão';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test_sessions') THEN
        COMMENT ON TABLE public.test_sessions IS 'Sessões de teste para controle de progresso e tempo';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        COMMENT ON TABLE public.audit_logs IS 'Log de auditoria para todas as operações do sistema';
    END IF;
END $$;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SISTEMA SISPAC - ESTRUTURA DE BANCO CONFIGURADA!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Todas as tabelas foram criadas/atualizadas com sucesso.';
    RAISE NOTICE 'Políticas RLS CORRIGIDAS (sem recursão infinita).';
    RAISE NOTICE 'Dados iniciais inseridos (se necessário).';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
