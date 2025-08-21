import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Fuel, Save, ArrowLeft } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import type { User, FuelPayload } from '@/shared/types';

export default function FuelForm() {
  const { user: authUser, isPending } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FuelPayload>({
    km: 0,
    litros: 0,
    motorista: '',
    viatura: '',
    posto: '',
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
            motorista: userData.name || userData.email
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
          type: 'FUEL',
          payload: formData
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Error creating fuel record');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'km' || name === 'litros' ? Number(value) : value
    }));
  };

  if (isPending || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Fuel className="w-10 h-10" />
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
            <h1 className="text-3xl font-bold text-gray-900">Registro de Abastecimento</h1>
            <p className="text-gray-600">Registre o abastecimento da viatura</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 rounded-full p-2">
              <Fuel className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Dados do Abastecimento</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="motorista" className="block text-sm font-medium text-gray-700 mb-2">
                  Motorista *
                </label>
                <input
                  type="text"
                  id="motorista"
                  name="motorista"
                  value={formData.motorista}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="km" className="block text-sm font-medium text-gray-700 mb-2">
                  Quilometragem *
                </label>
                <input
                  type="number"
                  id="km"
                  name="km"
                  value={formData.km}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="litros" className="block text-sm font-medium text-gray-700 mb-2">
                  Litros Abastecidos *
                </label>
                <input
                  type="number"
                  id="litros"
                  name="litros"
                  value={formData.litros}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="posto" className="block text-sm font-medium text-gray-700 mb-2">
                  Posto de Combustível *
                </label>
                <select
                  id="posto"
                  name="posto"
                  value={formData.posto}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o posto</option>
                  <option value="Petrobras - Centro">Petrobras - Centro</option>
                  <option value="Shell - Av. Principal">Shell - Av. Principal</option>
                  <option value="Ipiranga - Zona Norte">Ipiranga - Zona Norte</option>
                  <option value="BR - Zona Sul">BR - Zona Sul</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Registro'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
