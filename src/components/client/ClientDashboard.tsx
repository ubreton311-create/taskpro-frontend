import { useEffect, useState } from 'react';
import { LayoutDashboard, Wallet, CalendarDays, BriefcaseBusiness, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { clientApi } from '../../services/clientApi';
import type { Quote, Booking, QuoteStatus } from '../../types/client.types';

interface ClientDashboardProps {
  onViewQuotes?: () => void;
  onPay?: (quoteId: string) => void;
}

const currency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700' },
};

export default function ClientDashboard({ onViewQuotes, onPay }: ClientDashboardProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [quotesData, bookingsData] = await Promise.all([
          clientApi.getQuotes(),
          clientApi.getBookings(),
        ]);
        if (!active) return;
        setQuotes(quotesData);
        setBookings(bookingsData);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, []);

  const now = new Date();
  const activeServices = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalSpent = bookings.filter((b) => b.status === 'COMPLETED').reduce((total, b) => total + b.totalAmount, 0);
  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.scheduledDate) >= now);
  
  const latestQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const kpis = [
    { title: 'Servicios activos', value: activeServices.toString(), description: 'Reservas confirmadas', icon: BriefcaseBusiness },
    { title: 'Total gastado', value: currency(totalSpent), description: 'Servicios completados', icon: Wallet },
    { title: 'Próximas citas', value: upcomingBookings.length.toString(), description: 'Reservas pendientes', icon: CalendarDays },
  ];

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#7a2fbf]" /></div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><AlertCircle className="mb-2 h-6 w-6" /><p className="font-semibold">No se pudo cargar el dashboard</p><p className="text-sm">{error}</p></div>;

  return (
    <div className="min-h-screen bg-[#f8f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#7a2fbf]"><LayoutDashboard size={20} /><span className="text-sm font-semibold">TASKPRO / CLIENTE</span></div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mi Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Administra tus servicios, pagos y cotizaciones.</p>
        </div>
        <button onClick={onViewQuotes} className="flex items-center gap-2 rounded-xl bg-[#7a2fbf] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#6524a5]">
          Ver cotizaciones <ArrowRight size={17} />
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-purple-50 p-3 text-[#7a2fbf]"><Icon size={23} /></div>
                <span className="text-xs font-medium text-gray-400">TASKPRO</span>
              </div>
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">{kpi.value}</h2>
              <p className="mt-2 text-xs text-gray-400">{kpi.description}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Últimas cotizaciones</h2>
            <p className="mt-1 text-sm text-gray-500">Consulta el estado de tus solicitudes.</p>
          </div>
          <button onClick={onViewQuotes} className="text-sm font-semibold text-[#7a2fbf] hover:underline">Ver todas →</button>
        </div>

        {latestQuotes.length === 0 ? (
          <div className="p-12 text-center"><BriefcaseBusiness className="mx-auto mb-3 text-gray-300" size={38} /><p className="font-semibold text-gray-700">Aún no tienes cotizaciones</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Importe</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestQuotes.map((quote) => {
                  const status = statusConfig[quote.status] || statusConfig.PENDING;
                  return (
                    <tr key={quote.id} className="transition hover:bg-purple-50/40">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {quote.service?.name || 'Servicio'} {/* CORRECCIÓN */}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quote.provider?.name || 'Por asignar'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(quote.createdAt).toLocaleDateString('es-MX')}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {currency(Number(quote.totalAmount) || 0)} {/* CORRECCIÓN */}
                      </td>
                      <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                      <td className="px-6 py-4">
                        {quote.status === 'CONFIRMED' && (
                          <button onClick={() => onPay?.(quote.id)} className="font-semibold text-[#7a2fbf] hover:underline">Pagar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}