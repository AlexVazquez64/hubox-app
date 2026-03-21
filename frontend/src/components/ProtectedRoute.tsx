import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">Cargando...</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
