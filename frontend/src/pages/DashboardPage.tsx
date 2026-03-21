import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useContactsStore } from '../stores/contactsStore';
import { ContactsService } from '../services/contacts.service';
import StatusBadge from '../components/StatusBadge';

const STATUS_OPTIONS = ['', 'new', 'contacted', 'archived'] as const;

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { contacts, total, loading, params, fetch, updateStatus } = useContactsStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetch({ search, page: 1 });
  };

  const handleStatusFilter = (status: string) => fetch({ status, page: 1 });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus(id, status);
      toast.success('Estado actualizado');
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleExport = () => {
    const url = ContactsService.exportUrl({ status: params.status, search: params.search });
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Hubox</p>
              <p className="text-xs text-slate-400">Panel de contactos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">{user?.email}</span>
            <button onClick={handleLogout} className="btn-secondary px-3 py-1.5 text-xs">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Contactos{' '}
            <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {total}
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s || 'all'}
                onClick={() => handleStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  params.status === s
                    ? 'bg-brand-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s || 'Todos'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="search"
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary px-4">
              Buscar
            </button>
          </form>
          {user?.role === 'admin' && (
            <button onClick={handleExport} className="btn-secondary gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Cargando contactos...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-sm">Sin resultados</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Nombre', 'Email', 'Teléfono', 'Empresa', 'Estado', 'Fecha', ''].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((c) => (
                    <tr key={c.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{c.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{c.email}</td>
                      <td className="px-4 py-3 text-slate-500">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{c.company || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3">
                        {user?.role === 'admin' && (
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          >
                            {['new', 'contacted', 'archived'].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando {contacts.length} de {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={params.page! <= 1}
              onClick={() => fetch({ page: params.page! - 1 })}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              disabled={params.page! * params.limit! >= total}
              onClick={() => fetch({ page: params.page! + 1 })}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
