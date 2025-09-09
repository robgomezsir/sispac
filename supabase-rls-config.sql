-- =====================================================
-- CONFIGURAÇÃO RLS (Row Level Security) - Supabase
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. HABILITAR RLS na tabela candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICA para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados" ON candidates
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. CRIAR POLÍTICA para permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados" ON candidates
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. CRIAR POLÍTICA para permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON candidates
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. CRIAR POLÍTICA para permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados" ON candidates
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. CRIAR POLÍTICA para permitir operações para service_role (backend)
CREATE POLICY "Permitir todas as operações para service_role" ON candidates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. CRIAR POLÍTICA para permitir operações para anon (se necessário)
CREATE POLICY "Permitir operações para anon" ON candidates
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 8. VERIFICAR se a tabela profiles existe e configurar RLS
-- (Execute apenas se a tabela profiles existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Habilitar RLS na tabela profiles
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Política para profiles
        CREATE POLICY "Permitir operações para usuários autenticados" ON profiles
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
            
        -- Política para service_role
        CREATE POLICY "Permitir operações para service_role" ON profiles
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 9. VERIFICAR configurações
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
WHERE tablename IN ('candidates', 'profiles')
ORDER BY tablename, policyname;

-- 10. VERIFICAR se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('candidates', 'profiles');
