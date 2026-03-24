import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedToken = localStorage.getItem('access_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    axios.get<User>(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(({ data }) => {
        setToken(savedToken);
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = useCallback(async (credential: string): Promise<User> => {
    const { data } = await axios.post<{ accessToken: string; user: User }>(
      `${BASE_URL}/auth/google`,
      { idToken: credential }
    );
    localStorage.setItem('access_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};