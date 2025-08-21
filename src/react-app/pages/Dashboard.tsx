import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Fuel, CheckSquare, FileText, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import type { User, Module } from '@/shared/types';

export default function Dashboard() {
  const { user: authUser, isPending } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !authUser) {
      navigate('/');
    }
  }, [authUser, isPending, navigate]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return;
      
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (authUser) {
      fetchCurrentUser();
      fetchModules();
    }
  }, [authUser]);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin">
          <CheckSquare className="w-10 h-10" />
        </div>
      </div>
    );
  }

  const currentUser = user;

  const canCreateModules = ['ROLE_DRIVER', 'ROLE_FIREFIGHTER'].includes(currentUser.role);
  const canValidate = ['ROLE_SERGEANT', 'ROLE_B3', 'ROLE_OFFICER'].includes(currentUser.role);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AWAITING_SERGEANT':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'VALIDATED_SERGEANT':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'REVIEWED_B3':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PUBLISHED_OFFICERS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AWAITING_SERGEANT':
        return 'Aguardando Sargento';
      case 'VALIDATED_SERGEANT':
        return 'Validado pelo Sargento';
      case 'REVIEWED_B3':
        return 'Revisado pela B3';
      case 'PUBLISHED_OFFICERS':
        return 'Publicado para Oficiais';
      default:
        return status;
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'FUEL':
        return <Fuel className="w-6 h-6" />;
      case 'CHECKLIST':
        return <CheckSquare className="w-6 h-6" />;
      case 'PASS_ALONG':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getModuleLabel = (type: string) => {
    switch (type) {
      case 'FUEL':
        return 'Abastecimento';
      case 'CHECKLIST':
        return 'Checklist';
      case 'PASS_ALONG':
        return 'Livro de Passagens';
      default:
        return type;
    }
  };

  return (
    <Layout user={currentUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo ao sistema de gestão de rotinas do Corpo de Bombeiros
          </p>
        </div>

        {/* Quick Actions */}
        {canCreateModules && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lançar Dados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/fuel')}
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Fuel className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-blue-900">Abastecimento</span>
              </button>
              
              <button
                onClick={() => navigate('/checklist')}
                className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <CheckSquare className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-900">Checklist</span>
              </button>
              
              <button
                onClick={() => navigate('/passalong')}
                className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <FileText className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-purple-900">Livro de Passagens</span>
              </button>
            </div>
          </div>
        )}

        {/* Validation Section */}
        {canValidate && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.role === 'ROLE_SERGEANT' && 'Itens para Validação'}
                {currentUser.role === 'ROLE_B3' && 'Itens para Revisão'}
                {currentUser.role === 'ROLE_OFFICER' && 'Relatórios Publicados'}
              </h2>
              <button
                onClick={() => navigate('/validation')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-5 h-5" />
                <span>Ver Todos</span>
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin mx-auto">
                  <CheckSquare className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            ) : modules.length > 0 ? (
              <div className="space-y-3">
                {modules.slice(0, 3).map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getModuleIcon(module.type)}
                      <div>
                        <p className="font-medium text-gray-900">{getModuleLabel(module.type)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(module.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(module.status)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusLabel(module.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum item encontrado</p>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto">
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-3">
              {modules.slice(0, 5).map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    {getModuleIcon(module.type)}
                    <div>
                      <p className="font-medium text-gray-900">{getModuleLabel(module.type)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(module.created_at).toLocaleDateString('pt-BR')} às {new Date(module.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(module.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusLabel(module.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma atividade encontrada</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
