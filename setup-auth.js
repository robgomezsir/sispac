// Script para configurar autenticação no Supabase
// Execute este script no painel do Supabase SQL Editor

// 1. Habilitar autenticação por email/senha (se não estiver habilitada)
-- Verificar se auth.users existe
SELECT * FROM auth.users LIMIT 1;

-- 2. Criar usuário de teste (execute no painel do Supabase)
-- Vá para Authentication > Users > Add User
-- Email: robgomez.sir@gmail.com
-- Password: admin1630

-- 3. Verificar se o usuário foi criado
SELECT * FROM auth.users WHERE email = 'robgomez.sir@gmail.com';

-- 4. Se necessário, criar perfil do usuário
INSERT INTO public.profiles (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'robgomez.sir@gmail.com'),
  'robgomez.sir@gmail.com',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
