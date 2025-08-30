// Configuração das rotas de autenticação
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  REQUEST_RESET: "/request-reset",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
};

// URLs de redirecionamento para o Supabase
export const SUPABASE_REDIRECT_URLS = {
  RESET_PASSWORD: `${window.location.origin}/reset-password`,
  LOGIN: `${window.location.origin}/login`,
};

// Configurações de validação de senha
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 6,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: false,
  REQUIRE_NUMBERS: false,
  REQUIRE_SPECIAL_CHARS: false,
};

// Mensagens de erro personalizadas
export const ERROR_MESSAGES = {
  INVALID_EMAIL: "❌ Email inválido",
  PASSWORD_MISMATCH: "❌ As senhas não coincidem",
  PASSWORD_TOO_SHORT: "❌ A senha deve ter pelo menos 6 caracteres",
  USER_NOT_FOUND: "❌ Usuário não encontrado",
  LINK_EXPIRED: "❌ Link inválido ou expirado",
  RESET_SUCCESS: "✅ Senha redefinida com sucesso!",
  EMAIL_SENT: "✅ Email de redefinição enviado! Verifique sua caixa de entrada.",
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 3600, // 1 hora
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutos
  PASSWORD_HISTORY_SIZE: 3,
  REQUIRE_PASSWORD_CHANGE: 90, // 90 dias
};

// Configurações de cache
export const CACHE_CONFIG = {
  AUTH_TOKEN_TTL: 3600, // 1 hora
  USER_PROFILE_TTL: 1800, // 30 minutos
  ROLE_CACHE_TTL: 300, // 5 minutos
  MAX_CACHE_SIZE: 100,
};

// Configurações de logging
export const LOGGING_CONFIG = {
  ENABLE_AUTH_LOGS: true,
  ENABLE_PERFORMANCE_LOGS: import.meta.env.DEV,
  ENABLE_ERROR_LOGS: true,
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
};
