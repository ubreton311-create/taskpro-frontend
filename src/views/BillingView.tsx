import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, BriefcaseBusiness, CalendarDays, CircleDollarSign, LoaderCircle, RefreshCw, TrendingUp, Wallet, ReceiptText, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PLATFORM_COMMISSION = 0.15;

export default function BillingView() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesión expirada.");
      const res = await fetch(`${API_URL}/quotes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error("No fue posible cargar el historial.");
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBilling(); }, [loadBilling]);

  const records = useMemo(() => {
    return quotes
      .filter((q) => q.status === "COMPLETED")
      .map((q) => {
        const gross = Number(q.totalAmount) || 0;
        return {
          id: q.id,
          date: q.createdAt,
          clientName: q.client?.name || "Cliente",
          gross,
          net: gross * (1 - PLATFORM_COMMISSION),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotes]);

  const totals = useMemo(() => {
    const gross = records.reduce((sum, r) => sum + r.gross, 0);
    return { gross, commission: gross * PLATFORM_COMMISSION, net: gross * (1 - PLATFORM_COMMISSION) };
  }, [records]);

  const formatCurrency = (val: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);
  const formatDate = (date: string) => new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#7A2FBF]"><CircleDollarSign className="h-4 w-4" /> Resumen financiero</div>
          <h1 className="text-3xl font-bold tracking-tight text-[#252136]">Mis ganancias</h1>
          <p className="mt-2 text-sm text-[#777386]">Consulta tus ingresos, comisiones e historial de trabajos terminados.</p>
        </div>
        <button onClick={loadBilling} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#E8E2F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#393448] shadow-sm hover:bg-purple-50 disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
        </button>
      </header>

      {error && <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={20} /> {error}</div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl border border-[#ECE7F2] bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7A2FBF] to-[#A56BDA]" />
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-[#777386]">Total Facturado</p><p className="mt-3 text-3xl font-bold text-[#252136]">{formatCurrency(totals.gross)}</p></div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-[#7A2FBF] flex items-center justify-center"><Banknote className="h-6 w-6" /></div>
          </div>
          <p className="mt-4 text-xs text-[#9691A4]">Ingresos brutos de trabajos terminados</p>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-[#ECE7F2] bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-[#777386]">Comisión TaskPro (15%)</p><p className="mt-3 text-3xl font-bold text-[#252136]">{formatCurrency(totals.commission)}</p></div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center"><TrendingUp className="h-6 w-6" /></div>
          </div>
          <p className="mt-4 text-xs text-[#9691A4]">15% del total facturado</p>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-[#ECE7F2] bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex justify-between items-start">
            <div><p className="text-sm font-medium text-[#777386]">Ganancia Neta</p><p className="mt-3 text-3xl font-bold text-[#252136]">{formatCurrency(totals.net)}</p></div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><Wallet className="h-6 w-6" /></div>
          </div>
          <p className="mt-4 text-xs text-[#9691A4]">Después de la comisión de plataforma</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#ECE7F2] bg-white shadow-sm">
        <div className="flex justify-between items-center border-b border-[#F0EDF4] p-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-[#7A2FBF] flex items-center justify-center"><ReceiptText className="h-5 w-5" /></div>
            <div><h2 className="text-lg font-bold text-[#252136]">Historial de trabajos</h2><p className="text-sm text-[#777386]">{records.length} trabajos completados</p></div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#7A2FBF]" /><p className="mt-4 text-sm text-[#777386]">Cargando...</p></div>
        ) : records.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#7A2FBF]"><Wallet className="h-8 w-8" /></div>
            <h3 className="mt-5 text-lg font-bold text-[#252136]">Aún no tienes ganancias registradas</h3>
            <p className="mt-2 max-w-sm text-sm text-[#777386]">Cuando completes trabajos, tus ganancias aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-[#FAF9FC] text-xs font-semibold uppercase tracking-wider text-[#898397]">
                  <th className="px-6 py-4">ID de orden</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 text-right">Monto bruto</th>
                  <th className="px-6 py-4 text-right">Monto neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF4]">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-[#FCFAFE]">
                    <td className="px-6 py-4"><span className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-[#7A2FBF]"><BriefcaseBusiness className="h-3.5 w-3.5" /> #{String(record.id).slice(-6).toUpperCase()}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-[#777386]"><CalendarDays className="h-4 w-4 text-[#A09BAC]" /> {formatDate(record.date)}</div></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-[#393448]">{record.clientName}</span></td>
                    <td className="px-6 py-4 text-right"><span className="text-sm font-medium text-[#393448]">{formatCurrency(record.gross)}</span></td>
                    <td className="px-6 py-4 text-right"><span className="text-sm font-bold text-emerald-700">{formatCurrency(record.net)}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#EAE4F0] bg-[#FAF9FC]">
                  <td colSpan={3} className="px-6 py-4 text-sm font-bold text-[#393448]">Total acumulado</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#252136]">{formatCurrency(totals.gross)}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-emerald-700">{formatCurrency(totals.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}