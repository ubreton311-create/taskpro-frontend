import { useEffect, useState } from "react";
import { Users, BriefcaseBusiness, DollarSign, Clock, FileText, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/adminApi"; // Asegúrate de que esta ruta sea correcta
import { getCurrentUser } from "../../utils/auth";

export default function GlobalDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [stats, setStats] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Cargamos las métricas y las últimas cotizaciones en paralelo
        const [statsRes, quotesRes] = await Promise.all([
          adminApi.getStats(), // Asumiendo que tienes este método en adminApi
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/quotes`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json())
        ]);

        setStats(statsRes);
        setQuotes(Array.isArray(quotesRes) ? quotesRes.slice(0, 5) : []);
      } catch (err: any) {
        setError(err.message || "No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="animate-spin text-[#7a2fbf]" size={40} /></div>;
  if (error) return <div className="p-10 text-red-500"><AlertCircle /> {error}</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-[#252136] tracking-tight">
          Hola, {user?.name || "Administrador"}
        </h1>
        <p className="text-[#777386] mt-1">
          Bienvenido al centro de comando de TaskPro. Aquí tienes el resumen de hoy.
        </p>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-[#7a2fbf] flex items-center justify-center"><Users size={24} /></div>
          <div><p className="text-sm font-semibold text-gray-500">Usuarios Totales</p><p className="text-2xl font-bold text-[#252136]">{stats?.totalUsers || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BriefcaseBusiness size={24} /></div>
          <div><p className="text-sm font-semibold text-gray-500">Proveedores</p><p className="text-2xl font-bold text-[#252136]">{stats?.activeProviders || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={24} /></div>
          <div><p className="text-sm font-semibold text-gray-500">KYC Pendientes</p><p className="text-2xl font-bold text-[#252136]">{stats?.pendingKyc || 0}</p></div>
        </div>
        <div className="bg-gradient-to-br from-[#7a2fbf] to-[#64239f] p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center"><DollarSign size={24} /></div>
          <div><p className="text-sm font-semibold text-purple-100">Ingresos (Comisión)</p><p className="text-2xl font-bold">${stats?.commissionRevenue?.toFixed(2) || "0.00"}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Últimas Cotizaciones */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eeeaf5] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#eeeaf5] flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#252136]">Últimas Solicitudes</h2>
              <p className="text-sm text-gray-500">Actividad reciente en la plataforma.</p>
            </div>
            <button onClick={() => navigate('/admin')} className="text-sm font-semibold text-[#7a2fbf] hover:underline flex items-center gap-1">
              Ver todo <ArrowRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF9FC] text-xs font-semibold uppercase tracking-wider text-[#898397]">
                <tr>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF4]">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#252136]">{q.service?.name || "Servicio"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{q.provider?.name || "Por asignar"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${q.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#252136]">${Number(q.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Tareas Pendientes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#eeeaf5] shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FileText size={20} /></div>
              <h3 className="font-bold text-[#252136]">Acción Requerida</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tienes <strong className="text-amber-600">{stats?.pendingKyc || 0}</strong> solicitudes de verificación de identidad (KYC) esperando tu revisión.
            </p>
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7a2fbf] px-4 py-3 font-bold text-white shadow-md hover:bg-[#64239f] transition"
            >
              Revisar Expedientes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}