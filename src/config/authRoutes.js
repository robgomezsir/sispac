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
