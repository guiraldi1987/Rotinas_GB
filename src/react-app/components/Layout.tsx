import { ReactNode } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Flame, LogOut, User } from 'lucide-react';
import type { User as UserType } from '@/shared/types';

interface LayoutProps {
  children: ReactNode;
  user: UserType;
}

const roleLabels = {
  'ROLE_DRIVER': 'Motorista',
  'ROLE_FIREFIGHTER': 'Bombeiro',
  'ROLE_SERGEANT': 'Sargento',
  'ROLE_B3': 'Seção Operacional',
  'ROLE_OFFICER': 'Oficial'
};

export default function Layout({ children, user }: LayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Rotinas GB</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User className="w-5 h-5" />
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-red-100">{roleLabels[user.role]}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white hover:text-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
