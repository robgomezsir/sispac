import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Redefinir Senha
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Olá, {user.email}. Digite sua nova senha abaixo.
        </p>
        
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
        
        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.includes("❌") ? "text-red-600" : 
            message.includes("⚠️") ? "text-yellow-600" : 
            "text-green-600"
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
