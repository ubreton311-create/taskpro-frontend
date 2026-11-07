import { useCallback, useEffect, useState, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BriefcaseBusiness, ShieldCheck, Wallet, RefreshCw, ArrowRight,
  Clock3, AlertCircle, ClipboardList, CalendarDays, TrendingUp,
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth'; // Corregido a tu ruta real
import { adminDashboardApi, type AdminStats, type RecentQuote } from '../services/adminDashboardApi';

interface CurrentUser { id?: string; name?: string; email?: string; role?: string; }
interface DashboardErrors { stats: string | null; kyc: string | null; quotes: string | null; }

const EMPTY_STATS: AdminStats = { totalUsers: 0, activeProviders: 0, pendingKyc: 0, commissionRevenue: 0 };
const EMPTY_ERRORS: DashboardErrors = { stats: null, kyc: null, quotes: null };

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object') {
    const object = response as Record<string, unknown>;
    const array = object.data ?? object.items ?? object.providers ?? object.quotes ?? object.users;
    if (Array.isArray(array)) return array as T[];
  }
  throw new Error('El servidor devolvió un formato inesperado.');
}

function formatCurrency(value: number | string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(amount);
}

function getStatusStyle(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING': return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'CONFIRMED': return 'bg-blue-50 text-blue-700 ring-blue-200';
    case 'PAID': return 'bg-purple-50 text-[#7a2fbf] ring-purple-200';
    case 'COMPLETED': return 'bg-green-50 text-green-700 ring-green-200';
    case 'CANCELLED': case 'REJECTED': return 'bg-red-50 text-red-700 ring-red-200';
    default: return 'bg-gray-100 text-gray-600 ring-gray-200';
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', PAID: 'Pagada', COMPLETED: 'Completada', CANCELLED: 'Cancelada', REJECTED: 'Rechazada' };
  return labels[status.toUpperCase()] ?? status;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}</span>
    </div>
  );
}

function MetricCard({ title, value, description, icon: Icon, loading, accent = false }: { title: string; value: string | number; description: string; icon: ElementType; loading: boolean; accent?: boolean; }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{loading ? <span className="inline-block h-8 w-20 animate-pulse rounded-lg bg-gray-100" /> : value}</p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent ? 'bg-[#7a2fbf] text-white' : 'bg-purple-50 text-[#7a2fbf]'}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

