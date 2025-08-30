import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function AuthCallback() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [inviteData, setInviteData] = useState(null);
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
          console.log('🔍 [AuthCallback] Sem tokens, redirecionando para login...');
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
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

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
      console.log('🔍 [AuthCallback] Criando senha para:', inviteData.user.email);
      
      // Primeiro atualiza a senha do usuário usando o token do convite
      const { error: updateError } = await supabase.auth.updateUser({ 
        password 
      }, {
        headers: {
          Authorization: `Bearer ${inviteData.accessToken}`
        }
      });

      if (updateError) {
        setMessage("⚠️ Erro ao criar senha: " + updateError.message);
        setLoading(false);
        return;
      }

      console.log('✅ [AuthCallback] Senha criada com sucesso');

      // Agora finaliza o convite usando a função do hook
      const result = await finalizeInvite(
        inviteData.user, 
        inviteData.accessToken, 
        inviteData.refreshToken
      );

      if (result.success) {
        setMessage("✅ Senha criada com sucesso! Redirecionando...");
        
        // Atualiza o perfil para marcar que a senha foi definida
        try {
          await supabase
            .from('profiles')
            .update({ password_set: true })
            .eq('id', inviteData.user.id);
        } catch (profileError) {
          console.log("Perfil não encontrado, continuando...");
        }

        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage("⚠️ Erro ao finalizar convite: " + result.error.message);
      }
    } catch (err) {
      console.error('❌ [AuthCallback] Erro ao criar senha:', err);
      setMessage("❌ Erro inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando convite...</p>
        </div>
      </div>
    );
  }

  if (action === "create_password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Bem-vindo ao SisPAC!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Olá, {inviteData?.user?.email}. Crie sua senha para começar a usar o sistema.
          </p>
          
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <input
              type="password"
              name="password"
              placeholder="Crie sua senha"
              className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
              required
              minLength={6}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirme sua senha"
              className="w-full p-3 border rounded-xl focus:ring focus:ring-indigo-400"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Criando senha..." : "Criar Senha e Entrar"}
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Autenticação</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
