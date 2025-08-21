import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Flame, Shield, Truck } from 'lucide-react';

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate('/dashboard');
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="animate-spin">
          <Flame className="w-10 h-10 text-white" />
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-4">
              <Flame className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Rotinas GB
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Sistema de Gestão de Rotinas do Corpo de Bombeiros
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Checklist de Viaturas
            </h3>
            <p className="text-red-100">
              Controle diário da condição dos veículos de emergência
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Abastecimento
            </h3>
            <p className="text-red-100">
              Registro de combustível e quilometragem das viaturas
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-white/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Livro de Passagens
            </h3>
            <p className="text-red-100">
              Documentação das trocas de turno e ocorrências
            </p>
          </div>
        </div>

        {/* Login Section */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Acesso ao Sistema
            </h2>
            <p className="text-red-100 mb-6">
              Entre com sua conta do Google para acessar o sistema
            </p>
            <button
              onClick={redirectToLogin}
              className="w-full bg-white text-red-700 font-semibold py-3 px-6 rounded-lg hover:bg-red-50 transition-colors"
            >
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
