"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase"; // ajuste o path para onde você configurou o cliente
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // Atualiza a senha com Supabase Auth
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage("⚠️ Erro: " + error.message);
      } else {
        setMessage("✅ Senha redefinida com sucesso! Redirecionando...");
        setTimeout(() => router.push("/login"), 2000); // depois leva pra login
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
          Redefinir Senha
        </h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
