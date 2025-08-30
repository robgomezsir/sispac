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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Esqueceu sua senha?
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
        
        <form onSubmit={handleRequestReset} className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar email de redefinição"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.includes("⚠️") ? "text-yellow-600" : 
            message.includes("✅") ? "text-green-600" : 
            "text-gray-700"
          }`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}
