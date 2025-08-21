import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { CheckSquare, Save, ArrowLeft } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import type { User, ChecklistPayload } from '@/shared/types';

export default function ChecklistForm() {
  const { user: authUser, isPending } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChecklistPayload>({
    viatura: '',
    freios: false,
    luzes: false,
    pneus: false,
    combustivel: false,
    oleo: false,
    agua: false,
    equipamentos: false,
    limpeza: false,
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
          type: 'CHECKLIST',
          payload: formData
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Error creating checklist record');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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

  if (!['ROLE_DRIVER', 'ROLE_FIREFIGHTER'].includes(currentUser.role)) {
    return (
      <Layout user={currentUser}>
        <div className="text-center py-16">
          <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  const checklistItems = [
    { key: 'freios', label: 'Freios' },
    { key: 'luzes', label: 'Luzes e Sinalizadores' },
    { key: 'pneus', label: 'Pneus e Pressão' },
    { key: 'combustivel', label: 'Nível de Combustível' },
    { key: 'oleo', label: 'Óleo do Motor' },
    { key: 'agua', label: 'Água do Radiador' },
    { key: 'equipamentos', label: 'Equipamentos de Emergência' },
    { key: 'limpeza', label: 'Limpeza Geral' }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">Checklist de Viatura</h1>
            <p className="text-gray-600">Verificação diária da condição da viatura</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 rounded-full p-2">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Verificação de Itens</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="viatura" className="block text-sm font-medium text-gray-700 mb-2">
                  Viatura *
                </label>
                <select
                  id="viatura"
                  name="viatura"
                  value={formData.viatura}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione a viatura</option>
                  <option value="AB-01">AB-01 - Auto Bomba 01</option>
                  <option value="AB-02">AB-02 - Auto Bomba 02</option>
                  <option value="ASE-01">ASE-01 - Auto Socorro de Emergência</option>
                  <option value="UTR-01">UTR-01 - Unidade de Transporte e Resgate</option>
                  <option value="ADMIN-01">ADMIN-01 - Veículo Administrativo</option>
                </select>
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Itens a Verificar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistItems.map((item) => (
                  <div key={item.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id={item.key}
                      name={item.key}
                      checked={formData[item.key as keyof ChecklistPayload] as boolean}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label
                      htmlFor={item.key}
                      className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva qualquer problema encontrado ou observação relevante..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Checklist'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
