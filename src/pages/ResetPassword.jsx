import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
// Componente Card customizado será criado
import { 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário está autenticado (vindo do link de reset)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("❌ Link inválido ou expirado. Solicite um novo reset de senha.");
        setTimeout(() => navigate("/request-reset"), 3000);
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("❌ Usuário não autenticado.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setMessage("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // Atualiza a senha com Supabase Auth
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage("⚠️ Erro: " + error.message);
      } else {
        setMessage("✅ Senha redefinida com sucesso! Redirecionando para login...");
        
        // Atualizar metadata do usuário para remover flag de senha temporária
        try {
          await supabase.auth.updateUser({
            data: {
              temporary_password: false
            }
          });
        } catch (metadataError) {
          console.warn('⚠️ [ResetPassword] Erro ao atualizar metadata:', metadataError);
        }
        
        // Faz logout para forçar novo login com a nova senha
        await supabase.auth.signOut();
        
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setMessage("Erro inesperado: " + err.message);
    } finally {
      setLoading(false);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-muted/30 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-muted/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="card-modern p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
            <Lock size={32} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10 p-6">
        <Card className="card-modern p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-glow">
            <Shield size={40} className="text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Redefinir Senha
          </h2>
          <p className="text-muted-foreground text-lg mb-8 font-medium">
            Olá, <span className="text-foreground font-semibold">{user.email}</span>. Digite sua nova senha abaixo.
          </p>
          
          <form onSubmit={handleReset} className="space-y-6">
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
              className="btn-primary-modern w-full h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Shield size={18} />
                  <span>Salvar nova senha</span>
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
  )
}
