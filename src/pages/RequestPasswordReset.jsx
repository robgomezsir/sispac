import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { 
  Mail, 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info
} from 'lucide-react';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage("⚠️ Erro: " + error.message);
      } else {
        setMessage("✅ Email de redefinição enviado! Verifique sua caixa de entrada.");
        setEmail("");
      }
    } catch (err) {
      setMessage("Erro inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = () => {
    if (message.includes("⚠️")) return <AlertTriangle size={20} className="text-warning" />;
    if (message.includes("✅")) return <CheckCircle size={20} className="text-success" />;
    return <Info size={20} className="text-info" />;
  };

  const getMessageStyles = () => {
    if (message.includes("⚠️")) return 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 text-warning';
    if (message.includes("✅")) return 'bg-gradient-to-r from-success/10 to-success/5 border-success/20 text-success';
    return 'bg-gradient-to-r from-info/10 to-info/5 border-info/20 text-info';
  };

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
            Esqueceu sua senha?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 font-medium">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
          
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="input-modern w-full h-14 pl-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <span>Enviar email de redefinição</span>
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

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="btn-secondary-modern inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              <ArrowLeft size={16} />
              Voltar para o início
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
