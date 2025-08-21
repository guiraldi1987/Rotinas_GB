import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import type { User } from '@/shared/types';

export function useCurrentUser() {
  const { user: authUser, isPending } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (!isPending) {
      fetchCurrentUser();
    }
  }, [authUser, isPending]);

  return {
    user,
    loading: isPending || loading,
    refetch: () => {
      if (authUser) {
        setLoading(true);
        // Re-trigger the effect
      }
    }
  };
}
