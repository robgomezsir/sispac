import { useState } from "react";
import { supabase } from "../lib/supabase";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-lg border shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Esqueceu sua senha?
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
        
        <form onSubmit={handleRequestReset} className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar email de redefinição"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.includes("⚠️") ? "text-yellow-600" : 
            message.includes("✅") ? "text-green-600" : 
            "text-foreground"
          }`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}