export default function GlobalDashboard() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [quotes, setQuotes] = useState<RecentQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<DashboardErrors>(EMPTY_ERRORS);

  const currentDate = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  // Read once per mount: the session cannot change without a full navigation.
  const [currentUser] = useState(() => getCurrentUser() as CurrentUser | null);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsResult, kycResult, quotesResult] = await Promise.allSettled([
        adminDashboardApi.getStats(), adminDashboardApi.getPendingKyc(), adminDashboardApi.getQuotes(),
      ]);

      const nextErrors: DashboardErrors = { stats: null, kyc: null, quotes: null };

      if (statsResult.status === 'fulfilled') {
        setStats({
          totalUsers: Number(statsResult.value.totalUsers ?? 0),
          activeProviders: Number(statsResult.value.activeProviders ?? 0),
          pendingKyc: Number(statsResult.value.pendingKyc ?? 0),
          commissionRevenue: Number(statsResult.value.commissionRevenue ?? 0),
        });
        setPendingKycCount(Number(statsResult.value.pendingKyc ?? 0)); // Respaldo
      } else {
        nextErrors.stats = statsResult.reason instanceof Error ? statsResult.reason.message : 'No se pudieron cargar las métricas.';
      }

      if (kycResult.status === 'fulfilled') {
        try { setPendingKycCount(extractArray(kycResult.value).length); }
        catch (error) { nextErrors.kyc = error instanceof Error ? error.message : 'Error al interpretar KYC.'; }
      } else {
        nextErrors.kyc = kycResult.reason instanceof Error ? kycResult.reason.message : 'No se pudieron cargar las solicitudes KYC.';
      }

      if (quotesResult.status === 'fulfilled') {
        try {
          const allQuotes = extractArray<RecentQuote>(quotesResult.value);
          setQuotes([...allQuotes].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5));
        } catch (error) { nextErrors.quotes = error instanceof Error ? error.message : 'Error al interpretar cotizaciones.'; }
      } else {
        nextErrors.quotes = quotesResult.reason instanceof Error ? quotesResult.reason.message : 'No se pudieron cargar las cotizaciones.';
      }

      setErrors(nextErrors);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = () => { setRefreshing(true); void loadDashboard(); };

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  return (
    <div className="min-h-full space-y-8 bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#7a2fbf]">
            <span className="h-2 w-2 rounded-full bg-[#7a2fbf]" /> TASKPRO · ADMINISTRACIÓN
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">¡Bienvenido, {currentUser?.name?.trim() || 'Administrador'}!</h1>
          <p className="mt-2 flex items-center gap-2 text-sm capitalize text-gray-500"><CalendarDays className="h-4 w-4" />{currentDate}</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading || refreshing} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-200 hover:text-[#7a2fbf] disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </header>

      {errors.stats && <ErrorMessage message={`No se pudieron cargar las métricas: ${errors.stats}`} />}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resumen de la plataforma</h2>
            <p className="mt-1 text-sm text-gray-500">Indicadores generales de TaskPro.</p>
          </div>
          <TrendingUp className="h-5 w-5 text-[#7a2fbf]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total de usuarios" value={stats.totalUsers.toLocaleString('es-MX')} description="Cuentas registradas" icon={Users} loading={loading} />
          <MetricCard title="Proveedores activos" value={stats.activeProviders.toLocaleString('es-MX')} description="Proveedores habilitados" icon={BriefcaseBusiness} loading={loading} />
          <MetricCard title="KYC pendientes" value={stats.pendingKyc.toLocaleString('es-MX')} description="Solicitudes por verificar" icon={ShieldCheck} loading={loading} accent />
          <MetricCard title="Ingresos por comisión" value={formatCurrency(stats.commissionRevenue)} description="Ingresos acumulados" icon={Wallet} loading={loading} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-bold text-gray-900">Actividad reciente</h2>
              <p className="mt-1 text-sm text-gray-500">Últimas cotizaciones de la plataforma.</p>
            </div>
            <Link to="/admin/quotes" className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a2fbf] hover:underline">Ver cotizaciones<ArrowRight className="h-4 w-4" /></Link>
          </div>
          {errors.quotes && <div className="p-5"><ErrorMessage message={errors.quotes} /></div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-6">Cliente</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Proveedor</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Monto</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>{Array.from({ length: 4 }).map((__, cell) => (<td key={cell} className="px-5 py-5 sm:px-6"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>))}</tr>
                  ))
                ) : errors.quotes ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">No fue posible cargar la actividad.</td></tr>
                ) : quotes.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center"><ClipboardList className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 font-semibold text-gray-700">Sin cotizaciones recientes</p></td></tr>
                ) : (
                  quotes.map((quote) => {
                    const providerName = quote.provider?.name ?? quote.service?.provider?.name ?? 'Sin proveedor';
                    return (
                      <tr key={quote.id} className="transition hover:bg-purple-50/40">
                        <td className="px-5 py-4 sm:px-6"><p className="font-semibold text-gray-900">{quote.client?.name ?? 'Sin cliente'}</p><p className="mt-1 text-xs text-gray-400">{quote.id}</p></td>
                        <td className="px-5 py-4"><p className="text-sm text-gray-700">{providerName}</p></td>
                        <td className="px-5 py-4"><span className="whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(quote.amount)}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(quote.status)}`}>{getStatusLabel(quote.status)}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
            <div className="border-b border-purple-100 bg-purple-50 px-5 py-5">
              <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-[#7a2fbf]" /><h2 className="font-bold text-gray-900">Tareas pendientes</h2></div>
              <p className="mt-1 text-sm text-gray-500">Acciones que requieren atención administrativa.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Verificación KYC</p>
                    <p className="mt-1 text-sm text-gray-600">{pendingKycCount === 1 ? 'Tienes 1 solicitud pendiente.' : `Tienes ${pendingKycCount} solicitudes pendientes.`}</p>
                  </div>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-amber-100 px-2 text-sm font-bold text-amber-700">{loading ? '—' : pendingKycCount}</span>
                </div>
                {errors.kyc && <p className="mt-2 text-xs text-red-600">{errors.kyc}</p>}
                <Link to="/admin" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7a2fbf] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6825a5]">Revisar solicitudes<ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}