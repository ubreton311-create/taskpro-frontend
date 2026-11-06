import { useEffect, useState } from 'react';
import { Users, Mail, CalendarDays, RefreshCw, Search, UserRound, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface Client {
  id: string; name: string; email: string; role: string; createdAt: string;
}

function extractUsers(response: unknown): Client[] {
  let users: unknown = response;
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    const object = response as Record<string, unknown>;
    users = object.data ?? object.users ?? object.results;
  }
  if (!Array.isArray(users)) {
    throw new Error('Formato de respuesta inesperado. GET /users debe devolver un array.');
  }
  return users as Client[];
}

function formatDate(date: string): string {
  if (!date) return 'No disponible';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsedDate);
}

const CLIENTS_ERROR = 'No se pudieron cargar los clientes.';

/** GET /users — resolves with the CLIENT-role users only. */
async function fetchClients(): Promise<Client[]> {
  const response = await adminApi.getUsers();
  return extractUsers(response).filter((user) => user.role === 'CLIENT');
}

export default function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchClients()
      .then((data) => { if (active) setClients(data); })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : CLIENTS_ERROR);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    void fetchClients()
      .then(setClients)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : CLIENTS_ERROR))
      .finally(() => setLoading(false));
  };

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase().trim();
    return client.name?.toLowerCase().includes(query) || client.email?.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-7 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3"><Users className="h-6 w-6 text-[#7a2fbf]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="mt-1 text-sm text-gray-500">Administra los usuarios registrados en TaskPro.</p>
          </div>
        </div>
        <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Total de clientes</p><p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '—' : clients.length}</p></div>
          <div className="rounded-xl bg-purple-100 p-3"><Users className="h-6 w-6 text-[#7a2fbf]" /></div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div><p className="text-sm font-medium text-gray-500">Resultados de búsqueda</p><p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '—' : filteredClients.length}</p></div>
          <div className="rounded-xl bg-purple-100 p-3"><Search className="h-6 w-6 text-[#7a2fbf]" /></div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..." className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100" />
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">No se pudieron cargar los clientes</p><p className="mt-1 text-sm">{error}</p></div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5"><h2 className="font-bold text-gray-900">Clientes registrados</h2><p className="mt-1 text-sm text-gray-500">Listado de cuentas con rol CLIENT.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">Correo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">Registro</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-14 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#7a2fbf]" /><p className="mt-3 text-sm text-gray-500">Cargando clientes...</p></td></tr>
              ) : !error && filteredClients.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-14 text-center"><UserRound className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 font-semibold text-gray-700">No hay clientes registrados</p></td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="transition hover:bg-purple-50/40">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-[#7a2fbf]">{client.name?.charAt(0)?.toUpperCase() || 'C'}</div><span className="font-semibold text-gray-900">{client.name || 'Sin nombre'}</span></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4 text-gray-400" />{client.email}</div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-gray-600"><CalendarDays className="h-4 w-4 text-gray-400" />{formatDate(client.createdAt)}</div></td>
                    <td className="px-6 py-4"><span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-[#7a2fbf]">CLIENT</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}