import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Shield, 
  Lock, 
  User, 
  Mail,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

export default function AuthCallback() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [inviteData, setInviteData] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creatingPassword, setCreatingPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { finalizeInvite } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtém os parâmetros da URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const type = searchParams.get('type');

        console.log('🔍 [AuthCallback] Parâmetros:', { 
          accessToken: accessToken ? '***' : null, 
          refreshToken: refreshToken ? '***' : null, 
          type, 
          error 
        });

        // Se não há tokens e estamos em /welcome, redirecionar para login
        if (!accessToken && !refreshToken) {
          navigate('/', { replace: true });
          return;
        }

        if (error) {
          setMessage(`❌ Erro: ${errorDescription || error}`);
          setLoading(false);
          return;
        }

        if (accessToken && refreshToken) {
          // Para convites, NÃO definimos a sessão automaticamente
          // Apenas verificamos se é um convite válido
          if (type === 'invite' || type === 'signup' || !type) {
            console.log('🔍 [AuthCallback] Processando convite...');
            
            // Verifica se o token é válido sem definir a sessão
            const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
            
            if (userError || !userData.user) {
              console.log('❌ [AuthCallback] Token inválido:', userError);
              setMessage("❌ Convite inválido ou expirado.");
              setLoading(false);
              return;
            }

            console.log('✅ [AuthCallback] Token válido para:', userData.user.email);

            // Armazena os dados do convite para uso posterior
            setInviteData({
              user: userData.user,
              accessToken,
              refreshToken
            });
            
            setAction("create_password");
            setMessage("✅ Convite confirmado! Agora crie sua senha.");
          } else {
            console.log('🔍 [AuthCallback] Processando autenticação normal...');
            
            // Para outros tipos de autenticação, define a sessão normalmente
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              setMessage("⚠️ Erro ao configurar sessão: " + sessionError.message);
              setLoading(false);
              return;
            }

            if (data.user) {
              setAction("redirect");
              setMessage("✅ Autenticação realizada com sucesso! Redirecionando...");
              setTimeout(() => navigate("/dashboard"), 2000);
            }
          }
        } else {
          console.log('❌ [AuthCallback] Parâmetros inválidos');
          setMessage("❌ Parâmetros de autenticação inválidos.");
        }
      } catch (err) {
        console.error('❌ [AuthCallback] Erro:', err);
        setMessage("❌ Erro inesperado: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("❌ As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setMessage("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCreatingPassword(true);
    setMessage("");

    try {
      const result = await finalizeInvite(inviteData.user.email, password);
      
      if (result.success) {
        setMessage("✅ Senha criada com sucesso! Redirecionando para o dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage("❌ Erro ao criar senha: " + result.error);
      }
    } catch (err) {
      console.error('❌ [AuthCallback] Erro ao criar senha:', err);
      setMessage("❌ Erro inesperado: " + err.message);
    } finally {
      setCreatingPassword(false);
    }
  };

  const getMessageIcon = () => {
    if (message.includes("❌")) return <AlertTriangle size={20} className="text-destructive" />;
    if (message.includes("⚠️")) return <AlertTriangle size={20} className="text-warning" />;
    if (message.includes("✅")) return <CheckCircle size={20} className="text-success" />;
    return <Info size={20} className="text-info" />;
  };

  const getMessageStyles = () => {
    if (message.includes("❌")) return 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20 text-destructive';
    if (message.includes("⚠️")) return 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 text-warning';
    if (message.includes("✅")) return 'bg-gradient-to-r from-success/10 to-success/5 border-success/20 text-success';
    return 'bg-gradient-to-r from-info/10 to-info/5 border-info/20 text-info';
  };

  // Renderizar formulário de criação de senha
  if (action === "create_password" && inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="w-full max-w-md relative z-10 p-6">
          <Card className="card-modern p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-success/20 shadow-glow-success">
              <User size={40} className="text-success" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
              Bem-vindo ao Sistema!
            </h2>
            <p className="text-muted-foreground text-lg mb-6 font-medium">
              Olá, <span className="text-foreground font-semibold">{inviteData.user.email}</span>
            </p>
            <p className="text-muted-foreground mb-8">
              Para finalizar seu cadastro, crie uma senha segura para sua conta.
            </p>
            
            <form onSubmit={handleCreatePassword} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Nova senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    className="input-modern w-full h-14 pl-12 pr-12 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Confirme a nova senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    className="input-modern w-full h-14 pl-12 pr-12 text-base"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-success-modern w-full h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={creatingPassword}
              >
                {creatingPassword ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Shield size={18} />
                    <span>Criar Conta</span>
                  </div>
                )}
              </button>
            </form>
            
            {message && (
              <div className={`mt-6 p-4 rounded-xl border backdrop-blur-sm ${getMessageStyles()}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-current/20 rounded-full flex items-center justify-center">
                    {getMessageIcon()}
                  </div>
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar tela de loading ou mensagens
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10 p-6">
        <Card className="card-modern p-10 text-center">
          {loading ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-glow">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Processando...</h2>
              <p className="text-muted-foreground font-medium">Aguarde enquanto processamos sua autenticação</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-info/20 to-info/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-info/20 shadow-glow-info">
                <Info size={40} className="text-info" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Status da Autenticação</h2>
              
              {message && (
                <div className={`p-4 rounded-xl border backdrop-blur-sm ${getMessageStyles()}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-current/20 rounded-full flex items-center justify-center">
                      {getMessageIcon()}
                    </div>
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
              )}

              {action === "redirect" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-success/10 to-success/5 border border-success/20 text-success rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-success" />
                    <span className="font-medium">Redirecionando para o dashboard...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
