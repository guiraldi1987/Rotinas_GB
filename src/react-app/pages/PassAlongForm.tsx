import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { FileText, Save, ArrowLeft } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import type { User, PassAlongPayload } from '@/shared/types';

export default function PassAlongForm() {
  const { user: authUser, isPending } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PassAlongPayload>({
    turnoAnterior: '',
    turnoAtual: '',
    responsavelAnterior: '',
    responsavelAtual: '',
    ocorrencias: '',
    pendencias: '',
    observacoes: '',
    data: new Date().toISOString().split('T')[0]
  });

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
          setFormData(prev => ({
            ...prev,
            responsavelAtual: userData.name || userData.email
          }));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (authUser) {
      fetchCurrentUser();
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'PASS_ALONG',
          payload: formData
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Error creating pass along record');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isPending || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin">
          <FileText className="w-10 h-10" />
        </div>
      </div>
    );
  }

  const currentUser = user;

  if (!['ROLE_DRIVER', 'ROLE_FIREFIGHTER'].includes(currentUser.role)) {
    return (
      <Layout user={currentUser}>
        <div className="text-center py-16">
          <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  const turnos = ['Manhã (06:00 - 18:00)', 'Noite (18:00 - 06:00)', 'Plantão 24h'];

  return (
    <Layout user={currentUser}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Livro de Passagens</h1>
            <p className="text-gray-600">Registro da troca de turno e ocorrências</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 rounded-full p-2">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Informações da Passagem</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-1"></div>

              <div>
                <label htmlFor="turnoAnterior" className="block text-sm font-medium text-gray-700 mb-2">
                  Turno Anterior *
                </label>
                <select
                  id="turnoAnterior"
                  name="turnoAnterior"
                  value={formData.turnoAnterior}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione o turno anterior</option>
                  {turnos.map(turno => (
                    <option key={turno} value={turno}>{turno}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="turnoAtual" className="block text-sm font-medium text-gray-700 mb-2">
                  Turno Atual *
                </label>
                <select
                  id="turnoAtual"
                  name="turnoAtual"
                  value={formData.turnoAtual}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione o turno atual</option>
                  {turnos.map(turno => (
                    <option key={turno} value={turno}>{turno}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="responsavelAnterior" className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável Turno Anterior *
                </label>
                <input
                  type="text"
                  id="responsavelAnterior"
                  name="responsavelAnterior"
                  value={formData.responsavelAnterior}
                  onChange={handleChange}
                  required
                  placeholder="Nome do responsável do turno anterior"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="responsavelAtual" className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável Turno Atual *
                </label>
                <input
                  type="text"
                  id="responsavelAtual"
                  name="responsavelAtual"
                  value={formData.responsavelAtual}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-6">
              <div>
                <label htmlFor="ocorrencias" className="block text-sm font-medium text-gray-700 mb-2">
                  Ocorrências do Turno Anterior *
                </label>
                <textarea
                  id="ocorrencias"
                  name="ocorrencias"
                  value={formData.ocorrencias}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Descreva as principais ocorrências atendidas no turno anterior..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="pendencias" className="block text-sm font-medium text-gray-700 mb-2">
                  Pendências e Tarefas *
                </label>
                <textarea
                  id="pendencias"
                  name="pendencias"
                  value={formData.pendencias}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Liste as pendências, manutenções programadas ou tarefas a serem realizadas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Gerais *
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Outras informações relevantes para o turno seguinte..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Passagem'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
