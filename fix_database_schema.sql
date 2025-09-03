-- =====================================================
-- CORREÇÃO COMPLETA DO SCHEMA DO BANCO DE DADOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR E CORRIGIR TABELA PROFILES
-- =====================================================

-- Verificar se a tabela profiles existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Criar tabela profiles se não existir
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'rh' CHECK (role IN ('admin', 'rh', 'user')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
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
        -- Verificar e adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
            RAISE NOTICE 'Coluna full_name adicionada à tabela profiles';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active') THEN
            ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_active adicionada à tabela profiles';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
            ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'rh';
            RAISE NOTICE 'Coluna role adicionada à tabela profiles';
        END IF;
        
        RAISE NOTICE 'Tabela profiles verificada e atualizada';
    END IF;
END $$;

-- 2. VERIFICAR E CORRIGIR TABELA CANDIDATES
-- =====================================================

-- Verificar se a tabela candidates existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
        -- Criar tabela candidates se não existir
        CREATE TABLE public.candidates (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
            status TEXT NOT NULL DEFAULT 'PENDENTE_TESTE' 
                CHECK (status IN (
                    'PENDENTE_TESTE',
                    'SUPEROU A EXPECTATIVA',
                    'ACIMA DA EXPECTATIVA', 
                    'DENTRO DA EXPECTATIVA',
                    'ABAIXO DA EXPECTATIVA',
                    'REMOVIDO'
                )),
            answers JSONB NOT NULL DEFAULT '{}',
            access_token TEXT,
            token_created_at TIMESTAMP WITH TIME ZONE,
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
        CREATE INDEX idx_candidates_access_token ON public.candidates(access_token);
        CREATE INDEX idx_candidates_answers_gin ON public.candidates USING GIN (answers);
        
        RAISE NOTICE 'Tabela candidates criada com sucesso';
    ELSE
        -- Verificar e adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'access_token') THEN
            ALTER TABLE public.candidates ADD COLUMN access_token TEXT;
            CREATE INDEX idx_candidates_access_token ON public.candidates(access_token);
            RAISE NOTICE 'Coluna access_token adicionada à tabela candidates';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'token_created_at') THEN
            ALTER TABLE public.candidates ADD COLUMN token_created_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Coluna token_created_at adicionada à tabela candidates';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'status') THEN
            ALTER TABLE public.candidates ADD COLUMN status TEXT DEFAULT 'PENDENTE_TESTE';
            RAISE NOTICE 'Coluna status adicionada à tabela candidates';
        END IF;
        
        RAISE NOTICE 'Tabela candidates verificada e atualizada';
    END IF;
END $$;

-- 3. CORRIGIR POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Criar políticas corretas
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. CORRIGIR POLÍTICAS RLS PARA CANDIDATES
-- =====================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Service role can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Everyone can view candidates" ON public.candidates;

-- Criar políticas corretas
CREATE POLICY "Service role can manage candidates" ON public.candidates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view candidates" ON public.candidates
    FOR SELECT USING (auth.role() = 'authenticated');

-- 5. HABILITAR RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela candidates
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'candidates'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'candidates')
ORDER BY tablename, policyname;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SCHEMA DO BANCO DE DADOS CORRIGIDO COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tabelas verificadas e atualizadas:';
    RAISE NOTICE '- profiles (com colunas full_name, role, is_active)';
    RAISE NOTICE '- candidates (com colunas access_token, token_created_at)';
    RAISE NOTICE 'Políticas RLS corrigidas para ambas as tabelas';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
