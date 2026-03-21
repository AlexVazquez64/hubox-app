import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  loginWithGoogle: (accessToken: string) => Promise<User>;
  logout: () => void;
  hydrate: () => Promise<void | unknown>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      loginWithGoogle: async (accessToken: string) => {
        const { data } = await api.post<{ accessToken: string; user: User }>('/auth/google', {
          idToken: accessToken,
        });
        localStorage.setItem('access_token', data.accessToken);
        set({ user: data.user });
        return data.user;
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null });
      },

      hydrate: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return set({ loading: false });
        try {
          const { data } = await api.get<User>('/auth/me');
          set({ user: data, loading: false });
        } catch {
          localStorage.removeItem('access_token');
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
