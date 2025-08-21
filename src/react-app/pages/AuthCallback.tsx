import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Flame } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
      } catch (error) {
        console.error('Error during authentication:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Flame className="w-12 h-12 text-white mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Autenticando...
        </h2>
        <p className="text-red-100">
          Aguarde enquanto processamos seu login
        </p>
      </div>
    </div>
  );
}
