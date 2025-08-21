import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Eye, CheckCircle, Clock, FileText, Fuel, CheckSquare, ArrowLeft } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import type { User as UserType, Module } from '@/shared/types';

export default function ValidationPage() {
  const { user: authUser, isPending } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [updating, setUpdating] = useState(false);

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

  const updateStatus = async (moduleId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/modules/${moduleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchModules();
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Eye className="w-10 h-10" />
        </div>
      </div>
    );
  }

  const currentUser = user;

  if (!['ROLE_SERGEANT', 'ROLE_B3', 'ROLE_OFFICER'].includes(currentUser.role)) {
    return (
      <Layout user={currentUser}>
        <div className="text-center py-16">
          <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'FUEL':
        return <Fuel className="w-5 h-5 text-blue-600" />;
      case 'CHECKLIST':
        return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'PASS_ALONG':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
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
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  const canValidate = (module: Module) => {
    switch (currentUser.role) {
      case 'ROLE_SERGEANT':
        return module.status === 'AWAITING_SERGEANT';
      case 'ROLE_B3':
        return module.status === 'VALIDATED_SERGEANT';
      case 'ROLE_OFFICER':
        return module.status === 'REVIEWED_B3';
      default:
        return false;
    }
  };

  const getNextStatus = (module: Module) => {
    switch (currentUser.role) {
      case 'ROLE_SERGEANT':
        return 'VALIDATED_SERGEANT';
      case 'ROLE_B3':
        return 'REVIEWED_B3';
      case 'ROLE_OFFICER':
        return 'PUBLISHED_OFFICERS';
      default:
        return module.status;
    }
  };

  const getActionLabel = () => {
    switch (currentUser.role) {
      case 'ROLE_SERGEANT':
        return 'Validar';
      case 'ROLE_B3':
        return 'Revisar';
      case 'ROLE_OFFICER':
        return 'Publicar';
      default:
        return 'Visualizar';
    }
  };

  const renderModuleDetails = (module: Module) => {
    if (!module) return null;

    const payload = JSON.parse(module.payload);

    switch (module.type) {
      case 'FUEL':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Viatura</label>
                <p className="text-gray-900">{payload.viatura}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Motorista</label>
                <p className="text-gray-900">{payload.motorista}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quilometragem</label>
                <p className="text-gray-900">{payload.km.toLocaleString()} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Litros</label>
                <p className="text-gray-900">{payload.litros} L</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Posto</label>
                <p className="text-gray-900">{payload.posto}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data</label>
                <p className="text-gray-900">{new Date(payload.data).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        );

      case 'CHECKLIST':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Viatura</label>
                <p className="text-gray-900">{payload.viatura}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data</label>
                <p className="text-gray-900">{new Date(payload.data).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Itens Verificados</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(payload).filter(([key]) => typeof payload[key] === 'boolean').map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {payload.observacoes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observações</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{payload.observacoes}</p>
              </div>
            )}
          </div>
        );

      case 'PASS_ALONG':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Data</label>
                <p className="text-gray-900">{new Date(payload.data).toLocaleDateString('pt-BR')}</p>
              </div>
              <div></div>
              <div>
                <label className="text-sm font-medium text-gray-500">Turno Anterior</label>
                <p className="text-gray-900">{payload.turnoAnterior}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Turno Atual</label>
                <p className="text-gray-900">{payload.turnoAtual}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Responsável Anterior</label>
                <p className="text-gray-900">{payload.responsavelAnterior}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Responsável Atual</label>
                <p className="text-gray-900">{payload.responsavelAtual}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Ocorrências</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{payload.ocorrencias}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Pendências</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{payload.pendencias}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Observações</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{payload.observacoes}</p>
            </div>
          </div>
        );

      default:
        return <p>Detalhes não disponíveis</p>;
    }
  };

  return (
    <Layout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser.role === 'ROLE_SERGEANT' && 'Validação de Registros'}
              {currentUser.role === 'ROLE_B3' && 'Revisão de Registros'}
              {currentUser.role === 'ROLE_OFFICER' && 'Relatórios Publicados'}
            </h1>
            <p className="text-gray-600">
              {currentUser.role === 'ROLE_SERGEANT' && 'Confira e valide os registros dos bombeiros'}
              {currentUser.role === 'ROLE_B3' && 'Revise os registros validados pelos sargentos'}
              {currentUser.role === 'ROLE_OFFICER' && 'Visualize os relatórios finais'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registros</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin mx-auto">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            ) : modules.length > 0 ? (
              <div className="space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedModule?.id === module.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-center justify-between">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum registro encontrado</p>
            )}
          </div>

          {/* Module Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {selectedModule ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {getModuleIcon(selectedModule.type)}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getModuleLabel(selectedModule.type)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Criado em {new Date(selectedModule.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedModule.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusLabel(selectedModule.status)}
                    </span>
                  </div>
                </div>

                {renderModuleDetails(selectedModule)}

                {canValidate(selectedModule) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => updateStatus(selectedModule.id, getNextStatus(selectedModule))}
                      disabled={updating}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{updating ? 'Processando...' : getActionLabel()}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione um registro para visualizar os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
