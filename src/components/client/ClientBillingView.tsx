import { useEffect, useState } from 'react';
import { FileText, Loader2, DollarSign, CheckCircle2 } from 'lucide-react';
import { clientApi } from '../../services/clientApi';
import type { Quote } from '../../types/client.types';

const currency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

export default function ClientBillingView() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.getQuotes()
      .then((data) => setQuotes(data.filter((q) => q.status === 'COMPLETED' || q.status === 'CONFIRMED')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = quotes.filter((q) => q.status === 'COMPLETED').reduce((sum, q) => sum + Number(q.totalAmount), 0);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-[#7a2fbf]" size={40} /></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#7a2fbf]"><DollarSign size={18} /> FINANZAS</div>
        <h1 className="text-3xl font-bold text-[#252136]">Mis Pagos y Facturas</h1>
        <p className="text-[#777386] mt-1">Historial de servicios contratados y sus estados de pago.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Pagado</p>
            <p className="text-2xl font-bold text-[#252136]">{currency(totalPaid)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <FileText className="text-[#7a2fbf]" />
          <h2 className="text-lg font-bold text-[#252136]">Historial de Servicios</h2>
        </div>
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No tienes pagos registrados aún.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">#{String(q.id).slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{q.service?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{currency(Number(q.totalAmount))}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                      {q.status === 'COMPLETED' ? 'PAGADO' : 'POR PAGAR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}