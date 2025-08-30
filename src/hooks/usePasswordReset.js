import { useState } from "react";
import { supabase } from "../lib/supabase";

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const requestReset = async (email) => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage("⚠️ Erro: " + error.message);
        return { success: false, error };
      } else {
        setMessage("✅ Email de redefinição enviado! Verifique sua caixa de entrada.");
        return { success: true };
      }
    } catch (err) {
      setMessage("Erro inesperado: " + err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password) => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage("⚠️ Erro: " + error.message);
        return { success: false, error };
      } else {
        setMessage("✅ Senha redefinida com sucesso!");
        
        // Faz logout para forçar novo login com a nova senha
        await supabase.auth.signOut();
        
        return { success: true };
      }
    } catch (err) {
      setMessage("Erro inesperado: " + err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage("");

  return {
    loading,
    message,
    requestReset,
    updatePassword,
    clearMessage,
  };
}
