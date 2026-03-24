import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      if (!credentialResponse.credential) return;
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Bienvenido');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Error al iniciar sesión');
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="mb-1 text-xl font-bold text-slate-800">Panel de Contactos</h1>
        <p className="mb-6 text-sm text-slate-500">Acceso exclusivo para el equipo Hubox</p>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Login cancelado o fallido')}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </div>
      </div>
    </main>
  );
}