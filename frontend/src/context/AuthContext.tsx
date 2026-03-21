import { createContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext<null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useAuthStore((state) => state);
